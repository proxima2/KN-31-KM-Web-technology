const fs = require('fs');

fs.readFile('notes.txt', 'utf8', (err, text) => {
  if (err) {
    console.log('Помилка при читанні файлу');
    return;
  }

  const newText = 'Парний варіант — виконано студентом Кобрин Максим\n\n' + text;

  fs.writeFile('output_notes.txt', newText, (err) => {
    if (err) {
      console.log('Помилка при записі файлу');
      return;
    }

    console.log('Все готово! Файл output_notes.txt створено.');
  });
});
