import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const [ocupacionHoy, setOcupacionHoy] = useState(0);
  const [clasesHoy, setClasesHoy] = useState(0);
  const [alumnosActivos, setAlumnosActivos] = useState(0);
  const [suscripciones, setSuscripciones] = useState([]);

  const [renovar, setRenovar] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [planNuevo, setPlanNuevo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [creditos, setCreditos] = useState("");

  const chartRefOcupacion = useRef(null);
  const chartInstanceOcupacion = useRef(null);

  useEffect(() => {
    cargarDatos();
    cargarPlanes();
  }, []);

  async function cargarPlanes() {
    const res = await fetch("http://localhost:3001/planes");
    const data = await res.json();
    setPlanes(data);
  }

  async function cargarDatos() {
    try {
      const hoy = new Date().toISOString().split("T")[0];

      const [r1, r2, r3] = await Promise.all([
        fetch(`http://localhost:3001/clases/dia/${hoy}`),
        fetch("http://localhost:3001/alumnos"),
        fetch("http://localhost:3001/suscripciones/activas")
      ]);

      const clasesDia = await r1.json();
      const alumnos = await r2.json();
      const subs = await r3.json();

      setClasesHoy(clasesDia.length);
      setAlumnosActivos(alumnos.length);
      setSuscripciones(subs);

      // Ocupación promedio del día
      if (clasesDia.length > 0) {
        const totalCupo = clasesDia.reduce((acc, c) => acc + c.cupo_maximo, 0);
        const totalReservas = clasesDia.reduce((acc, c) => acc + c.reservados, 0);
        const porcentaje = Math.round((totalReservas / totalCupo) * 100);
        setOcupacionHoy(porcentaje);
      }

      renderOcupacionChart([30, 50, 80, 40, 70, 90, 60]); // demo
    } catch (error) {
      console.error("Error Dashboard:", error);
    }
  }

  function renderOcupacionChart(data) {
    const ctx = chartRefOcupacion.current.getContext("2d");

    if (chartInstanceOcupacion.current) {
      chartInstanceOcupacion.current.destroy();
    }

    chartInstanceOcupacion.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        datasets: [
          {
            label: "Ocupación %",
            data,
            borderColor: "#4da3ff",
            backgroundColor: "rgba(77,163,255,0.3)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
    });
  }

  async function confirmarRenovacion() {
    try {
      // cerrar suscripción actual
      await fetch(`http://localhost:3001/suscripciones/cerrar/${renovar.suscripcion_id}`, {
        method: "PUT",
      });

      // crear nueva
      await fetch("http://localhost:3001/suscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumno_id: renovar.alumno_id,
          plan_id: planNuevo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          creditos_actuales: creditos,
        }),
      });

      setRenovar(null);
      cargarDatos();
    } catch (error) {
      console.error("Error al renovar:", error);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiBox}>
          <h3>Alumnos Activos</h3>
          <p>{alumnosActivos}</p>
        </div>

        <div style={styles.kpiBox}>
          <h3>Clases Hoy</h3>
          <p>{clasesHoy}</p>
        </div>

        <div style={styles.kpiBox}>
          <h3>Ocupación Hoy</h3>
          <p>{ocupacionHoy}%</p>
        </div>
      </div>

      {/* Gráfico */}
      <div style={styles.chartBox}>
        <h3>Ocupación últimos 7 días</h3>
        <canvas ref={chartRefOcupacion}></canvas>
      </div>

      {/* Suscripciones activas */}
      <h2 style={{ marginTop: 30 }}>Suscripciones Activas</h2>

      <div style={styles.cardsGrid}>
        {suscripciones.map((s) => (
          <div key={s.id} style={styles.card}>
            <h3>{s.alumno_nombre} {s.alumno_apellido}</h3>
            <p><strong>Plan:</strong> {s.plan_nombre}</p>
            <p><strong>Inicio:</strong> {s.fecha_inicio}</p>
            <p><strong>Fin:</strong> {s.fecha_fin}</p>
            <p><strong>Créditos:</strong> {s.creditos_actuales}</p>

            <button
              style={styles.btnRenovar}
              onClick={() => {
                setRenovar({ alumno_id: s.alumno_id, suscripcion_id: s.id });
              }}
            >
              Renovar
            </button>
          </div>
        ))}
      </div>

      {/* MODAL RENOVAR */}
      {renovar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Renovar Suscripción</h3>

            <label>Nuevo Plan</label>
            <select
              value={planNuevo}
              onChange={(e) => setPlanNuevo(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <label>Fecha inicio</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />

            <label>Fecha fin</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

            <label>Créditos</label>
            <input
              type="number"
              value={creditos}
              onChange={(e) => setCreditos(e.target.value)}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={confirmarRenovacion} style={styles.btnConfirm}>
                Confirmar
              </button>
              <button onClick={() => setRenovar(null)} style={styles.btnCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  kpiBox: {
    background: "#2b2b2b",
    padding: 20,
    borderRadius: 8,
    textAlign: "center",
  },
  chartBox: {
    marginTop: 40,
    padding: 20,
    background: "#2b2b2b",
    borderRadius: 8,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  card: {
    background: "#2b2b2b",
    padding: 20,
    borderRadius: 8,
  },
  btnRenovar: {
    marginTop: 10,
    padding: "8px 12px",
    background: "#4da3ff",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    color: "#000",
    padding: 20,
    width: 350,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  btnConfirm: {
    background: "green",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer",
  },
  btnCancel: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer",
  },
};
