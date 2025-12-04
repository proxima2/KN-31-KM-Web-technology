const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Шлях до JSON-файлу
const dataPath = path.join(__dirname, 'data', 'students.json');

// Читання JSON
function readStudents() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

// ---- CRUD API ----

// GET — всі студенти
app.get('/api/students', (req, res) => {
  res.json(readStudents());
});

// GET — студент за ID
app.get('/api/students/:id', (req, res) => {
  const students = readStudents();
  const student = students.find(s => s.id == req.params.id);

  if (!student) return res.status(404).json({ message: "Not found" });
  res.json(student);
});

// POST — додати студента
app.post('/api/students', (req, res) => {
  const students = readStudents();

  const newStudent = {
    id: students.length ? students.at(-1).id + 1 : 1,
    name: req.body.name,
    group: req.body.group
  };

  students.push(newStudent);
  fs.writeFileSync(dataPath, JSON.stringify(students, null, 2));

  res.json(newStudent);
});

// PUT — оновити студента
app.put('/api/students/:id', (req, res) => {
  const students = readStudents();
  const id = Number(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) return res.status(404).json({ message: "Not found" });

  students[index] = { ...students[index], ...req.body };
  fs.writeFileSync(dataPath, JSON.stringify(students, null, 2));

  res.json(students[index]);
});

// DELETE — видалити студента
app.delete('/api/students/:id', (req, res) => {
  let students = readStudents();
  const id = Number(req.params.id);

  students = students.filter(s => s.id !== id);
  fs.writeFileSync(dataPath, JSON.stringify(students, null, 2));

  res.json({ message: "Deleted" });
});

// ---- Запуск ----
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
