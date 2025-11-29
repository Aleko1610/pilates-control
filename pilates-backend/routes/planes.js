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

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, tipo_plan, precio, creditos_totales, duracion_dias } = req.body;

  const sql = `
    UPDATE planes
    SET nombre=?, tipo_plan=?, precio=?, creditos_totales=?, duracion_dias=?
    WHERE id=?
  `;
  db.run(sql, [nombre, tipo_plan, precio, creditos_totales, duracion_dias, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Plan actualizado" });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sqlCheck = `
    SELECT COUNT(*) as total
    FROM suscripciones
    WHERE plan_id = ? AND estado = 'activa'
  `;

  db.get(sqlCheck, [id], (err, row) => {
    if (row.total > 0) {
      return res.status(400).json({
        error: "No se puede eliminar: el plan está en uso por alumnos activos"
      });
    }

    db.run(`DELETE FROM planes WHERE id=?`, [id], err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Plan eliminado" });
    });
  });
});


module.exports = router;
