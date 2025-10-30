// user.js - change password logic for the user dashboard
async function api(path, opts={}){
  opts.credentials = 'include';
  opts.headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
    opts.headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, opts);
  return res;
}
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const meRes = await api('/api/me');
    if (meRes.ok) {
      const me = await meRes.json();
      if (me && me.username) {
        document.getElementById('username').textContent = me.username;
        document.getElementById('email').textContent = ' — ' + me.email;
      }
    }
  } catch(e){ /* ignore */ }
  const form = document.getElementById('change-password-form');
  const msg = document.getElementById('change-pw-msg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent=''; msg.className='msg';
    const oldPassword = form.oldPassword.value;
    const newPassword = form.newPassword.value;
    if (!oldPassword || !newPassword){ msg.textContent='Fill both fields'; msg.classList.add('error'); return; }
    const res = await api('/change-password', { method:'POST', body: { oldPassword, newPassword } });
    if (res.ok){ msg.textContent='Password changed'; msg.classList.add('success'); form.reset(); }
    else { msg.textContent = 'Error: ' + await res.text(); msg.classList.add('error'); }
  });
});
