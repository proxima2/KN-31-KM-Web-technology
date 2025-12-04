const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// ---- Middleware логування ----
app.use((req, res, next) => {
  const log = `${new Date().toLocaleString()} | ${req.method} ${req.url}\n`;
  fs.appendFileSync("log.txt", log);
  next();
});

// ---- Статичні файли ----
app.use(express.static('public'));

const usersPath = path.join(__dirname, 'data', 'users.json');

// ---- Допоміжна функція читання файлу ----
function readUsers() {
  const data = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(data);
}

// ---- Маршрути Users API ----

// GET /api/users — всі користувачі
app.get('/api/users', (req, res) => {
  res.json(readUsers());
});

// GET /api/users/:id — один користувач
app.get('/api/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id == req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// POST /api/users — створити користувача
app.post('/api/users', (req, res) => {
  const users = readUsers();

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json(newUser);
});

// PUT /api/users/:id — оновити користувача
app.put('/api/users/:id', (req, res) => {
  const users = readUsers();
  const idx = users.findIndex(u => u.id == req.params.id);

  if (idx === -1) return res.status(404).json({ message: "User not found" });

  users[idx] = { ...users[idx], ...req.body };

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json(users[idx]);
});

// DELETE /api/users/:id — видалити користувача
app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  const filtered = users.filter(u => u.id != req.params.id);

  fs.writeFileSync(usersPath, JSON.stringify(filtered, null, 2));
  res.json({ message: "User deleted" });
});

// ---- Запуск ----
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
