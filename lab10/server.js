// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const { readJSON, writeJSON } = require('./utils/db');

const app = express();
const DATA_USERS = 'data/users.json';
const DATA_TASKS = 'data/tasks.json';
const SALT_ROUNDS = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'change_this_secret_in_prod',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// simple logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'Not authorized', redirect: '/login.html' });
}

// Root redirect - behaves per spec
app.get('/', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/dashboard.html');
  return res.redirect('/login.html');
});

// --- AUTH API ---

// Register
app.post('/api/register', [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('ПІБ 3–50 символів'),
  body('email').isEmail().withMessage('Невірний email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль мін. 6 символів')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const users = readJSON(DATA_USERS);

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = users.length ? users[users.length - 1].id + 1 : 1;
  const newUser = { id, name, email, password: hash };
  users.push(newUser);
  writeJSON(DATA_USERS, users);

  // create session
  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email };
  res.json({ message: 'Registered', user: req.session.user });
});

// Login
app.post('/api/login', [
  body('email').isEmail().withMessage('Невірний email'),
  body('password').notEmpty().withMessage('Пароль обов\'язковий')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const users = readJSON(DATA_USERS);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Wrong password' });

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ message: 'Logged in', user: req.session.user });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// Get current user
app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) return res.json({ user: req.session.user });
  res.status(401).json({ error: 'Not authenticated' });
});

// --- TASKS API (protected) ---
// GET all tasks for current user
app.get('/api/tasks', requireAuth, (req, res) => {
  const tasks = readJSON(DATA_TASKS);
  const userTasks = tasks.filter(t => t.userId === req.session.user.id);
  res.json(userTasks);
});

// POST create task
app.post('/api/tasks', requireAuth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
  body('priority').optional().isIn(['низька', 'середня', 'висока'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const tasks = readJSON(DATA_TASKS);
  const id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
  const now = new Date().toISOString();
  const newTask = {
    id,
    userId: req.session.user.id,
    title: req.body.title,
    completed: false,
    createdAt: now,
    priority: req.body.priority || 'середня'
  };
  tasks.push(newTask);
  writeJSON(DATA_TASKS, tasks);
  res.json(newTask);
});

// PUT update task (only owner)
app.put('/api/tasks/:id', requireAuth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('completed').optional().isBoolean(),
  body('priority').optional().isIn(['низька', 'середня', 'висока'])
], (req, res) => {
  const tasks = readJSON(DATA_TASKS);
  const id = Number(req.params.id);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (tasks[idx].userId !== req.session.user.id) return res.status(403).json({ error: 'Forbidden' });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  tasks[idx] = { ...tasks[idx], ...req.body };
  writeJSON(DATA_TASKS, tasks);
  res.json({ success: true, task: tasks[idx] });
});

// DELETE task (only owner)
app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  let tasks = readJSON(DATA_TASKS);
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  if (task.userId !== req.session.user.id) return res.status(403).json({ error: 'Forbidden' });

  tasks = tasks.filter(t => t.id !== id);
  writeJSON(DATA_TASKS, tasks);
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Todo app running at http://localhost:${PORT}`));
