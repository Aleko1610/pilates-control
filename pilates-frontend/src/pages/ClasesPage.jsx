import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ClasesPage() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/clases")
      .then(res => res.json())
      .then(data => {
        setClases(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <p>Cargando clases...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Clases</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Profesor</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clases.map(c => (
            <tr key={c.id}>
              <td>{c.dia}</td>
              <td>{c.hora}</td>
              <td>{c.profesor}</td>
              <td>{c.tipo_clase}</td>
              <td>
                <Link to={`/clases/${c.id}`}>Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClasesPage;
