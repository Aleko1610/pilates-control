const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las clases
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id) AS ocupados
    FROM clases c
    ORDER BY dia ASC, hora ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear una clase
router.post('/', (req, res) => {
  const { dia, hora, cupo_maximo, profesor, tipo_clase } = req.body;

  if (!dia || !hora || !cupo_maximo || !profesor || !tipo_clase) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const sql = `
    INSERT INTO clases (dia, hora, cupo_maximo, profesor, tipo_clase)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [dia, hora, cupo_maximo, profesor, tipo_clase], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Clases por día (para el Dashboard)
router.get('/dia/:fecha', (req, res) => {
  const { fecha } = req.params;

  const sql = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id) AS ocupados
    FROM clases c
    WHERE dia = ?
    ORDER BY hora ASC
  `;

  db.all(sql, [fecha], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener una sola clase por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id) AS ocupados
    FROM clases c
    WHERE c.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
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

  db.run(sql, [dia, hora, cupo_maximo, profesor, tipo_clase, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Clase actualizada" });
  });
});

// Eliminar clase
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Verifica que la clase no tenga reservas
  const sqlCheck = `
    SELECT COUNT(*) AS total
    FROM reservas
    WHERE clase_id = ?
  `;

  db.get(sqlCheck, [id], (err, row) => {
    if (row.total > 0) {
      return res.status(400).json({ error: "No se puede eliminar: clase con reservas" });
    }

    db.run(`DELETE FROM clases WHERE id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Clase eliminada" });
    });
  });
});

// Obtener clases por día
router.get("/dia/:fecha", (req, res) => {
  const { fecha } = req.params;

  const sql = `
    SELECT c.*,
           (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id) AS reservados
    FROM clases c
    WHERE c.dia = ?
    ORDER BY c.hora ASC
  `;

  db.all(sql, [fecha], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error obteniendo clases por fecha" });
    res.json(rows);
  });
});


module.exports = router;
