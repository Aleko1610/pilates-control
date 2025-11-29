const API_URL = "http://localhost:3001";

let alumnoSeleccionado = null;
let planesGlobales = [];
let claseEditando = null;
let planEditando = null;
let alumnoEditando = null;

// === REFERENCIAS DOM ===
const formAlumno = document.getElementById("formAlumno");
const tablaAlumnos = document.getElementById("tablaAlumnos");

const modalAlumno = document.getElementById("modalAlumno");
const editNombreInput = document.getElementById("editNombre");
const editApellidoInput = document.getElementById("editApellido");
const editDniInput = document.getElementById("editDni");
const editTelInput = document.getElementById("editTel");
const editEmailInput = document.getElementById("editEmail");

const modalPlanAsignar = document.getElementById("modalPlan");
const selectPlan = document.getElementById("selectPlan");

const formPlan = document.getElementById("formPlan");
const tablaPlanes = document.getElementById("tablaPlanes");

const modalPlanEditar = document.getElementById("modalPlanEditar");
const editPlanNombreInput = document.getElementById("editPlanNombre");
const editPlanTipoSelect = document.getElementById("editPlanTipo");
const editPlanPrecioInput = document.getElementById("editPlanPrecio");
const editPlanCreditosInput = document.getElementById("editPlanCreditos");
const editPlanDuracionInput = document.getElementById("editPlanDuracion");

const formClase = document.getElementById("formClase");
const tablaClases = document.getElementById("tablaClases");

const modalClaseEditar = document.getElementById("modalClaseEditar");
const editClaseDiaInput = document.getElementById("editClaseDia");
const editClaseHoraInput = document.getElementById("editClaseHora");
const editClaseCupoInput = document.getElementById("editClaseCupo");
const editClaseProfesorInput = document.getElementById("editClaseProfesor");
const editClaseTipoInput = document.getElementById("editClaseTipo");

const modalReservas = document.getElementById("modalReservas");
const tablaReservasClase = document.getElementById("tablaReservasClase");

// =================== ALUMNOS ===================

formAlumno.addEventListener("submit", async (e) => {
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

  tablaAlumnos.innerHTML = "";

  alumnos.forEach(a => {
    tablaAlumnos.innerHTML += `
      <tr>
        <td>${a.nombre}</td>
        <td>${a.apellido}</td>
        <td>${a.dni}</td>
        <td>${a.telefono || "-"}</td>
        <td>${a.email || "-"}</td>
        <td id="plan-${a.id}">-</td>
        <td>
          <button onclick="seleccionarAlumno(${a.id})">Seleccionar</button>
          <button onclick="abrirEdicionAlumno(${a.id}, '${a.nombre}', '${a.apellido}', '${a.dni}', '${a.telefono || ""}', '${a.email || ""}')">Editar</button>
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
  alert("Alumno seleccionado correctamente");
}

function abrirEdicionAlumno(id, nombre, apellido, dni, tel, email) {
  alumnoEditando = id;
  editNombreInput.value = nombre;
  editApellidoInput.value = apellido;
  editDniInput.value = dni;
  editTelInput.value = tel;
  editEmailInput.value = email;
  modalAlumno.style.display = "block";
}

function cerrarModalAlumno() {
  modalAlumno.style.display = "none";
  alumnoEditando = null;
}

async function guardarEdicionAlumno() {
  const updated = {
    nombre: editNombreInput.value,
    apellido: editApellidoInput.value,
    dni: editDniInput.value,
    telefono: editTelInput.value,
    email: editEmailInput.value
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

  const res = await fetch(`${API_URL}/alumnos/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (data.error) alert(data.error);

  cargarAlumnos();
}

// =================== PLANES ===================

formPlan.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPlan = {
    nombre: document.getElementById("planNombre").value,
    tipo_plan: document.getElementById("planTipo").value,
    precio: parseFloat(document.getElementById("planPrecio").value),
    creditos_totales: document.getElementById("planCreditos").value || null,
    duracion_dias: document.getElementById("planDuracion").value || null
  };

  await fetch(`${API_URL}/planes`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(newPlan)
  });

  e.target.reset();
  cargarPlanes();
});

