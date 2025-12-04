const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Middleware для логування
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleString()} | ${req.method} ${req.url}`);
  next();
});

const dataPath = path.join(__dirname, 'data', 'projects.json');
function readData() {
  return JSON.parse(fs.readFileSync(dataPath));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Валідація
const validateProject = [
  body("title")
    .notEmpty().withMessage("Назва обов'язкова")
    .isLength({ min: 3, max: 50 }).withMessage("Назва 3–50 символів"),

  body("description")
    .optional()
    .isLength({ max: 100 }).withMessage("Опис максимум 100 символів"),

  body("techStack")
    .notEmpty().withMessage("Tech Stack обов'язковий"),

  body("link")
    .isURL().withMessage("Посилання повинно бути валідним URL"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// POST — обробка форми
app.post('/submit', validateProject, (req, res) => {
  const { title, description, techStack, link } = req.body;
  const projects = readData();

  const newProj = {
    id: projects.length ? projects.at(-1).id + 1 : 1,
    title,
    description,
    techStack,
    link
  };

  projects.push(newProj);
  writeData(projects);

  res.json({ success: true, project: newProj });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
