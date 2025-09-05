const API_URL = "http://localhost:5000/api"; // Backend URL
let currentUser = null;
let taskBeingEdited = null;

// ------------------- AUTH -------------------
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Username and password required!");

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    currentUser = await res.json();
    document.getElementById("usernameDisplay").innerText = currentUser.username;
    showTodoContainer();
    fetchTasks();
  } else {
    document.getElementById("authMessage").innerText = await res.text();
  }
}

async function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Username and password required!");

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

// Forgot Password
async function forgotPassword() {
  const username = prompt("Enter your username for password reset:");
  if (!username) return;
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  const data = await res.json();
  alert(data.message + "\nUse Reset Password function to update.");
}

// ------------------- TODO FUNCTIONS -------------------
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  renderTasks(tasks);
}

async function fetchCompletedTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  const completed = tasks.filter(t => t.completed);
  renderTasks(completed);
}

async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const due_date = document.getElementById("taskDue").value;
  const priority = document.getElementById("taskPriority").value;
  if (!title) return alert("Task title required!");

  await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: currentUser.id, title, due_date, priority })
  });

  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDue").value = "";
  toggleAddTaskMenu();
  fetchTasks();
}

// ------------------- EDIT TASK -------------------
function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // for <input type="date">
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function openEditTaskModal(task) {
  taskBeingEdited = task;
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDue").value = formatDateForInput(task.due_date);
  document.getElementById("editTaskPriority").value = task.priority || "Medium";
  document.getElementById("editTaskContainer").style.display = "flex";
}

function closeEditTaskModal() {
  document.getElementById("editTaskContainer").style.display = "none";
  taskBeingEdited = null;
}

async function saveEditedTask() {
  if (!taskBeingEdited) return;
  const updatedTitle = document.getElementById("editTaskTitle").value.trim();
  const updatedDue = document.getElementById("editTaskDue").value;
  const updatedPriority = document.getElementById("editTaskPriority").value;
  if (!updatedTitle) return alert("Task title required!");

  await fetch(`${API_URL}/tasks/${taskBeingEdited.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: updatedTitle, due_date: updatedDue, priority: updatedPriority })
  });

  closeEditTaskModal();
  fetchTasks();
}

// ------------------- TOGGLE COMPLETE -------------------
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

// ------------------- DRAG & DROP -------------------
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

// ------------------- RENDER TASKS -------------------
function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.id = task.id;
    li.className = task.completed ? "completed" : "";

    li.innerHTML = `
      <span><strong>${task.title}</strong> [${task.priority}] <em>${task.due_date ? formatDateDisplay(task.due_date) : ""}</em></span>
      <div>
        <button onclick="toggleComplete(${task.id}, ${!task.completed})">✔</button>
        <button onclick='openEditTaskModal(${JSON.stringify(task)})'>✏️</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;

    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);

    list.appendChild(li);
  });
}

// ------------------- UI TOGGLES -------------------
function showTodoContainer() {
  document.getElementById("authContainer").style.display = "none";
  document.getElementById("todoContainer").style.display = "block";
}

function toggleAddTaskMenu() {
  const addTask = document.getElementById("addTaskContainer");
  addTask.style.display = addTask.style.display === "flex" ? "none" : "flex";
}

function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}