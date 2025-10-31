// public/js/portal-user.js
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
      userChip.textContent = `${u.username} • ${u.role}`;
    })
    .catch(() => { window.location.href = '/'; });

  // Router: swaps content without reloading shell
  function setActive(target) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
  }

  async function render(route) {
    if (route === 'dashboard') {
      content.innerHTML = `
        <section class="panel">
          <h2>Welcome back, ${currentUser?.username || 'User'}! 👋</h2>
          <p class="sub">Here's your dashboard overview</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 20px 0;">
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--success);">Account Status</h3>
              <div class="badge success">Active</div>
              <p class="sub" style="margin: 8px 0 0;">Your account is in good standing</p>
            </div>
            
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--accent);">Security Score</h3>
              <div style="font-size: 24px; font-weight: bold;">85/100</div>
              <p class="sub" style="margin: 8px 0 0;">Consider enabling 2FA for better security</p>
            </div>
            
            <div class="panel">
              <h3 style="margin: 0 0 8px; color: var(--warn);">Last Login</h3>
              <div style="font-size: 16px; font-weight: 600;">Just now</div>
              <p class="sub" style="margin: 8px 0 0;">From your current device</p>
            </div>
          </div>

          <div class="panel">
            <h3>Quick Actions</h3>
            <div class="toolbar">
              <button class="btn" id="change-pass-btn">🔒 Change Password</button>
              <button class="btn ghost" id="update-profile-btn">✏️ Update Profile</button>
              <button class="btn ghost" id="download-data-btn">📥 Download My Data</button>
            </div>
          </div>
        </section>
      `;
      bindDashboardActions();
    }
    
    if (route === 'profile') {
      content.innerHTML = `
        <section class="panel">
          <h2>My Profile</h2>
          <p class="sub">Manage your personal information</p>
          
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin: 20px 0;">
            <div class="panel">
              <div style="text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--success)); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px;">
                  ${currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 style="margin: 0;">${currentUser?.username || 'Username'}</h3>
                <p class="sub">${currentUser?.email || 'Email'}</p>
                <span class="badge ${currentUser?.role || 'user'}">${currentUser?.role?.toUpperCase() || 'USER'}</span>
              </div>
            </div>
            
            <div class="panel">
              <h3>Profile Information</h3>
              <div style="display: grid; gap: 12px;">
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Username</label>
                  <input class="input" type="text" value="${currentUser?.username || ''}" readonly />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Email Address</label>
                  <input class="input" type="email" value="${currentUser?.email || ''}" readonly />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Account Type</label>
                  <input class="input" type="text" value="${currentUser?.role?.toUpperCase() || 'USER'}" readonly />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 4px; color: var(--muted);">Member Since</label>
                  <input class="input" type="text" value="October 2025" readonly />
                </div>
              </div>
              <div class="toolbar" style="margin-top: 16px;">
                <button class="btn ghost">📝 Edit Profile</button>
                <button class="btn ghost">🔄 Sync Data</button>
              </div>
            </div>
          </div>
        </section>
      `;
    }
    
    if (route === 'security') {
      content.innerHTML = `
        <section class="panel">
          <h2>Security Settings</h2>
          <p class="sub">Protect your account with strong security measures</p>
          
          <div class="panel">
            <h3>Password Management</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 12px 0;">
              <div>
                <div style="font-weight: 600;">Current Password</div>
                <p class="sub">Last changed: Never</p>
              </div>
              <button class="btn" id="change-password-btn">Change Password</button>
            </div>
          </div>

          <div class="panel">
            <h3>Two-Factor Authentication</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 12px 0;">
              <div>
                <div style="font-weight: 600;">2FA Status: <span style="color: var(--warn);">Disabled</span></div>
                <p class="sub">Add extra security to your account</p>
              </div>
              <button class="btn ghost">Enable 2FA</button>
            </div>
          </div>

          <div class="panel">
            <h3>Login Sessions</h3>
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr><th>Device</th><th>Location</th><th>Last Active</th><th>Action</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🖥️ Current Device</td>
                    <td>Unknown</td>
                    <td>Active now</td>
                    <td><span class="badge success">Current</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      `;
      bindSecurityActions();
    }
    
    if (route === 'activity') {
      content.innerHTML = `
        <section class="panel">
          <h2>Activity Log</h2>
          <p class="sub">Track your recent account activity</p>
          
          <div class="panel">
            <h3>Recent Activities</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--soft); border-radius: 8px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--success); display: flex; align-items: center; justify-content: center;">✅</div>
                <div>
                  <div style="font-weight: 600;">Successful Login</div>
                  <p class="sub" style="margin: 0;">Just now • Current device</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--soft); border-radius: 8px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center;">👤</div>
                <div>
                  <div style="font-weight: 600;">Profile Viewed</div>
                  <p class="sub" style="margin: 0;">2 minutes ago</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--soft); border-radius: 8px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--warn); display: flex; align-items: center; justify-content: center;">⚡</div>
                <div>
                  <div style="font-weight: 600;">Account Created</div>
                  <p class="sub" style="margin: 0;">Today</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }
    
    if (route === 'help') {
      content.innerHTML = `
        <section class="panel">
          <h2>Help & Support</h2>
          <p class="sub">Get help and find answers to common questions</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 20px 0;">
            <div class="panel">
              <h3>📚 Knowledge Base</h3>
              <p class="sub">Browse our collection of helpful articles and guides</p>
              <button class="btn ghost">Browse Articles</button>
            </div>
            
            <div class="panel">
              <h3>💬 Contact Support</h3>
              <p class="sub">Get direct help from our support team</p>
              <button class="btn ghost">Send Message</button>
            </div>
            
            <div class="panel">
              <h3>🐛 Report Issue</h3>
              <p class="sub">Found a bug? Let us know so we can fix it</p>
              <button class="btn ghost">Report Bug</button>
            </div>
          </div>

          <div class="panel">
            <h3>Frequently Asked Questions</h3>
            <div style="display: grid; gap: 12px;">
              <details style="background: var(--soft); padding: 12px; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600;">How do I change my password?</summary>
                <p class="sub" style="margin: 8px 0 0;">Go to Security settings and click "Change Password" or use the quick action on your dashboard.</p>
              </details>
              
              <details style="background: var(--soft); padding: 12px; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600;">How do I enable two-factor authentication?</summary>
                <p class="sub" style="margin: 8px 0 0;">Visit the Security section and follow the 2FA setup wizard to secure your account.</p>
              </details>
              
              <details style="background: var(--soft); padding: 12px; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600;">Can I download my data?</summary>
                <p class="sub" style="margin: 8px 0 0;">Yes! Use the "Download My Data" button on your dashboard to export your account information.</p>
              </details>
            </div>
          </div>
        </section>
      `;
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

  // Dashboard actions
  function bindDashboardActions() {
    const changePassBtn = document.getElementById('change-pass-btn');
    const updateProfileBtn = document.getElementById('update-profile-btn');
    const downloadDataBtn = document.getElementById('download-data-btn');

    if (changePassBtn) changePassBtn.addEventListener('click', () => openPasswordModal());
    if (updateProfileBtn) updateProfileBtn.addEventListener('click', () => {
      document.querySelector('.menu-item[data-route="profile"]').click();
    });
    if (downloadDataBtn) downloadDataBtn.addEventListener('click', () => {
      alert('Data export feature coming soon!');
    });
  }

  // Security actions
  function bindSecurityActions() {
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => openPasswordModal());
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

  function openPasswordModal() {
    openModal('Change Password', `
      <div style="display: grid; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; color: var(--muted);">Current Password</label>
          <input class="input" type="password" id="current-password" placeholder="Enter current password" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; color: var(--muted);">New Password</label>
          <input class="input" type="password" id="new-password" placeholder="Enter new password" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; color: var(--muted);">Confirm New Password</label>
          <input class="input" type="password" id="confirm-password" placeholder="Confirm new password" />
        </div>
      </div>
      <div id="password-msg" class="sub" style="color: var(--muted); margin-top: 12px;"></div>
    `, `
      <button class="btn ghost" data-close="true">Cancel</button>
      <button class="btn success" id="save-password">Change Password</button>
    `);

    document.getElementById('save-password').addEventListener('click', async () => {
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const msg = document.getElementById('password-msg');

      if (!currentPassword || !newPassword || !confirmPassword) {
        msg.textContent = 'All fields are required';
        msg.style.color = 'var(--danger)';
        return;
      }

      if (newPassword !== confirmPassword) {
        msg.textContent = 'New passwords do not match';
        msg.style.color = 'var(--danger)';
        return;
      }

      if (newPassword.length < 6) {
        msg.textContent = 'New password must be at least 6 characters';
        msg.style.color = 'var(--danger)';
        return;
      }

      try {
        const res = await fetch('/api/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();

        if (res.ok) {
          msg.textContent = 'Password changed successfully!';
          msg.style.color = 'var(--success)';
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          msg.textContent = data.error || 'Failed to change password';
          msg.style.color = 'var(--danger)';
        }
      } catch (error) {
        msg.textContent = 'Network error. Please try again.';
        msg.style.color = 'var(--danger)';
      }
    });
  }

  // Initial route
  render('dashboard');
});

