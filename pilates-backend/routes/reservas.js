const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear reserva con validaciones
router.post('/', (req, res) => {
  const { clase_id, alumno_id } = req.body;

  // 1. Verificar plan activo
  const sqlPlanActivo = `
    SELECT s.*, p.tipo_plan, p.creditos_totales, p.duracion_dias
    FROM suscripciones s
    JOIN planes p ON s.plan_id = p.id
    WHERE s.alumno_id = ? AND s.estado = 'activa'
    ORDER BY s.id DESC LIMIT 1
  `;

  db.get(sqlPlanActivo, [alumno_id], (err, sub) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!sub) {
      return res.status(400).json({ error: "El alumno no tiene plan activo" });
    }

    // 2. Validar fecha de vencimiento
    if (sub.fecha_fin && new Date(sub.fecha_fin) < new Date()) {
      return res.status(400).json({ error: "El plan está vencido" });
    }

    // 3. Validar créditos si aplica
    if ((sub.tipo_plan === "creditos" || sub.tipo_plan === "mixto") 
      && sub.creditos_actuales <= 0) {
      return res.status(400).json({ error: "No tiene créditos disponibles" });
    }

    // 4. Verificar si ya está reservado
    const sqlReservaExistente = `
      SELECT * FROM reservas WHERE clase_id = ? AND alumno_id = ?
    `;
    db.get(sqlReservaExistente, [clase_id, alumno_id], (err, resExistente) => {
      if (resExistente) {
        return res.status(400).json({ error: "Ya está reservado en esta clase" });
      }

      // 5. Validar cupo
      const sqlCupo = `
        SELECT 
          (SELECT cupo_maximo FROM clases WHERE id = ?) as cupo,
          (SELECT COUNT(*) FROM reservas WHERE clase_id = ?) as reservados
      `;

      db.get(sqlCupo, [clase_id, clase_id], (err, datos) => {
        if (err) return res.status(500).json({ error: err.message });

        if (datos.reservados >= datos.cupo) {
          return res.status(400).json({ error: "Cupo lleno" });
        }

        // 6. Insertar reserva
        const sqlReserva = `
          INSERT INTO reservas (clase_id, alumno_id)
          VALUES (?, ?)
        `;

        db.run(sqlReserva, [clase_id, alumno_id], function(err) {
          if (err) return res.status(500).json({ error: err.message });

          // 7. Restar crédito si corresponde
          if (sub.tipo_plan !== "tiempo") {
            const sqlActualizarCreditos = `
              UPDATE suscripciones
              SET creditos_actuales = creditos_actuales - 1
              WHERE id = ?
            `;
            db.run(sqlActualizarCreditos, [sub.id]);
          }

          res.json({ id: this.lastID, mensaje: "Reserva realizada con éxito" });
        });
      });
    });
  });
});

module.exports = router;
