// admin.js - client logic for admin page
// Fetch list of users, add user, delete user.

async function api(path, opts={}) {
  opts.credentials = 'include';
  opts.headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
    opts.headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, opts);
  return res;
}

function $qs(sel){ return document.querySelector(sel) }
function $qsa(sel){ return document.querySelectorAll(sel) }

async function loadUsers(){
  const tbody = $qs('#users-table tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  const res = await api('/api/users', { method: 'GET' });
  if (!res.ok){ tbody.innerHTML = '<tr><td colspan="4">Failed to load</td></tr>'; return; }
  const users = await res.json();
  if (!users || users.length === 0){ tbody.innerHTML = '<tr><td colspan="4">No users found</td></tr>'; return; }
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>
        <button class="delete-btn" data-id="${u.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function addUser(form){
  const msg = $qs('#add-user-msg');
  msg.textContent = ''; msg.className='msg';
  const data = {
    username: form.username.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value
  };
  if (!data.username || !data.email || !data.password){ msg.textContent='Please fill all fields'; msg.classList.add('error'); return; }
  const res = await api('/api/users', { method:'POST', body: data });
  if (res.ok){
    msg.textContent = 'User added'; msg.classList.add('success');
    form.reset();
    loadUsers();
  } else {
    const text = await res.text();
    msg.textContent = 'Error: ' + text; msg.classList.add('error');
  }
}

async function deleteUser(id){
  if (!confirm('Delete user #' + id + '?')) return;
  const res = await api('/api/users/' + id, { method: 'DELETE' });
  if (res.ok){ loadUsers(); } else {
    alert('Failed to delete: ' + await res.text());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();

  $qs('#add-user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addUser(e.target);
  });

  $qs('#users-table').addEventListener('click', (e) => {
    if (e.target.matches('.delete-btn')){
      const id = e.target.dataset.id;
      deleteUser(id);
    }
  });
});
