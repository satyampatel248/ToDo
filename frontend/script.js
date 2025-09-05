const API_URL = "http://localhost:5000/api";
let currentUser = null;

// --- AUTH ---
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    document.getElementById("authMessage").innerText = "Username & password required";
    return;
  }
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (res.ok) {
    currentUser = await res.json();
    showTodoContainer();
    fetchTasks();
  } else {
    document.getElementById("authMessage").innerText = await res.text();
  }
}

async function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    document.getElementById("authMessage").innerText = "Username & password required";
    return;
  }
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (res.ok) {
    document.getElementById("authMessage").innerText = "Signup successful! Login now.";
  } else {
    document.getElementById("authMessage").innerText = await res.text();
  }
}

function logout() {
  currentUser = null;
  document.getElementById("authContainer").style.display = "flex";
  document.getElementById("todoContainer").style.display = "none";
}

// --- TODO FUNCTIONS ---
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  renderTasks(tasks);
}

async function fetchCompletedTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  renderTasks(tasks.filter(t => t.completed));
}

async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const due_date = document.getElementById("taskDue").value;
  const priority = document.getElementById("taskPriority").value;
  if (!title) return alert("Task title required");
  await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: currentUser.id, title, due_date, priority })
  });
  document.getElementById("taskTitle").value = "";
  toggleAddTaskMenu();
  fetchTasks();
}

async function updateTask(taskId, currentTitle) {
  const newTitle = prompt("Edit title:", currentTitle);
  if (!newTitle) return;
  await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle })
  });
  fetchTasks();
}

async function toggleComplete(taskId, completed) {
  await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  fetchTasks();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  fetchTasks();
}

// --- DRAG & DROP ---
let draggedItem = null;
function dragStart(e) { draggedItem = e.target; }
function dragOver(e) { e.preventDefault(); }
function drop(e) {
  e.preventDefault();
  if (draggedItem && e.target.tagName === "LI") {
    const list = document.getElementById("taskList");
    list.insertBefore(draggedItem, e.target.nextSibling);
    saveOrder();
  }
}

async function saveOrder() {
  const lis = document.querySelectorAll("#taskList li");
  for (let i = 0; i < lis.length; i++) {
    const id = lis[i].dataset.id;
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: i })
    });
  }
}

// --- RENDER TASKS ---
function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.id = task.id;
    li.className = task.completed ? "completed" : "";

    li.innerHTML = `
      <span><strong>${task.title}</strong> [${task.priority}] <em>${task.due_date || ""}</em></span>
      <div>
        <button onclick="toggleComplete(${task.id}, ${!task.completed})">✔</button>
        <button onclick="updateTask(${task.id}, '${task.title.replace(/'/g, "\\'")}')">✏️</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;

    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);

    list.appendChild(li);
  });
}

// --- SHOW TODO AFTER LOGIN ---
function showTodoContainer() {
  document.getElementById("authContainer").style.display = "none";
  document.getElementById("todoContainer").style.display = "flex";
  document.getElementById("usernameDisplay").innerText = currentUser.username;
}

// --- ADD TASK MODULE TOGGLE ---
function toggleAddTaskMenu() {
  const container = document.getElementById("addTaskContainer");
  container.style.display = container.style.display === "flex" ? "none" : "flex";
}

function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

// Optional: hide dropdown when clicking outside
window.addEventListener("click", function(e) {
  const dropdown = document.getElementById("userDropdown");
  const button = document.getElementById("usernameDisplay");
  if (!button.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});

async function forgotPassword() {
  const username = prompt("Enter your username to reset password:");
  if (!username) return;

  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  if (res.ok) {
    const data = await res.json();
    const newPassword = prompt(`Enter new password for user "${username}":`);
    if (!newPassword) return;

    const resetRes = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.userId, newPassword })
    });

    if (resetRes.ok) alert("Password reset successfully! Please login.");
    else alert(await resetRes.text());
  } else {
    alert(await res.text());
  }
}