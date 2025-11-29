const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { nombre, apellido, dni, telefono, email, fecha_nacimiento } = req.body;

  const sql = `
    INSERT INTO alumnos (nombre, apellido, dni, telefono, email, fecha_nacimiento)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [nombre, apellido, dni, telefono, email, fecha_nacimiento], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM alumnos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
