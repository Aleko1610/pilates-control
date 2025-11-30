import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ClasesPage() {
  const [clases, setClases] = useState([]);
  const [filteredClases, setFilteredClases] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterProfe, setFilterProfe] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [nuevaClase, setNuevaClase] = useState({
    dia: "",
    hora: "",
    profesor: "",
    tipo_clase: "",
    cupo_maximo: ""
  });

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = () => {
    fetch("http://localhost:3001/clases")
      .then(res => res.json())
      .then(data => {
        setClases(data);
        setFilteredClases(data);
        setProfesores([...new Set(data.map(c => c.profesor))]);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    let result = clases;

    if (filterDate) result = result.filter(c => c.dia === filterDate);
    if (filterProfe) result = result.filter(c => c.profesor === filterProfe);

    setFilteredClases(result);
  }, [filterDate, filterProfe, clases]);

  const crearClase = () => {
    const { dia, hora, profesor, tipo_clase, cupo_maximo } = nuevaClase;

    if (!dia || !hora || !profesor || !tipo_clase || !cupo_maximo) {
      alert("Completar todos los campos");
      return;
    }

    fetch("http://localhost:3001/clases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuevaClase, cupo_maximo: Number(cupo_maximo) })
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        setNuevaClase({
          dia: "",
          hora: "",
          profesor: "",
          tipo_clase: "",
          cupo_maximo: ""
        });
        cargarClases();
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Clases</h2>

      <div style={styles.filters}>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={styles.input}
        />
        <select
          value={filterProfe}
          onChange={(e) => setFilterProfe(e.target.value)}
          style={styles.input}
        >
          <option value="">Profesor...</option>
          {profesores.map((profe, idx) => (
            <option key={idx} value={profe}>
              {profe}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.cards}>
        {filteredClases.map(clase => (
          <div key={clase.id} style={styles.card}>
            <h3 style={styles.cardTitle}>{clase.tipo_clase}</h3>
            <p>{clase.dia} - {clase.hora}</p>
            <p><strong>{clase.profesor}</strong></p>
            <div style={styles.cupoBox}>
  Cupo: {clase.ocupados}/{clase.cupo_maximo}
</div>

            <Link to={`/clases/${clase.id}`} style={styles.btn}>
              Ver detalles
            </Link>
          </div>
        ))}

        {filteredClases.length === 0 && (
          <p style={{ color: "#bbb", gridColumn: "1 / -1" }}>No hay clases</p>
        )}
      </div>

      {/* BOTÓN FLOTANTE */}
      <button onClick={() => setShowModal(true)} style={styles.addFloatingBtn}>
        +
      </button>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Nueva Clase</h3>

            <input type="date"
              value={nuevaClase.dia}
              onChange={e => setNuevaClase({ ...nuevaClase, dia: e.target.value })}
              style={styles.input}
            />
            <input type="time"
              value={nuevaClase.hora}
              onChange={e => setNuevaClase({ ...nuevaClase, hora: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Profesor"
              value={nuevaClase.profesor}
              onChange={e => setNuevaClase({ ...nuevaClase, profesor: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Tipo"
              value={nuevaClase.tipo_clase}
              onChange={e => setNuevaClase({ ...nuevaClase, tipo_clase: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Cupo"
              value={nuevaClase.cupo_maximo}
              onChange={e => setNuevaClase({ ...nuevaClase, cupo_maximo: e.target.value })}
              style={styles.input}
            />

            <div style={styles.modalActions}>
              <button onClick={crearClase} style={styles.okBtn}>Crear</button>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { padding: "20px", color: "#fff", width: "100%" },
  title: { marginBottom: "10px" },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#1c1c1c",
    color: "#fff"
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "15px"
  },
  card: {
    background: "#1a1a1a",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  cardTitle: {
    color: "#4da6ff",
    fontSize: "1.1rem",
    marginBottom: "5px"
  },
  cupoBox: {
    padding: "5px",
    borderRadius: "6px",
    background: "#292929",
    textAlign: "center",
    color: "#bbb",
    fontSize: "14px"
  },
  btn: {
    padding: "8px",
    background: "#007bff",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },
  addFloatingBtn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#28a745",
    border: "none",
    color: "#fff",
    fontSize: "32px",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
    zIndex: 1000
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000
  },
  modal: {
    background: "#222",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    border: "1px solid #444",
    color: "#fff"
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between"
  },
  okBtn: {
    background: "#28a745",
    border: "none",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  cancelBtn: {
    background: "#dc3545",
    border: "none",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default ClasesPage;
