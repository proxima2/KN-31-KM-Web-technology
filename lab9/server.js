const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(
  session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);

const usersPath = path.join(__dirname, 'data', 'users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}
function writeUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

// Middleware to protect routes
function auth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Not authorized" });
  next();
}

// ROUTES
app.get('/api/user', auth, (req, res) => {
  res.json(req.session.user);
});

// REGISTER
app.post('/api/register',
  body('name').isLength({ min: 3 }).withMessage("Name too short"),
  body('email').isEmail().withMessage("Invalid email"),
  body('password').isLength({ min: 6 }).withMessage("Password too short"),
  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const users = readUsers();
    const { name, email, password } = req.body;

    if (users.find(u => u.email === email))
      return res.status(400).json({ error: "Email already used" });

    const hashed = bcrypt.hashSync(password, 10);

    const newUser = {
      id: users.length ? users.at(-1).id + 1 : 1,
      name,
      email,
      password: hashed
    };

    users.push(newUser);
    writeUsers(users);

    res.json({ message: "Registered successfully" });
  }
);

// LOGIN
app.post('/api/login', (req, res) => {
  const users = readUsers();
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "User not found" });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(400).json({ error: "Wrong password" });

  req.session.user = { id: user.id, name: user.name, email: user.email };

  res.json({ message: "Login successful" });
});

// LOGOUT
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// PROTECTED PAGE HTML
app.get('/dashboard', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(3000, () => console.log("Server running: http://localhost:3000"));

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login.html');
});

