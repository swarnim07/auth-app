// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('login-form');
  const feedback = document.getElementById('login-feedback');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const emailErr = document.getElementById('email-error');
  const passErr = document.getElementById('password-error');
  const togglePass = document.querySelector('.toggle-pass');

  togglePass.addEventListener('click', () => {
    const type = passInput.type === 'password' ? 'text' : 'password';
    passInput.type = type;
  });

  function clearErrors() {
    [emailErr, passErr, feedback].forEach(el => { el.textContent = ''; el.classList.remove('show','error','success'); });
    [emailInput, passInput].forEach(el => el.classList.remove('invalid'));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const email = emailInput.value.trim();
    const password = passInput.value;

    let valid = true;
    if (!email) { emailErr.textContent = 'Email is required'; emailInput.classList.add('invalid'); valid = false; }
    if (!password) { passErr.textContent = 'Password is required'; passInput.classList.add('invalid'); valid = false; }
    if (!valid) return;

    // AJAX login to stay on same page for errors
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();

      // If server redirects, fetch won't follow in SPA sense; detect via 200 + HTML
      if (res.ok) {
        // If server returned a redirect page, switch by checking URL via HEAD /api/user
        const who = await fetch('/api/user', { credentials: 'include' });
        if (who.status === 200) {
          const data = await who.json();
          window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
          return;
        }
      }

      // If server sent an error message body, show it inline
      feedback.textContent = text || 'Invalid email or password';
      feedback.classList.add('show', 'error');
    } catch (err) {
      feedback.textContent = 'Network error. Please try again.';
      feedback.classList.add('show', 'error');
    }
  });
});

