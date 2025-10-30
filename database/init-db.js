// database/init-db.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./database/users.db');

db.serialize(() => {
  // Create users table with role column
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )`);

  // Add role column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding role column:', err.message);
    }
  });

  // Create default admin user with your custom email
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['admin', 'abc@gmail.com', adminPassword, 'admin'], (err) => {
    if (err) {
      console.log('Admin user already exists or error creating admin');
    } else {
      console.log('✅ Default admin user created: abc@gmail.com / admin123');
    }
  });

  // Update existing admin email if it exists with different email
  db.run(`UPDATE users SET email = ? WHERE role = 'admin' AND email != ?`, 
    ['abc@gmail.com', 'abc@gmail.com'], function(err) {
    if (err) {
      console.log('Error updating admin email:', err.message);
    } else if (this.changes > 0) {
      console.log('✅ Admin email updated to: abc@gmail.com');
    }
  });
});

db.close();
console.log("✅ Database initialized successfully.");

