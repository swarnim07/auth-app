const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database/users.db');

// Session timeout settings
const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: { 
    maxAge: SESSION_TIMEOUT,
    httpOnly: true,
    secure: false // Set to true if using HTTPS
  }
}));

// Session timeout middleware
function checkSessionTimeout(req, res, next) {
  if (req.session.user) {
    const now = Date.now();
    if (req.session.lastActivity && (now - req.session.lastActivity) > SESSION_TIMEOUT) {
      req.session.destroy(() => {
        return res.status(401).json({ error: 'Session expired', redirect: '/' });
      });
      return;
    }
    req.session.lastActivity = now;
  }
  next();
}

// Apply session timeout check to all routes
app.use(checkSessionTimeout);

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied. Admin privileges required.');
  }
  next();
}

// Keepalive route for auto-logout script
app.get('/keepalive', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.session.lastActivity = Date.now();
  res.json({ status: 'alive', timestamp: req.session.lastActivity });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/signup.html'));
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const role = 'user'; // Default role

  db.run(`INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, 
    [username, email, hashedPassword, role], (err) => {
    if (err) {
      return res.send('❌ User already exists or error saving user.');
    }
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const isJSON = req.is('application/json');
  const { email, password } = isJSON ? req.body : req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    const invalid = () => {
      if (isJSON) return res.status(400).send('Invalid email or password');
      return res.send('❌ Invalid email or password');
    };
    if (err || !user) return invalid();

    if (bcrypt.compareSync(password, user.password)) {
      req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
      req.session.lastActivity = Date.now();
      if (isJSON) return res.status(200).send('OK');
      if (user.role === 'admin') res.redirect('/admin'); else res.redirect('/dashboard');
    } else {
      return invalid();
    }
  });
});

app.patch('/api/users/:id', requireAdmin, (req, res) => {
  const { toggleRole } = req.body || {};
  const id = parseInt(req.params.id,10);
  if (!toggleRole) return res.status(400).json({ error: 'Bad request' });

  db.get(`SELECT role FROM users WHERE id = ?`, [id], (err, u) => {
    if (err || !u) return res.status(404).json({ error: 'User not found' });
    const next = u.role === 'admin' ? 'user' : 'admin';
    db.run(`UPDATE users SET role = ? WHERE id = ?`, [next, id], function (e) {
      if (e) return res.status(500).json({ error: 'Failed to update role' });
      res.json({ message: 'Role updated', role: next });
    });
  });
});

// User Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '/views/user-dashboard.html'));
});

// Admin Dashboard
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '/views/admin.html'));
});

// API Routes for Admin

// Get all users
app.get('/api/users', requireAdmin, (req, res) => {
  db.all(`SELECT id, username, email, role FROM users`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add new user (Admin only)
app.post('/api/users', requireAdmin, (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(`INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, 
    [username, email, hashedPassword, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Error creating user' });
    }
    res.json({ 
      message: 'User created successfully', 
      userId: this.lastID 
    });
  });
});

// Delete user (Admin only)
app.delete('/api/users/:id', requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.session.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get user info API
app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    username: req.session.user.username,
    email: req.session.user.email,
    role: req.session.user.role
  });
});

// Change password
app.post('/api/change-password', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  db.get(`SELECT password FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    
    db.run(`UPDATE users SET password = ? WHERE id = ?`, 
      [hashedNewPassword, userId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating password' });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

// Replace the existing logout route in server.js with this:

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Session destroy error:', err);
    }
    res.redirect('/');
  });
});

// Add POST logout route for AJAX calls
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Session destroy error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});


// Server
app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));

