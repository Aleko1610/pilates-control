const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { nombre, tipo_plan, precio, creditos_totales, duracion_dias } = req.body;

  const sql = `
    INSERT INTO planes (nombre, tipo_plan, precio, creditos_totales, duracion_dias)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [nombre, tipo_plan, precio, creditos_totales, duracion_dias], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM planes WHERE activo = 1', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
