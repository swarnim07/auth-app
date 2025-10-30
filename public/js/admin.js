// public/js/admin.js
document.addEventListener('DOMContentLoaded', function() {
  loadUsers();
  
  const addUserForm = document.getElementById('add-user-form');
  addUserForm.addEventListener('submit', handleAddUser);
});

function loadUsers() {
  fetch('/api/users')
    .then(response => response.json())
    .then(users => {
      const tbody = document.querySelector('#users-table tbody');
      tbody.innerHTML = '';
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>
            <button class="btn danger" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error loading users:', error);
    });
}

function handleAddUser(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: 'user'
  };
  
  const msgDiv = document.getElementById('add-user-msg');
  
  fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      showMessage(msgDiv, data.error, 'error');
    } else {
      showMessage(msgDiv, data.message, 'success');
      e.target.reset();
      loadUsers(); // Refresh the users table
    }
  })
  .catch(error => {
    showMessage(msgDiv, 'Error adding user', 'error');
  });
}

function deleteUser(userId, username) {
  if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
    return;
  }
  
  fetch(`/api/users/${userId}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message);
      loadUsers(); // Refresh the users table
    }
  })
  .catch(error => {
    alert('Error deleting user');
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

