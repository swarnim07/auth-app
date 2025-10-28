const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database/users.db');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

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

  db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashedPassword], (err) => {
    if (err) {
      return res.send('❌ User already exists or error saving user.');
    }
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.send('❌ Invalid email or password');

    if (bcrypt.compareSync(password, user.password)) {
      req.session.user = { id: user.id, username: user.username, email: user.email };
      res.redirect('/dashboard');
    } else {
      res.send('❌ Invalid email or password');
    }
  });
});


app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const username = req.session.user.username;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard | Simple Auth App</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="dashboard">
        <h2>👋 Welcome, ${username}!</h2>
        <p>You have successfully logged in. Here’s your personalized dashboard:</p>
        
        <div class="card">
          <h3>📄 Profile Overview</h3>
          <p>Manage your personal details and security settings.</p>
        </div>

        <div class="card">
          <h3>📊 Your Analytics</h3>
          <p>See your recent activity and trends (coming soon!).</p>
        </div>

        <div class="card">
          <h3>🎯 Goals & Progress</h3>
          <p>Track your milestones and achievements.</p>
        </div>

        <form action="/logout" method="GET">
          <button class="logout-btn">Logout</button>
        </form>
      </div>
    </body>
    </html>
  `);
});


app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Server
app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));

