// database/update-admin.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.serialize(() => {
  // Update the role of user with email abc@gmail.com to admin
  db.run(`UPDATE users SET role = 'admin' WHERE email = ?`, 
    ['abc@gmail.com'], function(err) {
    if (err) {
      console.log('❌ Error updating user role:', err.message);
    } else if (this.changes > 0) {
      console.log('✅ Successfully updated abc@gmail.com role to admin');
    } else {
      console.log('❌ No user found with email abc@gmail.com');
    }
  });

  // Verify the update
  db.get(`SELECT username, email, role FROM users WHERE email = ?`, 
    ['abc@gmail.com'], (err, user) => {
    if (err) {
      console.log('❌ Error checking user:', err.message);
    } else if (user) {
      console.log(`✅ Current user details: ${user.username} | ${user.email} | ${user.role}`);
    } else {
      console.log('❌ User not found');
    }
  });
});

db.close();

