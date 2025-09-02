const mysql = require("mysql2");

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // change if needed
  password: "password",      // your MySQL password
  database: "ToDo"   // your DB name
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed: " + err.stack);
    return;
  }
  console.log("✅ Connected to MySQL Database.");
});

module.exports = db;