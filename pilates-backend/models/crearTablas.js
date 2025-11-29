const db = require('../db');

function crearTablas() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        dni TEXT UNIQUE NOT NULL,
        telefono TEXT,
        email TEXT,
        fecha_nacimiento TEXT,
        estado TEXT DEFAULT 'activo',
        fecha_alta TEXT DEFAULT CURRENT_DATE,
        notas_medicas TEXT,
        observaciones TEXT
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS planes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo_plan TEXT CHECK(tipo_plan IN ('tiempo','creditos','mixto')) NOT NULL,
        precio REAL NOT NULL,
        creditos_totales INTEGER,
        duracion_dias INTEGER,
        activo INTEGER DEFAULT 1
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS suscripciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alumno_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        fecha_inicio TEXT DEFAULT CURRENT_DATE,
        fecha_fin TEXT,
        creditos_actuales INTEGER,
        estado TEXT DEFAULT 'activa',
        FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
        FOREIGN KEY (plan_id) REFERENCES planes(id)
      );
    `);

    db.run(`
  CREATE TABLE IF NOT EXISTS clases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia TEXT NOT NULL,
    hora TEXT NOT NULL,
    cupo_maximo INTEGER NOT NULL,
    profesor TEXT,
    tipo_clase TEXT DEFAULT 'Pilates'
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clase_id INTEGER NOT NULL,
    alumno_id INTEGER NOT NULL,
    presente INTEGER DEFAULT 0,
    FOREIGN KEY (clase_id) REFERENCES clases(id),
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
  );
`);

  });
}

module.exports = crearTablas;
