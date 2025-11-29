const API_URL = "http://localhost:3001";

let alumnoSeleccionado = null;
let planesGlobales = [];

// -------------------- ALUMNOS --------------------

document.getElementById("formAlumno").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevoAlumno = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    dni: document.getElementById("dni").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
  };

  await fetch(`${API_URL}/alumnos`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(nuevoAlumno)
  });

  e.target.reset();
  cargarAlumnos();
});

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
        <td id="plan-${a.id}">-</td>
        <td>
  <button onclick="seleccionarAlumno(${a.id})">Seleccionar</button>
  <button onclick="abrirEdicionAlumno(${a.id}, '${a.nombre}', '${a.apellido}', '${a.dni}', '${a.telefono}', '${a.email}')">Editar</button>
  <button onclick="eliminarAlumno(${a.id})">Eliminar</button>
  <button onclick="abrirAsignacion(${a.id})">Asignar Plan</button>
</td>
      </tr>
    `;

    cargarPlanActivo(a.id);
  });
}

function seleccionarAlumno(id) {
  alumnoSeleccionado = id;
  alert("Alumno seleccionado correctamente!");
}

// -------------------- PLANES --------------------

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
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(nuevoPlan)
  });

  e.target.reset();
  cargarPlanes();
});

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

// Modal plan
function abrirAsignacion(alumno_id) {
  alumnoSeleccionado = alumno_id;
  const sel = document.getElementById("selectPlan");
  sel.innerHTML = "";

  planesGlobales.forEach(p => {
    sel.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
  });

  document.getElementById("modalPlan").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modalPlan").style.display = "none";
  alumnoSeleccionado = null;
}

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
    headers: {"Content-Type": "application/json"},
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

async function cargarPlanActivo(alumno_id) {
  const res = await fetch(`${API_URL}/suscripciones/activo/${alumno_id}`);
  if (!res.ok) return;

  const data = await res.json();
  const celda = document.getElementById(`plan-${alumno_id}`);

  if (celda) celda.textContent = data ? data.plan_nombre : "Sin plan";
}

// -------------------- CLASES --------------------

document.getElementById("formClase").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevaClase = {
    dia: document.getElementById("claseDia").value,
    hora: document.getElementById("claseHora").value,
    cupo_maximo: parseInt(document.getElementById("claseCupo").value),
    profesor: document.getElementById("claseProfesor").value,
    tipo_clase: document.getElementById("claseTipo").value
  };

  await fetch(`${API_URL}/clases`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(nuevaClase)
  });

  e.target.reset();
  cargarClases();
});

async function cargarClases() {
  const res = await fetch(`${API_URL}/clases`);
  const clases = await res.json();

  const tbody = document.getElementById("tablaClases");
  tbody.innerHTML = "";

  for (const c of clases) {
    const r = await fetch(`${API_URL}/reservas/clase/${c.id}`);
    let reservas = [];
    if (r.ok) reservas = await r.json();

    tbody.innerHTML += `
      <tr>
        <td>${c.dia}</td>
        <td>${c.hora}</td>
        <td>${c.profesor || "-"}</td>
        <td>${c.cupo_maximo}</td>
        <td>${reservas.length}</td>
        <td>
          <button onclick="reservarClase(${c.id})">Reservar</button>
          <button onclick="mostrarReservas(${c.id})">Ver reservas</button>
        </td>
      </tr>
    `;
  }
}

async function reservarClase(clase_id) {
  if (!alumnoSeleccionado) {
    alert("Primero seleccione un alumno con Asignar Plan");
    return;
  }

  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      clase_id,
      alumno_id: alumnoSeleccionado
    })
  });

  const data = await res.json();

  if (data.error) alert(data.error);
  else {
    alert("Reserva realizada!");
    cargarClases();
    cargarPlanActivo(alumnoSeleccionado);
  }
}

// -------------------- ASISTENCIA --------------------

async function mostrarReservas(clase_id) {
  const res = await fetch(`${API_URL}/reservas/clase/${clase_id}`);
  let reservas = [];
  if (res.ok) reservas = await res.json();

  const tbody = document.getElementById("tablaReservasClase");
  tbody.innerHTML = "";

  reservas.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.nombre} ${r.apellido}</td>
        <td>
          <input type="checkbox" 
            onchange="marcarAsistencia(${r.id}, this.checked)"
            ${r.presente ? "checked" : ""}
          >
        </td>
      </tr>
    `;
  });

  document.getElementById("modalReservas").style.display = "block";
}

async function marcarAsistencia(reserva_id, presente) {
  await fetch(`${API_URL}/reservas/${reserva_id}/presente`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ presente: presente ? 1 : 0 })
  });
}

function cerrarModalReservas() {
  document.getElementById("modalReservas").style.display = "none";
}

let alumnoEditando = null;

function abrirEdicionAlumno(id, nombre, apellido, dni, telefono, email) {
  alumnoEditando = id;
  document.getElementById("editNombre").value = nombre;
  document.getElementById("editApellido").value = apellido;
  document.getElementById("editDni").value = dni;
  document.getElementById("editTel").value = telefono;
  document.getElementById("editEmail").value = email;

  document.getElementById("modalAlumno").style.display = "block";
}

function cerrarModalAlumno() {
  document.getElementById("modalAlumno").style.display = "none";
  alumnoEditando = null;
}

async function guardarEdicionAlumno() {
  const updated = {
    nombre: document.getElementById("editNombre").value,
    apellido: document.getElementById("editApellido").value,
    dni: document.getElementById("editDni").value,
    telefono: document.getElementById("editTel").value,
    email: document.getElementById("editEmail").value
  };

  const res = await fetch(`${API_URL}/alumnos/${alumnoEditando}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updated)
  });

  const data = await res.json();
  if (data.error) alert(data.error);

  cerrarModalAlumno();
  cargarAlumnos();
}

async function eliminarAlumno(id) {
  if (!confirm("¿Seguro que querés eliminar este alumno?")) return;

  const res = await fetch(`${API_URL}/alumnos/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (data.error) alert(data.error);
  else alert("Alumno eliminado correctamente");

  cargarAlumnos();
}

// -------------------- INICIALIZAR --------------------

cargarAlumnos();
cargarPlanes();
cargarClases();
