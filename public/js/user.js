// public/js/user.js
document.addEventListener('DOMContentLoaded', function() {
  loadUserInfo();
  
  const changePasswordForm = document.getElementById('change-password-form');
  changePasswordForm.addEventListener('submit', handlePasswordChange);
});

function loadUserInfo() {
  fetch('/api/user')
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        window.location.href = '/';
        return;
      }
      
      // Fixed spacing issue - use proper formatting
      document.getElementById('user-display').textContent = `Hello, ${data.username} - ${data.email}`;
      document.getElementById('profile-username').textContent = data.username;
      document.getElementById('profile-email').textContent = data.email;
      document.getElementById('profile-role').textContent = data.role;
    })
    .catch(error => {
      console.error('Error loading user info:', error);
      window.location.href = '/';
    });
}

function handlePasswordChange(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');
  
  const msgDiv = document.getElementById('password-msg');
  
  if (newPassword !== confirmPassword) {
    showMessage(msgDiv, 'New passwords do not match', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showMessage(msgDiv, 'New password must be at least 6 characters long', 'error');
    return;
  }
  
  fetch('/api/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword: currentPassword,
      newPassword: newPassword
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      showMessage(msgDiv, data.error, 'error');
    } else {
      showMessage(msgDiv, data.message, 'success');
      e.target.reset();
    }
  })
  .catch(error => {
    showMessage(msgDiv, 'Error changing password', 'error');
  });
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `msg ${type}`;
  setTimeout(() => {
    element.textContent = '';
    element.className = 'msg';
  }, 5000);
}