async function cargarPlanes() {
  const res = await fetch(`${API_URL}/planes`);
  planesGlobales = await res.json();

  tablaPlanes.innerHTML = "";

  planesGlobales.forEach(p => {
    tablaPlanes.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.tipo_plan}</td>
        <td>$ ${p.precio}</td>
        <td>${p.creditos_totales ?? "-"}</td>
        <td>${p.duracion_dias ?? "-"}</td>
        <td>
          <button onclick="abrirEdicionPlan(${p.id}, '${p.nombre}', '${p.tipo_plan}', ${p.precio}, ${p.creditos_totales ?? 'null'}, ${p.duracion_dias ?? 'null'})">Editar</button>
          <button onclick="eliminarPlan(${p.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

function abrirAsignacion(alumno_id) {
  alumnoSeleccionado = alumno_id;
  selectPlan.innerHTML = "";

  planesGlobales.forEach(p => {
    selectPlan.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
  });

  modalPlanAsignar.style.display = "block";
}

function cerrarModal() {
  modalPlanAsignar.style.display = "none";
}

async function confirmarAsignacion() {
  const plan_id = selectPlan.value;
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

function abrirEdicionPlan(id, nombre, tipo, precio, creditos, duracion) {
  planEditando = id;
  editPlanNombreInput.value = nombre;
  editPlanTipoSelect.value = tipo;
  editPlanPrecioInput.value = precio;
  editPlanCreditosInput.value = creditos || "";
  editPlanDuracionInput.value = duracion || "";
  modalPlanEditar.style.display = "block";
}

function cerrarModalPlanEditar() {
  modalPlanEditar.style.display = "none";
  planEditando = null;
}

async function guardarEdicionPlan() {
  const updated = {
    nombre: editPlanNombreInput.value,
    tipo_plan: editPlanTipoSelect.value,
    precio: parseFloat(editPlanPrecioInput.value),
    creditos_totales: editPlanCreditosInput.value || null,
    duracion_dias: editPlanDuracionInput.value || null
  };

  const res = await fetch(`${API_URL}/planes/${planEditando}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updated)
  });

  const data = await res.json();
  if (data.error) alert(data.error);

  cerrarModalPlanEditar();
  cargarPlanes();
}

async function eliminarPlan(id) {
  if (!confirm("¿Seguro que querés eliminar este plan?")) return;

  const res = await fetch(`${API_URL}/planes/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (data.error) alert(data.error);

  cargarPlanes();
}

// =================== CLASES ===================

formClase.addEventListener("submit", async (e) => {
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

  tablaClases.innerHTML = "";

  for (const c of clases) {
    const r = await fetch(`${API_URL}/reservas/clase/${c.id}`);
    let reservas = [];
    if (r.ok) reservas = await r.json();

    tablaClases.innerHTML += `
      <tr>
        <td>${c.dia}</td>
        <td>${c.hora}</td>
        <td>${c.profesor || "-"}</td>
        <td>${c.cupo_maximo}</td>
        <td>${reservas.length}</td>
        <td>
          <button onclick="reservarClase(${c.id})">Reservar</button>
          <button onclick="mostrarReservas(${c.id})">Ver</button>
          <button onclick="abrirEdicionClase(${c.id}, '${c.dia}', '${c.hora}', ${c.cupo_maximo}, '${c.profesor || ""}', '${c.tipo_clase || ""}')">Editar</button>
          <button onclick="eliminarClase(${c.id})">Eliminar</button>
        </td>
      </tr>
    `;
  }
}

async function reservarClase(id) {
  if (!alumnoSeleccionado) {
    alert("Primero seleccioná un alumno");
    return;
  }

  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      clase_id: id,
      alumno_id: alumnoSeleccionado
    })
  });

  const data = await res.json();
  if (data.error) alert(data.error);
  cargarClases();
  cargarPlanActivo(alumnoSeleccionado);
}

function abrirEdicionClase(id, dia, hora, cupo, profesor, tipo) {
  claseEditando = id;
  editClaseDiaInput.value = dia;
  editClaseHoraInput.value = hora;
  editClaseCupoInput.value = cupo;
  editClaseProfesorInput.value = profesor || "";
  editClaseTipoInput.value = tipo || "Pilates";
  modalClaseEditar.style.display = "block";
}

function cerrarModalClaseEditar() {
  modalClaseEditar.style.display = "none";
  claseEditando = null;
}

async function guardarEdicionClase() {
  const updated = {
    dia: editClaseDiaInput.value,
    hora: editClaseHoraInput.value,
    cupo_maximo: parseInt(editClaseCupoInput.value),
    profesor: editClaseProfesorInput.value,
    tipo_clase: editClaseTipoInput.value
  };

  const res = await fetch(`${API_URL}/clases/${claseEditando}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updated)
  });

  const data = await res.json();
  if (data.error) alert(data.error);

  cerrarModalClaseEditar();
  cargarClases();
}

async function eliminarClase(id) {
  if (!confirm("¿Seguro que querés eliminar esta clase?")) return;

  const res = await fetch(`${API_URL}/clases/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (data.error) alert(data.error);

  cargarClases();
}

// =================== RESERVAS / ASISTENCIA ===================

async function mostrarReservas(clase_id) {
  const res = await fetch(`${API_URL}/reservas/clase/${clase_id}`);
  let reservas = [];
  if (res.ok) reservas = await res.json();

  tablaReservasClase.innerHTML = "";

  reservas.forEach(r => {
    tablaReservasClase.innerHTML += `
      <tr>
        <td>${r.nombre} ${r.apellido}</td>
        <td>
          <input type="checkbox"
            onchange="marcarAsistencia(${r.id}, this.checked)"
            ${r.presente ? "checked" : ""}
          >
        </td>
        <td>
          <button onclick="cancelarReserva(${r.id})">Cancelar</button>
        </td>
      </tr>
    `;
  });

  modalReservas.style.display = "block";
}

function cerrarModalReservas() {
  modalReservas.style.display = "none";
}

async function marcarAsistencia(id, checked) {
  await fetch(`${API_URL}/reservas/${id}/presente`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ presente: checked ? 1 : 0 })
  });
}

async function cancelarReserva(id) {
  if (!confirm("¿Cancelar esta reserva?")) return;

  const res = await fetch(`${API_URL}/reservas/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (data.error) alert(data.error);

  modalReservas.style.display = "none";
  cargarClases();
}

// =================== INICIO ===================

cargarAlumnos();
cargarPlanes();
cargarClases();
