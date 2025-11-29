const express = require('express');
const cors = require('cors');
const crearTablas = require('./models/crearTablas');

const alumnosRoutes = require('./routes/alumnos');
const planesRoutes = require('./routes/planes');
const suscripcionesRoutes = require('./routes/suscripciones');
const clasesRoutes = require('./routes/clases');
const reservasRoutes = require('./routes/reservas');

const app = express();
app.use(cors());
app.use(express.json());

crearTablas();

app.use('/alumnos', alumnosRoutes);
app.use('/planes', planesRoutes);
app.use('/suscripciones', suscripcionesRoutes);
app.use('/clases', clasesRoutes);
app.use('/reservas', reservasRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`));

// Obtener todas las clases
app.get('/clases', (req, res) => {
  db.all('SELECT * FROM clases', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener detalle de una clase + cupos + reservas
app.get('/clases/:id', (req, res) => {
  const { id } = req.params;

  const queryClase = `
    SELECT c.*, 
    (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id) AS ocupados
    FROM clases c
    WHERE c.id = ?
  `;

  db.get(queryClase, [id], (err, clase) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!clase) return res.status(404).json({ error: "Clase no encontrada" });

    const queryReservas = `
      SELECT r.id AS reserva_id, a.*
      FROM reservas r
      JOIN alumnos a ON a.id = r.alumno_id
      WHERE r.clase_id = ?
    `;

    db.all(queryReservas, [id], (err2, alumnos) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        ...clase,
        alumnos
      });
    });
  });
});

// Crear reserva con validaciones
app.post('/reservas', (req, res) => {
  const { clase_id, alumno_id } = req.body;

  if (!clase_id || !alumno_id) {
    return res.status(400).json({ error: "Faltan datos de reserva" });
  }

  db.get('SELECT cupo_maximo FROM clases WHERE id = ?', [clase_id], (err, clase) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!clase) return res.status(404).json({ error: "Clase no encontrada" });

    db.get('SELECT COUNT(*) AS ocupados FROM reservas WHERE clase_id = ?', [clase_id], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });

      if (row.ocupados >= clase.cupo_maximo) {
        return res.status(400).json({ error: "Clase sin cupo disponible" });
      }

      db.get('SELECT * FROM reservas WHERE clase_id = ? AND alumno_id = ?', [clase_id, alumno_id], (err3, existing) => {
        if (err3) return res.status(500).json({ error: err3.message });

        if (existing) {
          return res.status(400).json({ error: "Alumno ya inscripto en esta clase" });
        }

        db.run('INSERT INTO reservas (clase_id, alumno_id) VALUES (?, ?)',
        [clase_id, alumno_id],
        function(err4) {
          if (err4) return res.status(500).json({ error: err4.message });
          res.json({ message: "Reserva creada", id: this.lastID });
        });
      });
    });
  });
});

// Borrar reserva
app.delete('/reservas/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM reservas WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json({ message: "Reserva eliminada" });
  });
});
