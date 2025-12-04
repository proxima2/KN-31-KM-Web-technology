// utils/db.js
const fs = require('fs');
const path = require('path');

function readJSON(relPath) {
  const p = path.join(__dirname, '..', relPath);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeJSON(relPath, data) {
  const p = path.join(__dirname, '..', relPath);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };
