const API_URL = "http://localhost:3001";

let alumnoSeleccionado = null;
let planesGlobales = [];
let claseEditando = null;
let planEditando = null;
let alumnoEditando = null;

// Charts
let chartOcupacion = null;
let chartAsistencia = null;
let chartVencimientos = null;

// Calendar
let calendar = null;

// ========== DOM ELEMENTS ==========
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

// ========== ALUMNOS ==========

formAlumno.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validación extra JS por si el usuario se pelea con los patterns
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const dni = document.getElementById("dni").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,15}$/;
  const regexDni = /^[0-9]{1,8}$/;
  const regexTel = /^[0-9+]{1,15}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexNombre.test(nombre)) {
    alert("Nombre inválido");
    return;
  }
  if (!regexNombre.test(apellido)) {
    alert("Apellido inválido");
    return;
  }
  if (!regexDni.test(dni)) {
    alert("DNI inválido");
    return;
  }
  if (!regexTel.test(telefono)) {
    alert("Teléfono inválido");
    return;
  }
  if (!regexEmail.test(email)) {
    alert("Email inválido");
    return;
  }

  const nuevoAlumno = {
    nombre,
    apellido,
    dni,
    telefono,
    email,
  };

  await fetch(`${API_URL}/alumnos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoAlumno),
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
        <td>
          <input
            type="radio"
            name="alumnoSelect"
            value="${a.id}"
            onclick="seleccionarAlumno(${a.id})"
          >
        </td>
        <td>${a.nombre}</td>
        <td>${a.apellido}</td>
        <td>${a.dni}</td>
        <td>${a.telefono || "-"}</td>
        <td>${a.email || "-"}</td>
        <td id="plan-${a.id}">-</td>
        <td>
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

  document.querySelectorAll("#tablaAlumnos tr")
    .forEach(r => r.classList.remove("selected-row"));

  const radio = document.querySelector(`#tablaAlumnos input[type="radio"][value="${id}"]`);
  if (radio) {
    const fila = radio.closest("tr");
    if (fila) fila.classList.add("selected-row");
  }
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
    nombre: editNombreInput.value.trim(),
    apellido: editApellidoInput.value.trim(),
    dni: editDniInput.value.trim(),
    telefono: editTelInput.value.trim(),
    email: editEmailInput.value.trim(),
  };

  await fetch(`${API_URL}/alumnos/${alumnoEditando}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  cerrarModalAlumno();
  cargarAlumnos();
}

async function eliminarAlumno(id) {
  if (!confirm("¿Seguro que desea eliminar el alumno?")) return;

  await fetch(`${API_URL}/alumnos/${id}`, { method: "DELETE" });
  cargarAlumnos();
}

// ========== PLANES ==========

formPlan.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPlan = {
    nombre: document.getElementById("planNombre").value,
    tipo_plan: document.getElementById("planTipo").value,
    precio: parseFloat(document.getElementById("planPrecio").value),
    creditos_totales: document.getElementById("planCreditos").value || null,
    duracion_dias: document.getElementById("planDuracion").value || null,
  };

  await fetch(`${API_URL}/planes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPlan),
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

function abrirAsignacion(id) {
  alumnoSeleccionado = id;
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
  if (!alumnoSeleccionado) {
    alert("Primero seleccione un alumno");
    return;
  }

  const plan_id = selectPlan.value;
  const plan = planesGlobales.find(p => p.id == plan_id);

  let fecha_fin = null;
  let creditos_actuales = null;

  if ((plan.tipo_plan === "tiempo" || plan.tipo_plan === "mixto") && plan.duracion_dias) {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + parseInt(plan.duracion_dias));
    fecha_fin = hoy.toISOString().split("T")[0];
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
      creditos_actuales,
    }),
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
    duracion_dias: editPlanDuracionInput.value || null,
  };

  await fetch(`${API_URL}/planes/${planEditando}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  cerrarModalPlanEditar();
  cargarPlanes();
}

async function eliminarPlan(id) {
  if (!confirm("¿Eliminar plan?")) return;
  await fetch(`${API_URL}/planes/${id}`, { method: "DELETE" });
  cargarPlanes();
}

// ========== CLASES ==========

formClase.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevaClase = {
    dia: document.getElementById("claseDia").value,
    hora: document.getElementById("claseHora").value,
    cupo_maximo: parseInt(document.getElementById("claseCupo").value),
    profesor: document.getElementById("claseProfesor").value,
    tipo_clase: document.getElementById("claseTipo").value,
  };

  await fetch(`${API_URL}/clases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevaClase),
  });

  e.target.reset();
  cargarClases();
  if (calendar) cargarEventosCalendar(calendar);
});

async function cargarClases() {
  const res = await fetch(`${API_URL}/clases`);
  const clases = await res.json();

  tablaClases.innerHTML = "";

  for (const c of clases) {
    const r = await fetch(`${API_URL}/reservas/clase/${c.id}`);
    const reservas = r.ok ? await r.json() : [];

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clase_id: id,
      alumno_id: alumnoSeleccionado,
    }),
  });

  const data = await res.json();
  if (data.error) alert(data.error);

  cargarClases();
  cargarPlanActivo(alumnoSeleccionado);
  if (calendar) cargarEventosCalendar(calendar);
}

function abrirEdicionClase(id, dia, hora, cupo, profesor, tipo) {
  claseEditando = id;
  editClaseDiaInput.value = dia;
  editClaseHoraInput.value = hora;
  editClaseCupoInput.value = cupo;
  editClaseProfesorInput.value = profesor;
  editClaseTipoInput.value = tipo;
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
    tipo_clase: editClaseTipoInput.value,
  };

  await fetch(`${API_URL}/clases/${claseEditando}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  cerrarModalClaseEditar();
  cargarClases();
  if (calendar) cargarEventosCalendar(calendar);
}

async function eliminarClase(id) {
  if (!confirm("¿Eliminar clase?")) return;
  await fetch(`${API_URL}/clases/${id}`, { method: "DELETE" });
  cargarClases();
  if (calendar) cargarEventosCalendar(calendar);
}

// ========== RESERVAS / ASISTENCIA ==========

async function mostrarReservas(clase_id) {
  modalReservas.dataset.claseId = clase_id;

  // cargar reservas
  const res = await fetch(`${API_URL}/reservas/clase/${clase_id}`);
  const reservas = res.ok ? await res.json() : [];

  // cargar alumnos
  const resAlumnos = await fetch(`${API_URL}/alumnos`);
  const alumnos = await resAlumnos.json();

  const selectAlumno = document.getElementById("selectAlumnoReserva");
  selectAlumno.innerHTML = '<option value="">Elegir alumno</option>';

  alumnos.forEach(a => {
    selectAlumno.innerHTML += `
      <option value="${a.id}">${a.nombre} ${a.apellido}</option>`;
  });

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
        <td><button onclick="cancelarReserva(${r.id})">❌</button></td>
      </tr>`;
  });

  modalReservas.style.display = "block";
}

function cerrarModalReservas() {
  modalReservas.style.display = "none";
}

async function marcarAsistencia(id, checked) {
  await fetch(`${API_URL}/reservas/${id}/presente`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presente: checked ? 1 : 0 }),
  });
}

async function cancelarReserva(id) {
  if (!confirm("¿Cancelar reserva?")) return;
  await fetch(`${API_URL}/reservas/${id}`, { method: "DELETE" });
  modalReservas.style.display = "none";
  cargarClases();
  if (calendar) cargarEventosCalendar(calendar);
}

async function agregarReservaDesdeModal() {
  const alumno_id = document.getElementById("selectAlumnoReserva").value;
  if (!alumno_id) return alert("Elegí un alumno");

  const clase_id = modalReservas.dataset.claseId;

  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clase_id, alumno_id })
  });

  const data = await res.json();
  if (data.error) {
    alert(data.error);
    return;
  }

  cargarClases();
  cargarEventosCalendar(calendar);
  mostrarReservas(clase_id);
}

// ========== DASHBOARD (KPIs + CHARTS) ==========

async function actualizarKPIs() {
  const resSub = await fetch(`${API_URL}/suscripciones/activas`);
  const subsActivas = await resSub.json();
  document.getElementById("dashTotalAlumnos").textContent = subsActivas.length;

  const hoy = new Date().toISOString().split("T")[0];
  const resClases = await fetch(`${API_URL}/clases`);
  const clases = await resClases.json();
  const clasesHoy = clases.filter(c => c.dia === hoy);
  document.getElementById("dashClasesHoy").textContent = clasesHoy.length;

  let totalLugares = 0;
  let totalOcupados = 0;

  for (const c of clasesHoy) {
    totalLugares += c.cupo_maximo;
    const r = await fetch(`${API_URL}/reservas/clase/${c.id}`);
    const reservas = await r.json();
    totalOcupados += reservas.length;
  }

  const porcentaje = totalLugares > 0
    ? Math.round((totalOcupados / totalLugares) * 100)
    : 0;

  document.getElementById("dashOcupacion").textContent = porcentaje + "%";

  const resVenc = await fetch(`${API_URL}/suscripciones/vencimientos`);
  const vencimientos = await resVenc.json();
  const vencimientosList = document.getElementById("dashVencimientos");
  vencimientosList.innerHTML = "";

  if (vencimientos.length === 0) {
    vencimientosList.innerHTML = "<li>Sin vencimientos</li>";
  } else {
    vencimientos.forEach(v => {
      const dias = Math.floor(v.dias_restantes);
      let label = "";

      if (dias < 0) label = `Vencido hace ${Math.abs(dias)} días`;
      else if (dias === 0) label = "Vence HOY 🚨";
      else label = `Vence en ${dias} días`;

      vencimientosList.innerHTML += `
        <li>${v.alumno_nombre} ${v.alumno_apellido} — ${v.plan_nombre} — ${label}</li>
      `;
    });
  }
}

