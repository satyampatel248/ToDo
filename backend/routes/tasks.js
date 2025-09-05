const express = require("express");
const router = express.Router();
const db = require("../db");

// --- GET TASKS FOR USER ---
router.get("/:userId", (req, res) => {
  const sql = "SELECT * FROM tasks WHERE user_id=? ORDER BY position ASC";
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

// --- CREATE TASK ---
router.post("/", (req, res) => {
  const { user_id, title, due_date, priority } = req.body;
  const sql = "INSERT INTO tasks (user_id, title, due_date, priority) VALUES (?,?,?,?)";
  db.query(sql, [user_id, title, due_date, priority], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.json({ id: result.insertId });
  });
});

// --- UPDATE TASK ---
router.put("/:id", (req, res) => {
  const updates = req.body;
  const id = req.params.id;
  const fields = Object.keys(updates).map(key => `${key}=?`).join(", ");
  const values = Object.values(updates);
  values.push(id);

  const sql = `UPDATE tasks SET ${fields} WHERE id=?`;
  db.query(sql, values, (err) => {
    if (err) return res.status(500).send(err.message);
    res.send("Task updated");
  });
});

// --- DELETE TASK ---
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM tasks WHERE id=?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.send("Task deleted");
  });
});

module.exports = router;