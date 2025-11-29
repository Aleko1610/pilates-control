const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { nombre, apellido, dni, telefono, email, fecha_nacimiento } = req.body;

  const sql = `
    INSERT INTO alumnos (nombre, apellido, dni, telefono, email, fecha_nacimiento)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [nombre, apellido, dni, telefono, email, fecha_nacimiento], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM alumnos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, telefono, email } = req.body;

  const sql = `
    UPDATE alumnos
    SET nombre = ?, apellido = ?, dni = ?, telefono = ?, email = ?
    WHERE id = ?
  `;
  db.run(sql, [nombre, apellido, dni, telefono, email, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Alumno actualizado" });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sqlCheck = `
    SELECT COUNT(*) AS total FROM reservas
    WHERE alumno_id = ?
  `;
  
  db.get(sqlCheck, [id], (err, row) => {
    if (row.total > 0) {
      return res.status(400).json({ error: "No se puede eliminar: El alumno tiene reservas" });
    }

    db.run(`DELETE FROM alumnos WHERE id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: "Alumno eliminado" });
    });
  });
});


module.exports = router;
