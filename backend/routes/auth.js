const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");

// Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, username });
    }
  );
});

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username=?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(400).send("User not found");
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).send("Incorrect password");
      res.json({ id: user.id, username: user.username });
    }
  );
});

module.exports = router;