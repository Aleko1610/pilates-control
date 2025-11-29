import { useEffect, useState } from "react";

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: ""
  });

  const cargarAlumnos = () => {
    fetch("http://localhost:3001/alumnos")
      .then(res => res.json())
      .then(data => setAlumnos(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const handleChange = (e) => {
    setNuevoAlumno({
      ...nuevoAlumno,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { nombre, apellido, dni, telefono, email } = nuevoAlumno;

    if (!nombre || !apellido || !dni || !telefono || !email) {
      alert("Todos los campos son obligatorios");
      return;
    }

    fetch("http://localhost:3001/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoAlumno)
    })
      .then(() => {
        setNuevoAlumno({
          nombre: "",
          apellido: "",
          dni: "",
          telefono: "",
          email: ""
        });
        cargarAlumnos();
      });
  };

  const eliminarAlumno = (id) => {
    if (!confirm("¿Seguro que querés eliminar este alumno?")) return;

    fetch(`http://localhost:3001/alumnos/${id}`, {
      method: "DELETE",
    }).then(cargarAlumnos);
  };

  return (
    <div style={{ color: "#fff" }}>
      <h2>Alumnos</h2>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="nombre" placeholder="Nombre" value={nuevoAlumno.nombre} onChange={handleChange} style={styles.input} />
        <input name="apellido" placeholder="Apellido" value={nuevoAlumno.apellido} onChange={handleChange} style={styles.input} />
        <input name="dni" placeholder="DNI" value={nuevoAlumno.dni} onChange={handleChange} style={styles.input} maxLength="8" />
        <input name="telefono" placeholder="Teléfono" value={nuevoAlumno.telefono} onChange={handleChange} style={styles.input} />
        <input name="email" placeholder="Email" value={nuevoAlumno.email} onChange={handleChange} style={styles.input} type="email"/>
        <button type="submit" style={styles.btnAdd}>Agregar</button>
      </form>

      {/* LISTADO */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map(a => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td>{a.apellido}</td>
              <td>{a.dni}</td>
              <td>{a.telefono}</td>
              <td>{a.email}</td>
              <td>
                <button onClick={() => eliminarAlumno(a.id)} style={styles.deleteBtn}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {alumnos.length === 0 && <p>No hay alumnos cargados</p>}
    </div>
  );
}

const styles = {
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "10px",
    margin: "15px 0"
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "#1f1f1f",
    color: "#fff"
  },
  btnAdd: {
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
    borderRadius: "10px"
  },
  deleteBtn: {
    background: "#dc3545",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "#fff",
    padding: "4px 8px"
  }
};

export default Alumnos;
