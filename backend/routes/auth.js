const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

// --- SIGNUP ---
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Username and password are required");

  const hash = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, hash], (err, result) => {
    if (err) return res.status(500).send("Username already exists");
    res.send("Signup successful");
  });
});

// --- LOGIN ---
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Username and password are required");

  const sql = "SELECT * FROM users WHERE username=?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).send(err.message);
    if (results.length === 0) return res.status(404).send("User not found");

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).send("Invalid password");

    res.json({ id: results[0].id, username: results[0].username });
  });
});

// --- FORGOT PASSWORD ---
router.post("/forgot-password", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).send("Username is required");

  const sql = "SELECT id FROM users WHERE username=?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).send(err.message);
    if (results.length === 0) return res.status(404).send("User not found");

    // Demo: return userId (production should email a reset token)
    res.json({ message: "User found. Proceed to reset password.", userId: results[0].id });
  });
});

// --- RESET PASSWORD ---
router.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) return res.status(400).send("User ID and new password required");

  const hash = await bcrypt.hash(newPassword, 10);
  const sql = "UPDATE users SET password=? WHERE id=?";
  db.query(sql, [hash, userId], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send("Password updated successfully");
  });
});

module.exports = router;