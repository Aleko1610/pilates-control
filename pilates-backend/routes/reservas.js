const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear reserva
router.post('/', (req, res) => {
  const { clase_id, alumno_id } = req.body;

  if (!clase_id || !alumno_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sqlPlanActivo = `
    SELECT s.*, p.tipo_plan, p.creditos_totales, p.duracion_dias, p.creditos_actuales
    FROM suscripciones s
    JOIN planes p ON s.plan_id = p.id
    WHERE s.alumno_id = ? AND s.estado = 'activa'
    ORDER BY s.id DESC LIMIT 1
  `;

  db.get(sqlPlanActivo, [alumno_id], (err, sub) => {
    if (!sub) return res.status(400).json({ error: "El alumno no tiene plan activo" });

    const sqlReservaExistente = `
      SELECT * FROM reservas WHERE clase_id = ? AND alumno_id = ?
    `;

    db.get(sqlReservaExistente, [clase_id, alumno_id], (err, ya) => {
      if (ya) return res.status(400).json({ error: "Ya está reservado" });

      const sqlCupo = `
        SELECT 
          (SELECT cupo_maximo FROM clases WHERE id = ?) AS cupo,
          (SELECT COUNT(*) FROM reservas WHERE clase_id = ?) AS reservados
      `;

      db.get(sqlCupo, [clase_id, clase_id], (err, cupos) => {
        if (cupos.reservados >= cupos.cupo)
          return res.status(400).json({ error: "Cupo lleno" });

        const sqlInsert = `
          INSERT INTO reservas (clase_id, alumno_id)
          VALUES (?, ?)
        `;

        db.run(sqlInsert, [clase_id, alumno_id], function(err) {
          if (err) return res.status(500).json({ error: err.message });

          res.json({ id: this.lastID, mensaje: "Reserva realizada" });
        });
      });
    });
  });
});

// Ver reservas por clase
router.get('/clase/:clase_id', (req, res) => {
  const { clase_id } = req.params;

  db.all(
    `SELECT r.id AS reserva_id, a.*
     FROM reservas r
     JOIN alumnos a ON r.alumno_id = a.id
     WHERE r.clase_id = ?`,
    [clase_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Marcar asistencia
router.patch('/:id/presente', (req, res) => {
  const { id } = req.params;
  const { presente } = req.body;

  db.run(
    `UPDATE reservas SET presente = ? WHERE id = ?`,
    [presente, id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Asistencia actualizada" });
    }
  );
});

// Cancelar reserva
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM reservas WHERE id = ?`, [id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Reserva cancelada" });
  });
});

module.exports = router;
