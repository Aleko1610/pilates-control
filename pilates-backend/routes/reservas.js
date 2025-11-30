const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener reservas de una clase
router.get('/clase/:clase_id', (req, res) => {
  const { clase_id } = req.params;

  const sql = `
    SELECT r.id, r.presente, a.nombre, a.apellido
    FROM reservas r
    JOIN alumnos a ON a.id = r.alumno_id
    WHERE r.clase_id = ?
  `;

  db.all(sql, [clase_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear reserva con controles de cupo y duplicado
router.post('/', (req, res) => {
  const { clase_id, alumno_id } = req.body;

  const check = `
    SELECT * FROM reservas
    WHERE clase_id = ? AND alumno_id = ?
  `;

  db.get(check, [clase_id, alumno_id], (err, found) => {
    if (found) {
      return res.status(400).json({ error: "Alumno ya anotado" });
    }

    const cupoSql = `
      SELECT cupo_maximo,
      (SELECT COUNT(*) FROM reservas WHERE clase_id = ?) AS ocupados
      FROM clases WHERE id = ?
    `;

    db.get(cupoSql, [clase_id, clase_id], (err, info) => {
      if (info.ocupados >= info.cupo_maximo) {
        return res.status(400).json({ error: "No hay cupos disponibles" });
      }

      const insert = `
        INSERT INTO reservas (clase_id, alumno_id, presente)
        VALUES (?, ?, 0)
      `;
      db.run(insert, [clase_id, alumno_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      });
    });
  });
});

// Cancelar reserva
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM reservas WHERE id = ?`;
  db.run(sql, [id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Marcar presente
router.patch('/:id/presente', (req, res) => {
  const { id } = req.params;
  const { presente } = req.body;

  const sql = `
    UPDATE reservas 
    SET presente = ?
    WHERE id = ?
  `;
  db.run(sql, [presente, id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Estadísticas últimos 7 días con ocupación real
router.get('/estadisticas/ultimos7', (req, res) => {
  const sql = `
    SELECT 
      c.dia,
      COUNT(c.id) AS cantidad_clases,
      SUM(c.cupo_maximo) AS cupos_totales,
      (
        SELECT COUNT(*) 
        FROM reservas r
        WHERE r.clase_id IN (SELECT id FROM clases WHERE dia = c.dia)
      ) AS reservas_hechas
    FROM clases c
    WHERE c.dia >= DATE('now', '-6 day')
    GROUP BY c.dia
    ORDER BY c.dia ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const datos = rows.map(r => {
      const porcentaje = r.reservas_hechas > 0
        ? Math.round((r.reservas_hechas / r.cupos_totales) * 100)
        : 0;

      return {
        dia: r.dia,
        porcentaje
      };
    });

    res.json(datos);
  });
});

module.exports = router;
