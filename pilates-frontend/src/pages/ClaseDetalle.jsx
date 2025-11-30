import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ClaseDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clase, setClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [reservas, setReservas] = useState([]);

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");

  useEffect(() => {
    cargarClase();
    cargarAlumnos();
    cargarReservas();
  }, []);

  const cargarClase = async () => {
    const res = await fetch(`http://localhost:3001/clases/${id}`);
    const data = await res.json();
    setClase(data);
  };

  const cargarAlumnos = async () => {
    const res = await fetch("http://localhost:3001/alumnos");
    const data = await res.json();
    setAlumnos(data);
  };

  const cargarReservas = async () => {
    const res = await fetch(`http://localhost:3001/reservas/clase/${id}`);
    const data = await res.json();
    setReservas(data);
  };

  const agregarReserva = async () => {
    if (!alumnoSeleccionado) {
      alert("Seleccioná un alumno");
      return;
    }

    const res = await fetch("http://localhost:3001/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clase_id: id,
        alumno_id: alumnoSeleccionado,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setAlumnoSeleccionado("");
    cargarClase();
    cargarReservas();
  };

  const eliminarReserva = async (reserva_id) => {
    if (!confirm("¿Eliminar reserva?")) return;

    await fetch(`http://localhost:3001/reservas/${reserva_id}`, {
      method: "DELETE",
    });

    cargarClase();
    cargarReservas();
  };

  const marcarPresente = async (reserva_id, presente) => {
    await fetch(`http://localhost:3001/reservas/${reserva_id}/presente`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presente }),
    });

    cargarReservas();
  };

  if (!clase) return <p style={{ color: "#fff" }}>Cargando...</p>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Volver
      </button>

      <h2>Clase {clase.tipo_clase}</h2>

      <div style={styles.card}>
        <p><b>Día:</b> {clase.dia}</p>
        <p><b>Hora:</b> {clase.hora}</p>
        <p><b>Profesor:</b> {clase.profesor}</p>
        <p>
          <b>Cupo:</b> {clase.ocupados}/{clase.cupo_maximo}
        </p>
      </div>

      <div style={styles.card}>
        <h3>Agregar Alumno</h3>

        <div style={styles.addReservaBox}>
          <select
            value={alumnoSeleccionado}
            onChange={(e) => setAlumnoSeleccionado(e.target.value)}
            style={styles.input}
          >
            <option value="">Seleccionar...</option>
            {alumnos.map(a => (
              <option key={a.id} value={a.id}>
                {a.nombre} {a.apellido}
              </option>
            ))}
          </select>

          <button onClick={agregarReserva} style={styles.okBtn}>
            Agregar
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Reservas</h3>

        {reservas.length === 0 && <p>No hay alumnos inscriptos.</p>}

        {reservas.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Presente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>

              {reservas.map(r => (
                <tr key={r.id}>
                  <td>{r.nombre} {r.apellido}</td>

                  <td>
                    <input
                      type="checkbox"
                      checked={r.presente === 1}
                      onChange={(e) =>
                        marcarPresente(r.id, e.target.checked ? 1 : 0)
                      }
                    />
                  </td>

                  <td>
                    <button
                      onClick={() => eliminarReserva(r.id)}
                      style={styles.deleteBtn}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20, color: "#fff" },
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
  addReservaBox: {
    display: "flex",
    gap: 10,
  },
  input: {
    padding: 10,
    background: "#111",
    border: "1px solid #555",
    color: "#fff",
    borderRadius: 5,
  },
  okBtn: {
    padding: "10px 14px",
    background: "#28a745",
    border: "none",
    color: "#fff",
    borderRadius: 5,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};
