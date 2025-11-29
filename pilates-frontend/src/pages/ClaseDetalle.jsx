import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function ClaseDetalle() {
  const { id } = useParams();

  const [clase, setClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState("");

  useEffect(() => {
    cargarClase();
    cargarAlumnos();
  }, []);

  const cargarClase = () => {
    fetch(`http://localhost:3001/clases/${id}`)
      .then(res => res.json())
      .then(data => setClase(data))
      .catch(err => console.error(err));
  };

  const cargarAlumnos = () => {
    fetch("http://localhost:3001/alumnos")
      .then(res => res.json())
      .then(data => setAlumnos(data))
      .catch(err => console.error(err));
  };

  const agregarReserva = () => {
    if (!selectedAlumno) return alert("Selecciona un alumno");

    fetch("http://localhost:3001/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clase_id: Number(id), alumno_id: Number(selectedAlumno) })
    })
      .then(res => res.json())
      .then(() => {
        setSelectedAlumno("");
        cargarClase();
      })
      .catch(err => console.error(err));
  };

  const eliminarReserva = (reserva_id) => {
    fetch(`http://localhost:3001/reservas/${reserva_id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(() => cargarClase())
      .catch(err => console.error(err));
  };

  if (!clase) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div style={styles.container}>
      <Link to="/clases" style={styles.volverBtn}>← Volver</Link>

      <h2>Clase: {clase.tipo_clase}</h2>
      <p><strong>{clase.dia} - {clase.hora}</strong></p>
      <p>Profesor: {clase.profesor}</p>
      <p>Cupo: {clase.ocupados} / {clase.cupo_maximo}</p>

      <hr style={{ borderColor: "#555" }} />

      <h3>Alumnos inscriptos</h3>

      {clase.alumnos.length === 0 ? (
        <p>No hay inscriptos todavía</p>
      ) : (
        <ul style={styles.lista}>
          {clase.alumnos.map(al => (
            <li key={al.reserva_id} style={styles.item}>
              {al.nombre} {al.apellido}
              <button
                style={styles.btnEliminar}
                onClick={() => eliminarReserva(al.reserva_id)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4>Agregar alumno</h4>
      <select
        value={selectedAlumno}
        onChange={(e) => setSelectedAlumno(e.target.value)}
        style={styles.input}
      >
        <option value="">Seleccione...</option>
        {alumnos.map(a => (
          <option key={a.id} value={a.id}>
            {a.nombre} {a.apellido}
          </option>
        ))}
      </select>
      <button style={styles.okBtn} onClick={agregarReserva}>
        Agregar
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    color: "#fff"
  },
  volverBtn: {
    display: "inline-block",
    marginBottom: "15px",
    background: "#444",
    padding: "8px 12px",
    borderRadius: "6px",
    color: "#fff",
    textDecoration: "none"
  },
  lista: {
    padding: 0,
    listStyle: "none",
    marginBottom: "10px"
  },
  item: {
    background: "#1c1c1c",
    marginBottom: "6px",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  btnEliminar: {
    background: "#dc3545",
    border: "none",
    padding: "4px 8px",
    borderRadius: "5px",
    color: "#fff",
    cursor: "pointer"
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#1c1c1c",
    color: "#fff",
    marginRight: "10px"
  },
  okBtn: {
    background: "#28a745",
    border: "none",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default ClaseDetalle;
