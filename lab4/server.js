// server.js

const http = require('http');
const fs = require('fs');

// Функція для отримання поточної дати і часу
function getCurrentDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('uk-UA');
  const time = now.toLocaleTimeString('uk-UA');
  return { date, time };
}

// Створення HTTP-сервера
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Головна сторінка</h1><p>Перейдіть на <a href="/time">/time</a> або <a href="/time/json">/time/json</a></p>');
  }

  else if (req.url === '/time') {
    const now = getCurrentDateTime();
    const message = `Поточний час: ${now.date}, ${now.time}`;

    // Запис у файл log.txt
    fs.appendFileSync('log.txt', `${message}\n`);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>${message}</h1>`);
  }

  else if (req.url === '/time/json') {
    const now = getCurrentDateTime();

    // Запис у файл log.txt
    fs.appendFileSync('log.txt', `JSON запит: ${now.date}, ${now.time}\n`);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(now));
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - Сторінку не знайдено</h1>');
  }
});

// Запуск сервера
server.listen(3000, () => {
  console.log('Сервер працює на http://localhost:3000');
});
