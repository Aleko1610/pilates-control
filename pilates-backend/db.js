const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'pilates.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Error al abrir la DB', err);
  console.log('Base de datos conectada');
});

module.exports = db;
