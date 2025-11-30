const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear plan
router.post('/', (req, res) => {
  const {
    nombre,
    tipo_plan,
    precio,
    creditos_totales,
    duracion_dias
  } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre del plan es obligatorio" });
  }

  if (precio == null) {
    return res.status(400).json({ error: "El precio es obligatorio" });
  }

  const tipo = tipo_plan || "creditos"; // 🔥 valor por defecto válido

  const sql = `
    INSERT INTO planes (nombre, tipo_plan, precio, creditos_totales, duracion_dias, activo)
    VALUES (?, ?, ?, ?, ?, 1)
  `;

  db.run(sql, [nombre, tipo, precio, creditos_totales || null, duracion_dias || null], function (err) {
    if (err) {
      console.log("Error SQL:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});


// Listar planes activos
router.get('/', (req, res) => {
  db.all(`SELECT * FROM planes WHERE activo = 1 ORDER BY nombre ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Editar plan
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    tipo_plan = "general",
    precio = 0,
    creditos_totales = 0,
    duracion_dias = 30
  } = req.body;

  const sql = `
    UPDATE planes
    SET nombre=?, tipo_plan=?, precio=?, creditos_totales=?, duracion_dias=?
    WHERE id=?
  `;

  db.run(sql, [nombre, tipo_plan, precio, creditos_totales, duracion_dias, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Plan actualizado" });
  });
});

// Eliminar plan solo si no está en uso
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

    db.run(`UPDATE planes SET activo = 0 WHERE id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Plan desactivado" });
    });
  });
});

module.exports = router;
