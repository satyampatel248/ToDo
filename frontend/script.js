
const API_URL = "http://localhost:5000/api"; 
let currentUser = null;
let taskBeingEdited = null;
// ------------------- AUTO LOGIN -------------------
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    document.getElementById("usernameDisplay").innerText = currentUser.username;
    showTodoContainer();
    fetchTasks();
  }
});
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
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
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
  localStorage.removeItem("currentUser");
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
// ------------------- TASK FUNCTIONS -------------------
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  const incomplete = tasks.filter(t => !t.completed);
  renderTasks(incomplete);
}
async function fetchCompletedTasks() {
  const res = await fetch(`${API_URL}/tasks/${currentUser.id}`);
  const tasks = await res.json();
  const completed = tasks.filter(t => t.completed);
  renderCompletedTasks(completed);
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
  return `${yyyy}-${mm}-${dd}`;
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
// ------------------- COMPLETE / DELETE -------------------
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
    // ---------------------
    // FIXED PRIORITY COLOR
    // ---------------------
    if (task.completed) {
      li.classList.add("completed");
    } else {
      if (task.priority === "High") li.classList.add("high");
      else if (task.priority === "Medium") li.classList.add("medium");
      else li.classList.add("low");
    }
    li.innerHTML = `
      <span>
        <strong>${task.title}</strong> 
        [${task.priority}] 
        <em>${task.due_date ? formatDateDisplay(task.due_date) : ""}</em>
      </span>
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
function renderCompletedTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.classList.add("completed");
    li.innerHTML = `
      <span>
        <strong>${task.title}</strong>
        [${task.priority}]
        <em>${task.due_date ? formatDateDisplay(task.due_date) : ""}</em>
      </span>
      <div>
        <button onclick="toggleComplete(${task.id}, ${!task.completed})">✔</button>
        <button onclick='openEditTaskModal(${JSON.stringify(task)})'>✏️</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;
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




// Open Forgot Password form
function forgotPassword() {
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("todoContainer").style.display = "none";
    document.getElementById("forgotPasswordContainer").style.display = "block";
    document.getElementById("fpStep1").style.display = "block";
    document.getElementById("fpStep2").style.display = "none";
    document.getElementById("fpMessage").innerText = "";
}
// STEP 1: Submit username
async function submitForgotUsername() {
    const username = document.getElementById("fpUsername").value;
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    });
    const data = await res.json();
    const msg = document.getElementById("fpMessage");
    if (!res.ok) {
        msg.innerText = data;
        msg.style.color = "red";
        return;
    }
    resetUserId = data.userId;
    msg.innerText = "User found! Enter your new password.";
    msg.style.color = "green";
    document.getElementById("fpStep1").style.display = "none";
    document.getElementById("fpStep2").style.display = "block";
}
// STEP 2: Reset password
async function submitNewPassword() {
    const newPass = document.getElementById("fpNewPassword").value;
    const confirmPass = document.getElementById("fpConfirmPassword").value;
    const msg = document.getElementById("fpMessage");
    if (newPass !== confirmPass) {
        msg.innerText = "Passwords do not match!";
        msg.style.color = "red";
        return;
    }
    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetUserId, newPassword: newPass })
    });
    const data = await res.text();
    msg.innerText = data;
    msg.style.color = "green";
}
// Back to login screen
function showLogin() {
    document.getElementById("forgotPasswordContainer").style.display = "none";
    document.getElementById("todoContainer").style.display = "none";
    document.getElementById("authContainer").style.display = "block";
}
