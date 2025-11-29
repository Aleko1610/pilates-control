const API_URL = "http://localhost:3001";

let alumnoSeleccionado = null;
let planesGlobales = [];

// Form Alta Alumno
document.getElementById("formAlumno").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevoAlumno = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    dni: document.getElementById("dni").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value
  };

  await fetch(`${API_URL}/alumnos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoAlumno)
  });

  e.target.reset();
  cargarAlumnos();
});

// Cargar alumnos
async function cargarAlumnos() {
  const res = await fetch(`${API_URL}/alumnos`);
  const alumnos = await res.json();

  const tbody = document.getElementById("tablaAlumnos");
  tbody.innerHTML = "";

  alumnos.forEach(a => {
    tbody.innerHTML += `
      <tr>
        <td>${a.nombre}</td>
        <td>${a.apellido}</td>
        <td>${a.dni}</td>
        <td>${a.telefono || "-"}</td>
        <td>${a.email || "-"}</td>
        <td><button onclick="abrirAsignacion(${a.id})">Asignar Plan</button></td>
        <td id="plan-${a.id}">Sin plan</td>
      </tr>
    `;

    // Después de insertar la fila, cargamos el plan activo
    cargarPlanActivo(a.id);
  });
}

// Form Alta Plan
document.getElementById("formPlan").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevoPlan = {
    nombre: document.getElementById("planNombre").value,
    tipo_plan: document.getElementById("planTipo").value,
    precio: parseFloat(document.getElementById("planPrecio").value),
    creditos_totales: document.getElementById("planCreditos").value || null,
    duracion_dias: document.getElementById("planDuracion").value || null
  };

  await fetch(`${API_URL}/planes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoPlan)
  });

  e.target.reset();
  cargarPlanes();
});

// Cargar planes
async function cargarPlanes() {
  const res = await fetch(`${API_URL}/planes`);
  planesGlobales = await res.json();

  const tbody = document.getElementById("tablaPlanes");
  tbody.innerHTML = "";

  planesGlobales.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.tipo_plan}</td>
        <td>$ ${p.precio}</td>
        <td>${p.creditos_totales ?? "-"}</td>
        <td>${p.duracion_dias ?? "-"}</td>
      </tr>
    `;
  });
}

// Obtener plan activo
async function cargarPlanActivo(alumno_id) {
  const res = await fetch(`${API_URL}/suscripciones/activo/${alumno_id}`);
  if (!res.ok) return;

  const data = await res.json();
  const celda = document.getElementById(`plan-${alumno_id}`);

  if (celda) {
    celda.textContent = data ? data.plan_nombre : "Sin plan";
  }
}

// Modal abrir
function abrirAsignacion(alumno_id) {
  alumnoSeleccionado = alumno_id;

  const sel = document.getElementById("selectPlan");
  sel.innerHTML = "";

  planesGlobales.forEach(p => {
    sel.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
  });

  document.getElementById("modalPlan").style.display = "block";
}

// Modal cerrar
function cerrarModal() {
  document.getElementById("modalPlan").style.display = "none";
  alumnoSeleccionado = null;
}

// Confirmar asignación de plan
async function confirmarAsignacion() {
  const plan_id = document.getElementById("selectPlan").value;
  const plan = planesGlobales.find(p => p.id == plan_id);

  let fecha_fin = null;
  let creditos_actuales = null;

if ((plan.tipo_plan === "tiempo" || plan.tipo_plan === "mixto") && plan.duracion_dias) {
  const hoy = new Date();
  const dias = parseInt(plan.duracion_dias);

  if (!isNaN(dias)) {
    hoy.setDate(hoy.getDate() + dias);
    fecha_fin = hoy.toISOString().split("T")[0];
  }
}

if ((plan.tipo_plan === "creditos" || plan.tipo_plan === "mixto") && plan.creditos_totales) {
  creditos_actuales = plan.creditos_totales;
}

await fetch(`${API_URL}/suscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alumno_id: alumnoSeleccionado,
      plan_id,
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin,
      creditos_actuales
    })
  });

  cerrarModal();
  cargarPlanActivo(alumnoSeleccionado);
}

// Primera carga
cargarAlumnos();
cargarPlanes();