async function renderCharts() {
  if (chartOcupacion) chartOcupacion.destroy();
  if (chartAsistencia) chartAsistencia.destroy();
  if (chartVencimientos) chartVencimientos.destroy();

  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const ocupacion = [10, 30, 50, 20, 40, 60, 25];
  const asistencia = [12, 18, 16, 15, 9, 20, 14];
  const venc = [1, 2, 3, 0, 5, 1, 0];

  chartOcupacion = new Chart(document.getElementById("chartOcupacion"), {
    type: "line",
    data: {
      labels: dias,
      datasets: [{
        label: "%",
        data: ocupacion,
        borderColor: "#00C896",
        backgroundColor: "rgba(0,200,150,0.2)",
        borderWidth: 2
      }]
    }
  });

  chartAsistencia = new Chart(document.getElementById("chartAsistencia"), {
    type: "bar",
    data: {
      labels: dias,
      datasets: [{
        label: "Alumnos",
        data: asistencia,
        backgroundColor: "#007bff",
      }]
    }
  });

  chartVencimientos = new Chart(document.getElementById("chartVencimientos"), {
    type: "bar",
    data: {
      labels: dias,
      datasets: [{
        label: "Vencimientos",
        data: venc,
        backgroundColor: "#ff4d4d",
      }]
    }
  });
}

async function cargarDashboard() {
  await actualizarKPIs();
  await renderCharts();
}

// ========== CALENDARIO (FullCalendar) ==========

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    initialDate: new Date().toISOString().split("T")[0],
    locale: 'es',
    selectable: true,
    editable: true,
    eventResizableFromStart: true,
    expandRows: true,
    slotDuration: '00:30:00',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    dateClick: function(info) {
      abrirFormClaseParaFecha(info.dateStr);
    },
    eventClick: function(info) {
      const claseId = info.event.id;
      mostrarReservas(claseId);
    },
    eventDrop: async function(info) {
      await moverClase(info);
    },
    eventResize: async function(info) {
      await moverClase(info);
    },
    eventDidMount: async function(info) {
      const claseId = info.event.id;
      const r = await fetch(`${API_URL}/reservas/clase/${claseId}`);
      const reservas = await r.json();

      const ocupados = reservas.length;
      const cupo = info.event.extendedProps.cupo;

      info.el.title = `${info.event.title}
Ocupación: ${ocupados}/${cupo}`;
    }
  });

  calendar.render();
  cargarEventosCalendar(calendar);
}

async function cargarEventosCalendar(calendarInstance) {
  const res = await fetch(`${API_URL}/clases`);
  const clases = await res.json();

  const eventos = [];

  for (const c of clases) {
    const r = await fetch(`${API_URL}/reservas/clase/${c.id}`);
    const reservas = await r.json();
    const ocupados = reservas.length;
    const porcentaje = (ocupados / c.cupo_maximo) * 100;

    let color = "#00C896";
    if (porcentaje >= 80) color = "#ff4d4d";
    else if (porcentaje >= 50) color = "#f0b400";

    eventos.push({
      id: c.id,
      title: `${c.tipo_clase || "Clase"} (${ocupados}/${c.cupo_maximo})`,
      start: `${c.dia}T${c.hora}`,
      backgroundColor: color,
      borderColor: "#000",
      extendedProps: { cupo: c.cupo_maximo }
    });
  }

  calendarInstance.removeAllEvents();
  calendarInstance.addEventSource(eventos);
}

async function moverClase(info) {
  const start = info.event.start.toISOString();

  await fetch(`${API_URL}/clases/${info.event.id}/mover`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start })
  });

  cargarClases();
  cargarEventosCalendar(calendar);
}

function abrirFormClaseParaFecha(fechaStr) {
  mostrarSeccion('clases');
  document.getElementById("claseDia").value = fechaStr;
  document.getElementById("claseHora").focus();
}

// ========== VISTAS / NAVEGACIÓN ==========

function mostrarSeccion(id) {
  document.querySelectorAll("section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "dashboard") {
    cargarDashboard();
  }

  if (id === "calendarView" && calendar) {
    cargarEventosCalendar(calendar);
    calendar.updateSize();
  }
}

async function agregarReservaDesdeModal() {
  const alumno_id = document.getElementById("selectAlumnoReserva").value;
  if (!alumno_id) return alert("Elegí un alumno");

  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clase_id: modalReservas.dataset.claseId,
      alumno_id
    }),
  });

  const data = await res.json();
  if (data.error) {
    alert(data.error);
    return;
  }

  cargarClases();
  cargarEventosCalendar(calendar);
  mostrarReservas(modalReservas.dataset.claseId);
}

// ========== INIT ==========
cargarAlumnos();
cargarPlanes();
cargarClases();
initCalendar();
mostrarSeccion("dashboard");
