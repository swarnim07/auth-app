// public/js/portal.js
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menu = document.querySelector('.menu');
  const content = document.getElementById('content');
  const toggleSidebar = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const userChip = document.getElementById('user-chip');
  let currentUser = null;

  // Load current user
  fetch('/api/user', { credentials: 'include' })
    .then(r => r.json())
    .then(u => {
      currentUser = u;
      userChip.textContent = `${u.username} • Admin`;
    })
    .catch(() => { window.location.href = '/'; });

  // Simple router: swaps content without reloading shell
  function setActive(target) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
  }

  async function render(route) {
    if (route === 'overview') {
      content.innerHTML = `
        <section class="panel">
          <h2>Admin Overview 📊</h2>
          <p class="sub">Dashboard metrics and system insights</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 20px 0;">
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--success);">👥 Total Users</h3>
              <div style="font-size: 32px; font-weight: bold;" id="total-users">-</div>
              <p class="sub" style="margin: 8px 0 0;">Active accounts</p>
            </div>
            
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--accent);">⚡ Admin Users</h3>
              <div style="font-size: 32px; font-weight: bold;" id="admin-count">-</div>
              <p class="sub" style="margin: 8px 0 0;">Administrative privileges</p>
            </div>
            
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--warn);">📈 Growth</h3>
              <div style="font-size: 32px; font-weight: bold; color: var(--success);">+12%</div>
              <p class="sub" style="margin: 8px 0 0;">This month</p>
            </div>
            
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--danger);">⏰ Active Sessions</h3>
              <div style="font-size: 32px; font-weight: bold;" id="active-sessions">-</div>
              <p class="sub" style="margin: 8px 0 0;">Currently online</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
            <div class="panel">
              <h3>📋 Quick Actions</h3>
              <div class="toolbar">
                <button class="btn success" id="quick-add-user">+ Add User</button>
                <button class="btn ghost" id="export-users">📤 Export Users</button>
                <button class="btn ghost" id="system-backup">💾 Backup System</button>
                <button class="btn warn" id="maintenance-mode">⚠️ Maintenance</button>
              </div>
            </div>
            
            <div class="panel">
              <h3>🔔 Recent Activity</h3>
              <div id="recent-activity" style="display: grid; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--success);"></div>
                  <span>User logged in</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent);"></div>
                  <span>New user registered</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--warn);"></div>
                  <span>Password changed</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
      loadOverview();
    }
    
    if (route === 'users') {
      content.innerHTML = `
        <section class="panel">
          <h2>👥 User Management</h2>
          <p class="sub">Create, view, edit and manage all user accounts</p>
          
          <div class="toolbar">
            <input class="input" id="search" placeholder="🔍 Search users by name, email or role..." style="min-width: 300px;" />
            <select class="input" id="role-filter" style="width: 120px;">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <button class="btn success" id="add-user">+ Add New User</button>
            <button class="btn ghost" id="bulk-actions">⚙️ Bulk Actions</button>
          </div>
          
          <div class="panel">
            <div style="overflow-x: auto;">
              <table class="table" id="users-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" id="select-all" /></th>
                    <th>ID</th>
                    <th>👤 User</th>
                    <th>📧 Email</th>
                    <th>🏷️ Role</th>
                    <th>📅 Created</th>
                    <th>🔧 Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </section>
      `;
      bindUsers();
    }
    
    if (route === 'analytics') {
      content.innerHTML = `
        <section class="panel">
          <h2>📊 Analytics Dashboard</h2>
          <p class="sub">Detailed insights and usage statistics</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin: 20px 0;">
            <div class="panel">
              <h3>📈 User Growth</h3>
              <div style="height: 120px; background: linear-gradient(45deg, var(--accent)22, transparent); border-radius: 8px; display: flex; align-items: end; justify-content: center; color: var(--muted); font-size: 14px;">
                Chart coming soon...
              </div>
            </div>
            
            <div class="panel">
              <h3>🔐 Login Statistics</h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Today:</span> <strong>24</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>This Week:</span> <strong>156</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>This Month:</span> <strong>642</strong>
                </div>
              </div>
            </div>
            
            <div class="panel">
              <h3>⚡ System Health</h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Server Status:</span> 
                  <span class="badge success">Online</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Uptime:</span> <strong>99.9%</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Response Time:</span> <strong>45ms</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>📱 Device & Browser Analytics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div>
                <h4 style="margin: 0 0 8px;">Top Devices</h4>
                <div style="display: grid; gap: 4px; font-size: 14px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>🖥️ Desktop</span> <span>65%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>📱 Mobile</span> <span>30%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>📟 Tablet</span> <span>5%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style="margin: 0 0 8px;">Top Browsers</h4>
                <div style="display: grid; gap: 4px; font-size: 14px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>🌐 Chrome</span> <span>58%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>🦊 Firefox</span> <span>23%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>🧭 Safari</span> <span>19%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }
    
    if (route === 'settings') {
      content.innerHTML = `
        <section class="panel">
          <h2>⚙️ System Settings</h2>
          <p class="sub">Configure application preferences and security</p>
          
          <div style="display: grid; gap: 16px;">
            <div class="panel">
              <h3>🏢 Organization Settings</h3>
              <div style="display: grid; gap: 12px;">
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Organization Name</label>
                  <input class="input" type="text" value="Auth App Inc." />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Website URL</label>
                  <input class="input" type="url" value="https://authapp.com" />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Contact Email</label>
                  <input class="input" type="email" value="admin@authapp.com" />
                </div>
              </div>
            </div>

            <div class="panel">
              <h3>🔐 Security Policies</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600;">Require Strong Passwords</div>
                    <p class="sub" style="margin: 0;">Minimum 8 characters with special symbols</p>
                  </div>
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" checked /> Enabled
                  </label>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600;">Two-Factor Authentication</div>
                    <p class="sub" style="margin: 0;">Require 2FA for all admin accounts</p>
                  </div>
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" /> Enforce
                  </label>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600;">Session Timeout</div>
                    <p class="sub" style="margin: 0;">Auto-logout after inactivity</p>
                  </div>
                  <select class="input" style="width: 120px;">
                    <option value="2">2 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="panel">
              <h3>📧 Email Configuration</h3>
              <div style="display: grid; gap: 12px;">
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">SMTP Server</label>
                  <input class="input" type="text" placeholder="smtp.gmail.com" />
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <label style="display: block; margin-bottom: 4px; color: var(--muted);">Port</label>
                    <input class="input" type="number" value="587" />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 4px; color: var(--muted);">Encryption</label>
                    <select class="input">
                      <option>TLS</option>
                      <option>SSL</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel">
              <h3>🛠️ System Maintenance</h3>
              <div class="toolbar">
                <button class="btn ghost">🔄 Clear Cache</button>
                <button class="btn ghost">📊 Generate Report</button>
                <button class="btn ghost">💾 Database Backup</button>
                <button class="btn warn">🚧 Maintenance Mode</button>
                <button class="btn danger">🔄 Restart System</button>
              </div>
            </div>

            <div style="text-align: right; margin-top: 20px;">
              <button class="btn ghost" style="margin-right: 10px;">Reset to Defaults</button>
              <button class="btn success">💾 Save All Settings</button>
            </div>
          </div>
        </section>
      `;
      bindSettings();
    }
  }

  // Sidebar toggle for mobile
  toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Menu routing
  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-item');
    if (!btn) return;
    const route = btn.getAttribute('data-route');
    setActive(btn);
    render(route);
    if (window.innerWidth < 700) sidebar.classList.remove('open');
  });

  // Initial route
  render('overview');

  // Overview functionality
  function loadOverview() {
    const totalUsersEl = document.getElementById('total-users');
    const adminCountEl = document.getElementById('admin-count');
    const activeSessionsEl = document.getElementById('active-sessions');

    Promise.all([
      fetch('/api/users', { credentials:'include' }).then(r=>r.json()),
      fetch('/api/user', { credentials:'include' }).then(r=>r.json())
    ]).then(([users, me]) => {
      const admins = users.filter(u => u.role === 'admin').length;
      totalUsersEl.textContent = users.length;
      adminCountEl.textContent = admins;
      activeSessionsEl.textContent = Math.floor(Math.random() * 10) + 1; // Mock data
    }).catch(() => {
      totalUsersEl.textContent = 'Error';
      adminCountEl.textContent = 'Error';
      activeSessionsEl.textContent = 'Error';
    });

    // Bind quick actions
    document.getElementById('quick-add-user')?.addEventListener('click', () => openAddUserModal());
    document.getElementById('export-users')?.addEventListener('click', () => alert('Export feature coming soon!'));
    document.getElementById('system-backup')?.addEventListener('click', () => alert('Backup initiated!'));
    document.getElementById('maintenance-mode')?.addEventListener('click', () => alert('Maintenance mode toggled!'));
  }

  // Users page logic
  function bindUsers() {
    const tbody = document.querySelector('#users-table tbody');
    const search = document.getElementById('search');
    const roleFilter = document.getElementById('role-filter');
    const selectAll = document.getElementById('select-all');
    
    document.getElementById('add-user').addEventListener('click', () => openAddUserModal());
    document.getElementById('bulk-actions')?.addEventListener('click', () => openBulkActionsModal());

    async function load() {
      const users = await fetch('/api/users', { credentials:'include' }).then(r=>r.json());
      const q = search.value.trim().toLowerCase();
      const roleQ = roleFilter.value;
      tbody.innerHTML = '';
      
      users
        .filter(u => (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (!roleQ || u.role === roleQ))
        .forEach((u, i) => {
          const tr = document.createElement('tr');
          const avatar = u.username.charAt(0).toUpperCase();
          const createdDate = new Date().toLocaleDateString(); // Mock date
          
          tr.innerHTML = `
            <td><input type="checkbox" class="user-select" data-id="${u.id}" /></td>
            <td>${u.id}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--success)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                  ${avatar}
                </div>
                <div>
                  <div style="font-weight: 600;">${u.username}</div>
                </div>
              </div>
            </td>
            <td>${u.email}</td>
            <td><span class="badge ${u.role}">${u.role.toUpperCase()}</span></td>
            <td>${createdDate}</td>
            <td>
              <div style="display: flex; gap: 4px;">
                <button class="btn small ghost" data-act="edit" data-id="${u.id}" title="Edit User">✏️</button>
                <button class="btn small ghost" data-act="role" data-id="${u.id}" data-role="${u.role}" title="Toggle Role">🔄</button>
                <button class="btn small danger" data-act="del" data-id="${u.id}" title="Delete User">🗑️</button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
    }

    // Select all functionality
    selectAll.addEventListener('change', (e) => {
      document.querySelectorAll('.user-select').forEach(cb => {
        cb.checked = e.target.checked;
      });
    });

    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const act = btn.getAttribute('data-act');

      if (act === 'del') {
        if (!confirm('Delete this user? This action cannot be undone.')) return;
        const res = await fetch(`/api/users/${id}`, { method:'DELETE', credentials:'include' });
        const j = await res.json();
        if (res.ok) {
          load();
          showNotification('User deleted successfully', 'success');
        } else {
          showNotification(j.error || 'Delete failed', 'error');
        }
      }
      
      if (act === 'role') {
        const res = await fetch(`/api/users/${id}`, {
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          credentials:'include',
          body: JSON.stringify({ toggleRole: true })
        });
        const j = await res.json();
        if (res.ok) {
          load();
          showNotification('Role updated successfully', 'success');
        } else {
          showNotification(j.error || 'Update failed', 'error');
        }
      }

      if (act === 'edit') {
        openEditUserModal(id);
      }
    });

    search.addEventListener('input', load);
    roleFilter.addEventListener('change', load);
    load();
  }

  // Settings functionality
  function bindSettings() {
    const saveBtn = document.querySelector('button.success');
    saveBtn?.addEventListener('click', () => {
      showNotification('Settings saved successfully!', 'success');
    });
  }

  // Modal helpers
  const modal = document.getElementById('modal');
  function openModal(title, bodyHTML, footHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-foot').innerHTML = footHTML || '';
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }
  modal.addEventListener('click',(e)=>{ if(e.target.dataset.close==='true') closeModal(); });

  function openAddUserModal() {
    openModal('Add New User', `
      <div style="display: grid; gap: 12px;">
        <div class="form-row">
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 4px; color: var(--muted);">Username</label>
            <input class="input" type="text" id="new-username" placeholder="Enter username" />
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 4px; color: var(--muted);">Email</label>
            <input class="input" type="email" id="new-email" placeholder="Enter email address" />
          </div>
        </div>
        <div class="form-row">
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 4px; color: var(--muted);">Password</label>
            <input class="input" type="password" id="new-password" placeholder="Create password" />
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 4px; color: var(--muted);">Role</label>
            <select class="input" id="new-role">
              <option value="user">👤 User</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
        </div>
      </div>
      <div id="add-msg" class="sub" style="color: var(--muted); margin-top: 12px;"></div>
    `, `
      <button class="btn ghost" data-close="true">Cancel</button>
      <button class="btn success" id="save-user">✅ Create User</button>
    `);

    document.getElementById('save-user').addEventListener('click', async () => {
      const username = document.getElementById('new-username').value.trim();
      const email = document.getElementById('new-email').value.trim();
      const password = document.getElementById('new-password').value;
      const role = document.getElementById('new-role').value;
      const msg = document.getElementById('add-msg');

      if (!username || !email || !password) {
        msg.textContent = 'All fields are required';
        msg.style.color = 'var(--danger)';
        return;
      }
      
      const res = await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({username,email,password,role})});
      const j = await res.json();
      if (res.ok) {
        msg.textContent = 'User created successfully!';
        msg.style.color = 'var(--success)';
        setTimeout(()=>{ 
          closeModal(); 
          document.querySelector('.menu-item[data-route="users"]').click();
          showNotification('New user created successfully!', 'success');
        }, 700);
      } else {
        msg.textContent = j.error || 'Failed to create user';
        msg.style.color = 'var(--danger)';
      }
    });
  }

  function openBulkActionsModal() {
    const selectedUsers = Array.from(document.querySelectorAll('.user-select:checked')).map(cb => cb.dataset.id);
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    openModal(`Bulk Actions (${selectedUsers.length} users selected)`, `
      <div style="display: grid; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; color: var(--muted);">Action</label>
          <select class="input" id="bulk-action">
            <option value="">Select action...</option>
            <option value="role-user">Change role to User</option>
            <option value="role-admin">Change role to Admin</option>
            <option value="delete">Delete selected users</option>
            <option value="export">Export user data</option>
          </select>
        </div>
      </div>
      <div id="bulk-msg" class="sub" style="color: var(--muted); margin-top: 12px;"></div>
    `, `
      <button class="btn ghost" data-close="true">Cancel</button>
      <button class="btn warn" id="apply-bulk">Apply Action</button>
    `);

    document.getElementById('apply-bulk').addEventListener('click', () => {
      const action = document.getElementById('bulk-action').value;
      if (!action) {
        document.getElementById('bulk-msg').textContent = 'Please select an action';
        return;
      }
      
      alert(`Bulk action "${action}" would be applied to ${selectedUsers.length} users`);
      closeModal();
    });
  }

  // Notification system
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1000;
      background: var(--${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'accent'});
      color: white; padding: 12px 16px; border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transform: translateX(400px); transition: transform 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
});

