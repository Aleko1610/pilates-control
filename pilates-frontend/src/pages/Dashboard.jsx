import { useEffect, useState } from "react";

export default function Dashboard() {

  const [hoyClases, setHoyClases] = useState([]);
  const [suscripcionesActivas, setSuscripcionesActivas] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [alumnosTotal, setAlumnosTotal] = useState(0);
  const [reservasDelDia, setReservasDelDia] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {

    const fechaHoy = new Date().toISOString().split("T")[0];

    // Clases del día
    const clasesRes = await fetch(`http://localhost:3001/clases/dia/${fechaHoy}`);
    const clasesData = await clasesRes.json();
    setHoyClases(clasesData);

    // Suscripciones activas
    const susRes = await fetch("http://localhost:3001/suscripciones/activas");
    setSuscripcionesActivas(await susRes.json());

    // Vencimientos próximos
    const venRes = await fetch("http://localhost:3001/suscripciones/vencimientos");
    setVencimientos(await venRes.json());

    // Total de alumnos
    const aluRes = await fetch("http://localhost:3001/alumnos");
    const alumnos = await aluRes.json();
    setAlumnosTotal(alumnos.length);

    // Reservas del día
    const reservasRes = await fetch(`http://localhost:3001/reservas/hoy/${fechaHoy}`);
    const reservas = await reservasRes.json();
    setReservasDelDia(reservas.length);
  };

  return (
    <div style={styles.container}>

      <h1>Dashboard</h1>

      {/* ==================== TARJETAS SUPERIORES ==================== */}
      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <h2>{alumnosTotal}</h2>
          <p>Alumnos registrados</p>
        </div>

        <div style={styles.card}>
          <h2>{hoyClases.length}</h2>
          <p>Clases hoy</p>
        </div>

        <div style={styles.card}>
          <h2>{reservasDelDia}</h2>
          <p>Reservas del día</p>
        </div>

        <div style={styles.card}>
          <h2>{suscripcionesActivas.length}</h2>
          <p>Suscripciones activas</p>
        </div>
      </div>

      {/* ==================== CLASES DEL DÍA ==================== */}
      <div style={styles.section}>
        <h2>Clases de hoy</h2>

        {hoyClases.length === 0 && <p>No hay clases programadas para hoy.</p>}

        {hoyClases.map(c => (
          <div key={c.id} style={styles.item}>
            <b>{c.tipo_clase}</b> - {c.hora} - Prof: {c.profesor}  
            <span style={{ color: "#4da3ff" }}>
              &nbsp; ({c.ocupados}/{c.cupo_maximo})
            </span>
          </div>
        ))}
      </div>

      {/* ==================== VENCIMIENTOS ==================== */}
      <div style={styles.section}>
        <h2>Vencimientos próximos (7 días)</h2>

        {vencimientos.length === 0 && <p>No hay vencimientos cercanos.</p>}

        {vencimientos.map(s => (
          <div key={s.id} style={styles.itemVencimiento}>
            {s.alumno_nombre} {s.alumno_apellido}  
            <span style={{ color: "#ff4444" }}>
              &nbsp; vence en {Math.ceil(s.dias_restantes)} días
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    color: "#fff"
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    marginBottom: 30
  },
  card: {
    background: "#222",
    padding: 20,
    borderRadius: 10,
    textAlign: "center"
  },
  section: {
    marginTop: 30,
    background: "#1a1a1a",
    padding: 20,
    borderRadius: 10
  },
  item: {
    padding: 8,
    borderBottom: "1px solid #333"
  },
  itemVencimiento: {
    padding: 8,
    borderBottom: "1px solid #333",
    color: "#fff"
  }
};
