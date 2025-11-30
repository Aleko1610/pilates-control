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

// Obtener todas las suscripciones activas
router.get('/activas', (req, res) => {
  const sql = `
    SELECT s.*, 
           a.nombre AS alumno_nombre,
           a.apellido AS alumno_apellido,
           p.nombre AS plan_nombre
    FROM suscripciones s
    JOIN alumnos a ON s.alumno_id = a.id
    JOIN planes p ON s.plan_id = p.id
    WHERE s.estado = 'activa'
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error obteniendo suscripciones activas" });
    }
    res.json(rows);
  });
});

// Suscripciones con vencimiento cercano
router.get('/vencimientos', (req, res) => {
  const sql = `
    SELECT 
      s.*, 
      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,
      p.nombre AS plan_nombre,
      date('now') AS hoy,
      julianday(s.fecha_fin) - julianday(date('now')) AS dias_restantes
    FROM suscripciones s
    JOIN alumnos a ON s.alumno_id = a.id
    JOIN planes p ON s.plan_id = p.id
    WHERE s.estado = 'activa'
      AND s.fecha_fin IS NOT NULL
      AND s.fecha_fin <= date('now', '+7 days')
    ORDER BY s.fecha_fin ASC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error obteniendo vencimientos" });
    }
    res.json(rows);
  });
});
// 🔹 Vencimientos agrupados por semana
router.get("/estadisticas/vencimientos", (req, res) => {
  const sql = `
    SELECT
      strftime('%W', fecha_fin) AS semana,
      COUNT(*) AS total
    FROM suscripciones
    WHERE estado='activa'
    GROUP BY semana
    ORDER BY semana ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// Cerrar suscripción (estado = 'inactiva')
router.put("/cerrar/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE suscripciones
    SET estado = 'inactiva'
    WHERE id = ?
  `;

  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Suscripción cerrada" });
  });
});


module.exports = router;
