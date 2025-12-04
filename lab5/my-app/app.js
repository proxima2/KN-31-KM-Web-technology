const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---- Статичні файли ----
app.use(express.static('public'));

// ---- Головна сторінка ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- /time – поточний час ----
app.get('/time', (req, res) => {
  const now = new Date();
  const formatted = now.toLocaleString('uk-UA');

  // логування у файл
  fs.appendFileSync('log.txt', `Запит: ${formatted}\n`);

  res.send(`
        <h1>Поточний час</h1>
        <p>${formatted}</p>
        <a href="/">Назад</a>
    `);
});

// ---- /time/json – час у форматі JSON ----
app.get('/time/json', (req, res) => {
  const now = new Date();
  const formatted = now.toLocaleString('uk-UA');

  fs.appendFileSync('log.txt', `JSON-запит: ${formatted}\n`);

  res.json({
    now: formatted,
    timestamp: now.getTime()
  });
});

// ---- /settime – запис користувацької дати в custom.txt ----
app.post('/settime', (req, res) => {
  const { usertime } = req.body;

  if (!usertime) {
    return res.send('Помилка: дата не передана');
  }

  fs.writeFileSync('custom.txt', `Користувацька дата: ${usertime}`);
  res.send(`
        <h1>Дата збережена!</h1>
        <p>Ви ввели: ${usertime}</p>
        <a href="/">Назад</a>
    `);
});

// ---- Запуск сервера ----
app.listen(3000, () => {
  console.log('Сервер запущено на http://localhost:3000');
});
