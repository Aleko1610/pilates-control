const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear clase
router.post('/', (req, res) => {
  const { dia, hora, cupo_maximo, profesor, tipo_clase } = req.body;

  if (!dia || !hora || !cupo_maximo || !profesor || !tipo_clase) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = `
    INSERT INTO clases (dia, hora, cupo_maximo, profesor, tipo_clase)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [dia, hora, cupo_maximo, profesor, tipo_clase], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, mensaje: "Clase creada" });
  });
});

// Listar clases
router.get('/', (req, res) => {
  db.all(`SELECT * FROM clases ORDER BY dia, hora`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Detalle de clase + alumnos inscriptos
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sqlClase = `
    SELECT c.*,
    (SELECT COUNT(*) FROM reservas WHERE clase_id = c.id) AS ocupados
    FROM clases c
    WHERE c.id = ?
  `;

  db.get(sqlClase, [id], (err, clase) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!clase) return res.status(404).json({ error: "Clase no encontrada" });

    const sqlAlumnos = `
      SELECT r.id AS reserva_id, a.*
      FROM reservas r
      JOIN alumnos a ON a.id = r.alumno_id
      WHERE r.clase_id = ?
    `;

    db.all(sqlAlumnos, [id], (err2, alumnos) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        ...clase,
        alumnos
      });
    });
  });
});

// Editar clase
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

// Mover clase (cambiar fecha/hora)
router.patch('/:id/mover', (req, res) => {
  const { start } = req.body;
  const [dia, hora] = start.split("T");

  const sql = `
    UPDATE clases
    SET dia = ?, hora = ?
    WHERE id = ?
  `;

  db.run(sql, [dia, hora, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: "Error al mover clase" });
    res.json({ mensaje: "Clase actualizada" });
  });
});

// Eliminar clase (solo si no tiene reservas)
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

    db.run(`DELETE FROM clases WHERE id = ?`, [id], err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Clase eliminada" });
    });
  });
});

module.exports = router;
