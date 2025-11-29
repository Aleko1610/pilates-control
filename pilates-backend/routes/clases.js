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

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { dia, hora, cupo_maximo, profesor, tipo_clase } = req.body;

  const sql = `
    UPDATE clases
    SET dia = ?, hora = ?, cupo_maximo = ?, profesor = ?, tipo_clase = ?
    WHERE id = ?
  `;

  db.run(sql, [dia, hora, cupo_maximo, profesor, tipo_clase, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Clase actualizada" });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sqlCheck = `
    SELECT COUNT(*) AS total 
    FROM reservas 
    WHERE clase_id = ?
  `;

  db.get(sqlCheck, [id], (err, row) => {
    if (row.total > 0) {
      return res.status(400).json({
        error: "No se puede eliminar: la clase tiene reservas"
      });
    }

    db.run(`DELETE FROM clases WHERE id=?`, [id], err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Clase eliminada" });
    });
  });
});


module.exports = router;
