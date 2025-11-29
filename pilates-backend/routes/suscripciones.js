const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/activo/:alumno_id', (req, res) => {
  const { alumno_id } = req.params;

  const sql = `
    SELECT s.*, p.nombre AS plan_nombre
    FROM suscripciones s
    JOIN planes p ON s.plan_id = p.id
    WHERE s.alumno_id = ? AND s.estado = 'activa'
    ORDER BY s.id DESC LIMIT 1
  `;

  db.get(sql, [alumno_id], (err, row) => {
    if (err) return res.json(null);
    res.json(row || null);
  });
});

router.post('/', (req, res) => {
  const { alumno_id, plan_id, fecha_inicio, fecha_fin, creditos_actuales } = req.body;

  const sql = `
    INSERT INTO suscripciones (alumno_id, plan_id, fecha_inicio, fecha_fin, creditos_actuales)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [alumno_id, plan_id, fecha_inicio, fecha_fin, creditos_actuales], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

module.exports = router;
