import { useEffect, useState } from "react";

function Planes() {
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    precio: "",
    creditos: "",
    duracion: ""
  });

  const cargar = () => {
    fetch("http://localhost:3001/planes")
      .then(res => res.json())
      .then(data => setPlanes(data));
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { nombre, tipo, precio } = form;
    if (!nombre || !tipo || !precio) {
      alert("Todos los campos obligatorios completarlos");
      return;
    }

    fetch("http://localhost:3001/planes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).then(() => {
      setForm({ nombre: "", tipo: "", precio: "", creditos: "", duracion: "" });
      cargar();
    });
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar plan?")) return;

    fetch(`http://localhost:3001/planes/${id}`, { method: "DELETE" }).then(cargar);
  };

  return (
    <div style={{ color: "#fff" }}>
      <h2>Planes</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} style={styles.input} />

        <select name="tipo" value={form.tipo} onChange={handleChange} style={styles.input}>
          <option value="">Tipo</option>
          <option value="tiempo">Tiempo</option>
          <option value="creditos">Créditos</option>
          <option value="mixto">Mixto</option>
        </select>

        <input name="precio" type="number" placeholder="Precio" value={form.precio} onChange={handleChange} style={styles.input}/>

        {(form.tipo === "creditos" || form.tipo === "mixto") && (
          <input name="creditos" type="number" placeholder="Créditos" value={form.creditos} onChange={handleChange} style={styles.input} />
        )}

        {(form.tipo === "tiempo" || form.tipo === "mixto") && (
          <input name="duracion" type="number" placeholder="Días" value={form.duracion} onChange={handleChange} style={styles.input} />
        )}

        <button type="submit" style={styles.addBtn}>Agregar</button>
      </form>

      {/* LIST */}
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
          {planes.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.tipo}</td>
              <td>${p.precio}</td>
              <td>{p.creditos || "-"}</td>
              <td>{p.duracion || "-"}</td>
              <td>
                <button onClick={() => eliminar(p.id)} style={styles.deleteBtn}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {planes.length === 0 && <p>No hay planes cargados</p>}
    </div>
  );
}

const styles = {
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "10px",
    margin: "20px 0"
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "#1f1f1f",
    color: "#fff"
  },
  addBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    background: "#222",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px"
  },
  deleteBtn: {
    background: "#dc3545",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    padding: "5px 8px"
  }
};

export default Planes;
