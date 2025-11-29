const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { dia, hora, cupo_maximo, profesor, tipo_clase } = req.body;

  const sql = `
    INSERT INTO clases (dia, hora, cupo_maximo, profesor, tipo_clase)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [dia, hora, cupo_maximo, profesor, tipo_clase], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/', (req, res) => {
  db.all(`SELECT * FROM clases ORDER BY dia, hora`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
