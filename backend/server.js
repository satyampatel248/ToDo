const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());                     // Required for req.body
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/api/tasks", require("./routes/tasks"));  // tasks.js
app.use("/api/auth", require("./routes/auth"));    // auth.js (contains forgot-password)

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
app.listen(PORT, () => 
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);