import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ClaseDetalle() {
  const { id } = useParams();
  const [clase, setClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [todosAlumnos, setTodosAlumnos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState("");

  const cargarDatos = () => {
    fetch(`http://localhost:3001/clases/${id}`)
      .then(res => res.json())
      .then(data => {
        setClase(data);
        setAlumnos(data.alumnos);
      });
  };

  const cargarAlumnos = () => {
    fetch("http://localhost:3001/alumnos")
      .then(res => res.json())
      .then(data => setTodosAlumnos(data));
  };

  useEffect(() => {
    cargarDatos();
    cargarAlumnos();
  }, [id]);

  const agregarAlumno = () => {
    if (!selectedAlumno) return;

    fetch("http://localhost:3001/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clase_id: id, alumno_id: selectedAlumno })
    })
      .then(r => r.json())
      .then(() => {
        cargarDatos();
        setSelectedAlumno("");
      })
      .catch(err => console.error(err));
  };

  const quitarAlumno = reserva_id => {
    fetch(`http://localhost:3001/reservas/${reserva_id}`, {
      method: "DELETE"
    })
      .then(r => r.json())
      .then(() => cargarDatos());
  };

  if (!clase) return <p>Cargando detalle...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Clase {clase.dia} - {clase.hora}
      </h2>
      <p>
        Profesor: {clase.profesor} | Tipo: {clase.tipo_clase}
      </p>
      <p>
        Cupo: {clase.cupo_maximo} | Ocupados: {clase.ocupados} | Libres:{" "}
        {clase.cupo_maximo - clase.ocupados}
      </p>

      <h3>Alumnos inscriptos</h3>
      <ul>
        {alumnos.map(a => (
          <li key={a.reserva_id}>
            {a.nombre} {a.apellido}{" "}
            <button onClick={() => quitarAlumno(a.reserva_id)}>Quitar</button>
          </li>
        ))}
      </ul>

      <h3>Agregar alumno</h3>
      <select
        value={selectedAlumno}
        onChange={e => setSelectedAlumno(e.target.value)}
      >
        <option value="">Seleccionar alumno...</option>
        {todosAlumnos.map(a => (
          <option key={a.id} value={a.id}>
            {a.nombre} {a.apellido}
          </option>
        ))}
      </select>
      <button onClick={agregarAlumno}>Agregar</button>
    </div>
  );
}

export default ClaseDetalle;
