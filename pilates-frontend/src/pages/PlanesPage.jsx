import { useEffect, useState } from "react";

export default function PlanesPage() {
  const [planes, setPlanes] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlan, setEditPlan] = useState({
    id: "",
    nombre: "",
    tipo: "",
    precio: "",
    creditos: "",
    duracion: "",
  });

  const [nuevoPlan, setNuevoPlan] = useState({
    nombre: "",
    tipo: "",
    precio: "",
    creditos: "",
    duracion_dias: "",
  });

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = () => {
    fetch("http://localhost:3001/planes")
      .then(res => res.json())
      .then(data => setPlanes(data))
      .catch(err => console.error(err));
  };

  const crearPlan = () => {
    const { nombre, tipo, precio, creditos, duracion_dias } = nuevoPlan;

    if (!nombre || !tipo || !precio) {
      alert("Completá al menos nombre, tipo y precio.");
      return;
    }

    fetch("http://localhost:3001/planes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPlan),
    })
      .then(res => res.json())
      .then(() => {
        setNuevoPlan({
          nombre: "",
          tipo: "",
          precio: "",
          creditos: "",
          duracion_dias: "",
        });
        cargarPlanes();
      });
  };

  const openEdit = (plan) => {
    setEditPlan({
      id: plan.id,
      nombre: plan.nombre,
      tipo: plan.tipo,
      precio: plan.precio,
      creditos: plan.creditos_totales,
      duracion: plan.duracion_dias,
    });
    setShowEditModal(true);
  };

  const guardarEdicion = () => {
    fetch(`http://localhost:3001/planes/${editPlan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: editPlan.nombre,
        tipo: editPlan.tipo,
        precio: editPlan.precio,
        creditos_totales: editPlan.creditos,
        duracion_dias: editPlan.duracion,
      }),
    }).then(() => {
      setShowEditModal(false);
      cargarPlanes();
    });
  };

  const eliminarPlan = (id) => {
    if (!confirm("¿Eliminar este plan?")) return;

    fetch(`http://localhost:3001/planes/${id}`, {
      method: "DELETE",
    }).then(() => cargarPlanes());
  };

  return (
    <div style={styles.container}>
      <h2>Planes</h2>

      {/* FORM NUEVO PLAN */}
      <div style={styles.card}>
        <h3>Agregar Plan</h3>
        <div style={styles.form}>
          <input
            placeholder="Nombre"
            value={nuevoPlan.nombre}
            onChange={(e) => setNuevoPlan({ ...nuevoPlan, nombre: e.target.value })}
            style={styles.input}
          />

          <select
            value={nuevoPlan.tipo}
            onChange={(e) => setNuevoPlan({ ...nuevoPlan, tipo: e.target.value })}
            style={styles.input}
          >
            <option value="">Tipo</option>
            <option value="tiempo">Tiempo</option>
            <option value="creditos">Créditos</option>
            <option value="mixto">Mixto</option>
          </select>

          <input
            type="number"
            placeholder="Precio"
            value={nuevoPlan.precio}
            onChange={(e) => setNuevoPlan({ ...nuevoPlan, precio: e.target.value })}
            style={styles.input}
          />

          <input
            type="number"
            placeholder="Créditos"
            value={nuevoPlan.creditos}
            onChange={(e) => setNuevoPlan({ ...nuevoPlan, creditos: e.target.value })}
            style={styles.input}
          />

          <input
            type="number"
            placeholder="Duración (días)"
            value={nuevoPlan.duracion_dias}
            onChange={(e) => setNuevoPlan({ ...nuevoPlan, duracion_dias: e.target.value })}
            style={styles.input}
          />

          <button style={styles.btn} onClick={crearPlan}>Crear</button>
        </div>
      </div>

      {/* LISTADO */}
      <div style={styles.card}>
        <h3>Listado</h3>

        {planes.length === 0 && <p>No hay planes cargados.</p>}

        {planes.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Créditos</th>
                <th>Días</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.tipo}</td>
                  <td>${p.precio}</td>
                  <td>{p.creditos_totales || "-"}</td>
                  <td>{p.duracion_dias || "-"}</td>
                  <td>
                    <button style={styles.editBtn} onClick={() => openEdit(p)}>✏</button>
                    <button style={styles.deleteBtn} onClick={() => eliminarPlan(p.id)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Editar Plan</h3>

            <input
              style={styles.input}
              value={editPlan.nombre}
              onChange={(e) => setEditPlan({ ...editPlan, nombre: e.target.value })}
            />

            <select
              style={styles.input}
              value={editPlan.tipo}
              onChange={(e) => setEditPlan({ ...editPlan, tipo: e.target.value })}
            >
              <option value="tiempo">Tiempo</option>
              <option value="creditos">Créditos</option>
              <option value="mixto">Mixto</option>
            </select>

            <input
              type="number"
              style={styles.input}
              value={editPlan.precio}
              onChange={(e) => setEditPlan({ ...editPlan, precio: e.target.value })}
            />

            <input
              type="number"
              style={styles.input}
              value={editPlan.creditos}
              onChange={(e) => setEditPlan({ ...editPlan, creditos: e.target.value })}
            />

            <input
              type="number"
              style={styles.input}
              value={editPlan.duracion}
              onChange={(e) => setEditPlan({ ...editPlan, duracion: e.target.value })}
            />

            <div style={styles.modalActions}>
              <button style={styles.okBtn} onClick={guardarEdicion}>Guardar</button>
              <button style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 20, color: "#fff" },
  card: {
    background: "#222",
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
    gridColumn: "1 / -1",
    padding: 12,
    background: "#007bff",
    border: "none",
    color: "#fff",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  editBtn: {
    marginRight: 10,
    padding: "5px 8px",
    background: "#4da3ff",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 8px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },

  // MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#111",
    padding: 20,
    borderRadius: 10,
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
  },
  okBtn: {
    background: "#28a745",
    padding: 10,
    border: "none",
    color: "#fff",
    borderRadius: 5,
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#d9534f",
    padding: 10,
    border: "none",
    color: "#fff",
    borderRadius: 5,
    cursor: "pointer",
  },
};
