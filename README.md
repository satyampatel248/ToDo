# Advanced ToDo App

A full-featured **ToDo application** built with **Node.js, Express, MySQL, HTML, CSS, and JavaScript**.

## Features

- User authentication (Signup/Login)
- CRUD operations on tasks (Create, Read, Update, Delete)
- Edit task title, priority, and due date
- Mark tasks as complete/incomplete
- Drag-and-drop ordering of tasks
- Responsive and modern frontend served via Express
- Each user sees only their own tasks

---

## Folder Structure

```
ToDo/
│
├── backend/
│   ├── db.js
│   ├── server.js
│   └── routes/
│       ├── tasks.js
│       └── auth.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── package.json
├── README.md
└── .vscode/
    └── launch.json
```

---

## Prerequisites

- Node.js (v18+) & npm
- MySQL (running locally)
- Chrome or any modern browser

---

## Setup Instructions

### 1️⃣ Clone the repository

```sh
git clone <your-repo-url>
cd ToDo
```

### 2️⃣ Install backend dependencies

```sh
npm install
```

> If you encounter issues with `bcrypt` on macOS M1/M2, you can use `bcryptjs` (already included in dependencies).

### 3️⃣ Setup MySQL Database

Login to MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS ToDo;
USE ToDo;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    completed TINYINT(1) DEFAULT 0,
    position INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4️⃣ Configure Database Connection

Edit [`backend/db.js`](backend/db.js) if needed:

```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "password", // your MySQL password
  database: "ToDo"
});
```

---

## Running the App

### Start the backend server

```sh
npm start
```

The backend will run on [http://localhost:5000](http://localhost:5000) and serve the frontend automatically.

### Access the frontend

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Development

- For auto-reloading during development, use:

```sh
npm run dev
```

- The frontend is served statically from the `frontend/` folder by Express.

---

## Troubleshooting

- Make sure MySQL is running and the credentials in [`backend/db.js`](backend/db.js) are correct.
- If you change the database user/password, update them in [`backend/db.js`](backend/db.js).
- If you get CORS errors, ensure you are accessing the frontend via the backend server (not opening `index.html` directly).

---

## License

ISC

---

