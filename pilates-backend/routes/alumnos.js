const express = require('express');
const router = express.Router();
const db = require('../db');

router.post("/", (req, res) => {
  const { nombre, apellido, dni, telefono, email } = req.body;

  if (!nombre || !apellido || !dni || !telefono || !email) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,15}$/;
  const regexDni = /^[0-9]{1,8}$/;
  const regexTel = /^[0-9+]{1,15}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexNombre.test(nombre)) return res.status(400).json({ error: "Nombre inválido" });
  if (!regexNombre.test(apellido)) return res.status(400).json({ error: "Apellido inválido" });
  if (!regexDni.test(dni)) return res.status(400).json({ error: "DNI inválido" });
  if (!regexTel.test(telefono)) return res.status(400).json({ error: "Teléfono inválido" });
  if (!regexEmail.test(email)) return res.status(400).json({ error: "Email inválido" });

  const sql = `
    INSERT INTO alumnos (nombre, apellido, dni, telefono, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [nombre, apellido, dni, telefono, email], function(err) {
    if (err) return res.status(500).json({ error: "Error al guardar el alumno" });
    res.json({ id: this.lastID, msg: "Alumno agregado con éxito" });
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
