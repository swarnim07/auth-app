// database/init-db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`);
});

db.close();
console.log("✅ Database initialized successfully.");

