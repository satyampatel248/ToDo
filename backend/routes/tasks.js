const express = require("express");
const router = express.Router();
const db = require("../db");

// Get tasks for a user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  db.query(
    "SELECT * FROM tasks WHERE user_id=? ORDER BY position ASC",
    [userId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Add task
router.post("/", (req, res) => {
  const { user_id, title, due_date, priority, position } = req.body;
  db.query(
    "INSERT INTO tasks (user_id, title, due_date, priority, position) VALUES (?, ?, ?, ?, ?)",
    [user_id, title, due_date, priority, position || 0],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, user_id, title, due_date, priority, completed: 0, position });
    }
  );
});

// Update task (title, due_date, priority, completed, position)
router.put("/:id", (req, res) => {
  const { title, due_date, priority, completed, position } = req.body;
  db.query(
    "UPDATE tasks SET title=?, due_date=?, priority=?, completed=?, position=? WHERE id=?",
    [title, due_date, priority, completed, position, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Task updated" });
    }
  );
});

// Delete task
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM tasks WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Task deleted" });
  });
});

module.exports = router;