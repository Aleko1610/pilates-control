const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las reservas
router.get('/', (req, res) => {
  db.all('SELECT * FROM reservas', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear reserva (inscribir alumno en clase)
router.post('/', (req, res) => {
  const { clase_id, alumno_id } = req.body;

  if (!clase_id || !alumno_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = `
    INSERT INTO reservas (clase_id, alumno_id)
    VALUES (?, ?)
  `;

  db.run(sql, [clase_id, alumno_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Obtener reservas de un alumno
router.get('/alumno/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT r.*, c.dia, c.hora, c.tipo_clase
    FROM reservas r
    JOIN clases c ON r.clase_id = c.id
    WHERE r.alumno_id = ?
    ORDER BY c.dia DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Reservas del día (Dashboard)
router.get('/hoy/:fecha', (req, res) => {
  const { fecha } = req.params;

  const sql = `
    SELECT r.*, a.nombre, a.apellido
    FROM reservas r
    JOIN clases c ON r.clase_id = c.id
    JOIN alumnos a ON r.alumno_id = a.id
    WHERE c.dia = ?
  `;

  db.all(sql, [fecha], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Eliminar reserva
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM reservas WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Reserva eliminada" });
  });
});

module.exports = router;
