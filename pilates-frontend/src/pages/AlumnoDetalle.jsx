import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function AlumnoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [suscripcionActiva, setSuscripcionActiva] = useState(null);
  const [historial, setHistorial] = useState([]);

  const [form, setForm] = useState({
    plan_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    creditos_actuales: 0,
  });

  useEffect(() => {
    cargarAlumno();
    cargarPlanes();
    cargarSuscripcionActiva();
    cargarHistorial();
  }, []);

  const cargarAlumno = async () => {
    const res = await fetch(`http://localhost:3001/alumnos`);
    const data = await res.json();
    const encontrado = data.find(a => a.id == id);
    setAlumno(encontrado || null);
  };

  const cargarPlanes = async () => {
    const res = await fetch("http://localhost:3001/planes");
    const data = await res.json();
    setPlanes(data);
  };

  const cargarSuscripcionActiva = async () => {
    const res = await fetch(`http://localhost:3001/suscripciones/activo/${id}`);
    const data = await res.json();
    setSuscripcionActiva(data);
  };

  const cargarHistorial = async () => {
    const res = await fetch(`http://localhost:3001/suscripciones/activas`);
    const data = await res.json();
    const historialFiltrado = data.filter(s => s.alumno_id == id);
    setHistorial(historialFiltrado);
  };

  const asignarPlan = async (e) => {
    e.preventDefault();

    if (!form.plan_id || !form.fecha_inicio || !form.fecha_fin) {
      alert("Faltan completar campos");
      return;
    }

    const res = await fetch("http://localhost:3001/suscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alumno_id: id,
        plan_id: form.plan_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        creditos_actuales: form.creditos_actuales,
      }),
    });

    if (res.ok) {
      alert("Plan asignado correctamente");
      cargarSuscripcionActiva();
      cargarHistorial();
    }
  };

  if (!alumno) return <p style={{ color: "#fff", padding: "20px" }}>Cargando...</p>;

  return (
    <div style={styles.container}>
      <h2>Detalle del Alumno</h2>

      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Volver
      </button>

      {/* DATOS DEL ALUMNO */}
      <div style={styles.card}>
        <h3>{alumno.nombre} {alumno.apellido}</h3>
        <p><b>DNI:</b> {alumno.dni}</p>
        <p><b>Tel:</b> {alumno.telefono}</p>
        <p><b>Email:</b> {alumno.email}</p>
      </div>

      {/* SUSCRIPCIÓN ACTIVA */}
      <div style={styles.card}>
        <h3>Suscripción Activa</h3>

        {suscripcionActiva ? (
          <div>
            <p><b>Plan:</b> {suscripcionActiva.plan_nombre}</p>
            <p><b>Inicio:</b> {suscripcionActiva.fecha_inicio}</p>
            <p><b>Fin:</b> {suscripcionActiva.fecha_fin}</p>
            <p><b>Créditos:</b> {suscripcionActiva.creditos_actuales}</p>
          </div>
        ) : (
          <p>No tiene suscripción activa</p>
        )}
      </div>

      {/* ASIGNAR NUEVO PLAN */}
      <div style={styles.card}>
        <h3>Asignar Nuevo Plan</h3>

        <form style={styles.form} onSubmit={asignarPlan}>
          <select
            value={form.plan_id}
            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
            style={styles.input}
          >
            <option value="">Seleccionar plan...</option>
            {planes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            style={styles.input}
          />

          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            style={styles.input}
          />

          <input
            type="number"
            value={form.creditos_actuales}
            placeholder="Créditos iniciales"
            onChange={(e) => setForm({ ...form, creditos_actuales: e.target.value })}
            style={styles.input}
          />

          <button type="submit" style={styles.btn}>Asignar Plan</button>
        </form>
      </div>

      {/* HISTORIAL */}
      <div style={styles.card}>
        <h3>Historial del Alumno</h3>

        {historial.length === 0 && <p>No tiene historial registrado</p>}

        {historial.length > 0 && (
          <ul>
            {historial.map(h => (
              <li key={h.id}>
                {h.plan_nombre} | {h.fecha_inicio} → {h.fecha_fin}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    color: "#fff",
  },
  backBtn: {
    background: "#444",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    marginBottom: 20,
  },
  card: {
    background: "#222",
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  form: {
    display: "grid",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 5,
    border: "1px solid #555",
    background: "#111",
    color: "#fff",
  },
  btn: {
    padding: 12,
    background: "#28a745",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: 5,
    cursor: "pointer",
  },
};
