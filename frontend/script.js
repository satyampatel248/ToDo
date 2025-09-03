const API_URL = "http://localhost:5000/api";  // ✅ make it absolute for frontend

let currentUser = null;

// --- AUTH ---
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
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
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
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
  document.getElementById("authContainer").style.display = "block";
  document.getElementById("todoContainer").style.display = "none";
}

// --- TODO FUNCTIONS ---
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  renderTasks(tasks);
}

async function addTask() {
  const title = document.getElementById("taskTitle").value;
  const due_date = document.getElementById("taskDue").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title) return alert("Task title required!");

  await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: currentUser.id, title, due_date, priority })
  });

  document.getElementById("taskTitle").value = "";
  fetchTasks();
}

async function updateTask(taskId, currentTitle) {
  const newTitle = prompt("Edit title:", currentTitle);
  if (newTitle === null) return;

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

// --- DRAG AND DROP ---
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

// --- RENDER ---
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
  document.getElementById("todoContainer").style.display = "block";
}