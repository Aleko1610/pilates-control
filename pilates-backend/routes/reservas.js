const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear reserva con validaciones
router.post('/', (req, res) => {
  const { clase_id, alumno_id } = req.body;

  const sqlPlanActivo = `
    SELECT s.*, p.tipo_plan, p.creditos_totales, p.duracion_dias
    FROM suscripciones s
    JOIN planes p ON s.plan_id = p.id
    WHERE s.alumno_id = ? AND s.estado = 'activa'
    ORDER BY s.id DESC LIMIT 1
  `;

  db.get(sqlPlanActivo, [alumno_id], (err, sub) => {
    if (!sub) return res.status(400).json({ error: "El alumno no tiene plan activo" });

    if (sub.fecha_fin && new Date(sub.fecha_fin) < new Date())
      return res.status(400).json({ error: "El plan está vencido" });

    if ((sub.tipo_plan === "creditos" || sub.tipo_plan === "mixto") && sub.creditos_actuales <= 0)
      return res.status(400).json({ error: "No tiene créditos disponibles" });

    const sqlReservaExistente = `
      SELECT * FROM reservas WHERE clase_id = ? AND alumno_id = ?
    `;

    db.get(sqlReservaExistente, [clase_id, alumno_id], (err, resExistente) => {
      if (resExistente)
        return res.status(400).json({ error: "Ya está reservado en esta clase" });

      const sqlCupo = `
        SELECT 
          (SELECT cupo_maximo FROM clases WHERE id = ?) as cupo,
          (SELECT COUNT(*) FROM reservas WHERE clase_id = ?) as reservados
      `;

      db.get(sqlCupo, [clase_id, clase_id], (err, datos) => {
        if (datos.reservados >= datos.cupo)
          return res.status(400).json({ error: "Cupo lleno" });

        const sqlInsert = `
          INSERT INTO reservas (clase_id, alumno_id)
          VALUES (?, ?)
        `;
        db.run(sqlInsert, [clase_id, alumno_id], function(err) {
          if (!err && sub.tipo_plan !== "tiempo") {
            db.run(`UPDATE suscripciones SET creditos_actuales = creditos_actuales - 1 WHERE id = ?`, [sub.id]);
          }

          res.json({ id: this.lastID, mensaje: "Reserva realizada con éxito" });
        });
      });
    });
  });
});

// ver reservas
router.get('/clase/:clase_id', (req, res) => {
  const { clase_id } = req.params;
  db.all(
    `SELECT r.*, a.nombre, a.apellido 
     FROM reservas r
     JOIN alumnos a ON r.alumno_id = a.id
     WHERE r.clase_id = ?`,
    [clase_id],
    (err, rows) => {
      if (err) return res.json([]); 
      res.json(rows || []);
    }
  );
});

// asistencia
router.patch('/:reserva_id/presente', (req, res) => {
  const { reserva_id } = req.params;
  const { presente } = req.body;

  db.run(`UPDATE reservas SET presente = ? WHERE id = ?`, [presente, reserva_id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Asistencia actualizada" });
  });
});

module.exports = router;
