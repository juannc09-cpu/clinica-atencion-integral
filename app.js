const STORAGE_KEY = 'clinicaAtencionIntegralData';

const defaultData = {
  services: [],
  specialties: [],
  appointments: [],
  records: []
};

const state = loadState();

const refs = {
  tabs: document.querySelectorAll('.tab'),
  navButtons: document.querySelectorAll('.nav-btn'),
  servicesTable: document.getElementById('servicesTable'),
  specialtiesTable: document.getElementById('specialtiesTable'),
  appointmentsTable: document.getElementById('appointmentsTable'),
  recordsTable: document.getElementById('recordsTable'),
  serviceSelect: document.getElementById('appointmentService'),
  specialtySelect: document.getElementById('appointmentSpecialty'),
  serviceForm: document.getElementById('serviceForm'),
  specialtyForm: document.getElementById('specialtyForm'),
  appointmentForm: document.getElementById('appointmentForm'),
  recordForm: document.getElementById('recordForm'),
  clearDataBtn: document.getElementById('clearDataBtn'),
  counts: {
    services: document.getElementById('servicesCount'),
    specialties: document.getElementById('specialtiesCount'),
    appointments: document.getElementById('appointmentsCount'),
    records: document.getElementById('recordsCount')
  }
};

init();

function init() {
  bindNavigation();
  bindForms();
  bindActions();
  renderAll();
}

function bindNavigation() {
  refs.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      refs.navButtons.forEach((btn) => btn.classList.remove('active'));
      refs.tabs.forEach((tab) => tab.classList.remove('active'));
      button.classList.add('active');
      const target = document.getElementById(button.dataset.target);
      if (target) target.classList.add('active');
    });
  });
}

function bindForms() {
  refs.serviceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.services.push({
      id: crypto.randomUUID(),
      name: form.get('name').toString().trim(),
      description: form.get('description').toString().trim()
    });
    event.currentTarget.reset();
    persistAndRender();
  });

  refs.specialtyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.specialties.push({
      id: crypto.randomUUID(),
      name: form.get('name').toString().trim(),
      doctor: form.get('doctor').toString().trim()
    });
    event.currentTarget.reset();
    persistAndRender();
  });

  refs.appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.services.length || !state.specialties.length) {
      alert('Debes registrar al menos un servicio y una especialidad antes de agendar citas.');
      return;
    }
    const form = new FormData(event.currentTarget);
    state.appointments.push({
      id: crypto.randomUUID(),
      patient: form.get('patient').toString().trim(),
      doctor: form.get('doctor').toString().trim(),
      specialty: form.get('specialty').toString(),
      service: form.get('service').toString(),
      date: form.get('date').toString(),
      time: form.get('time').toString()
    });
    event.currentTarget.reset();
    persistAndRender();
  });

  refs.recordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.records.push({
      id: crypto.randomUUID(),
      patient: form.get('patient').toString().trim(),
      doctor: form.get('doctor').toString().trim(),
      diagnosis: form.get('diagnosis').toString().trim(),
      treatment: form.get('treatment').toString().trim(),
      createdAt: new Date().toLocaleString('es-MX')
    });
    event.currentTarget.reset();
    persistAndRender();
  });
}

function bindActions() {
  refs.clearDataBtn.addEventListener('click', () => {
    const confirmed = confirm('¿Deseas eliminar todos los datos registrados en el panel?');
    if (!confirmed) return;
    Object.assign(state, structuredClone(defaultData));
    persistAndRender();
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete]');
    if (!button) return;

    const [collection, id] = button.dataset.delete.split(':');
    if (!state[collection]) return;

    state[collection] = state[collection].filter((item) => item.id !== id);

    if (collection === 'services') {
      state.appointments = state.appointments.filter((item) => item.service !== button.dataset.value);
    }

    if (collection === 'specialties') {
      state.appointments = state.appointments.filter((item) => item.specialty !== button.dataset.value);
    }

    persistAndRender();
  });
}

function renderAll() {
  renderSelectOptions();
  renderRows(refs.servicesTable, state.services, renderServiceRow, 3);
  renderRows(refs.specialtiesTable, state.specialties, renderSpecialtyRow, 3);
  renderRows(refs.appointmentsTable, state.appointments, renderAppointmentRow, 7);
  renderRows(refs.recordsTable, state.records, renderRecordRow, 6);
  updateCounters();
}

function renderSelectOptions() {
  refs.serviceSelect.innerHTML = '';
  refs.specialtySelect.innerHTML = '';

  const serviceFallback = document.createElement('option');
  serviceFallback.value = '';
  serviceFallback.textContent = state.services.length
    ? 'Selecciona un servicio'
    : 'Registra servicios primero';
  refs.serviceSelect.appendChild(serviceFallback);

  state.services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.name;
    option.textContent = service.name;
    refs.serviceSelect.appendChild(option);
  });

  const specialtyFallback = document.createElement('option');
  specialtyFallback.value = '';
  specialtyFallback.textContent = state.specialties.length
    ? 'Selecciona una especialidad'
    : 'Registra especialidades primero';
  refs.specialtySelect.appendChild(specialtyFallback);

  state.specialties.forEach((specialty) => {
    const option = document.createElement('option');
    option.value = specialty.name;
    option.textContent = specialty.name;
    refs.specialtySelect.appendChild(option);
  });
}

function renderRows(tableBody, items, mapper, columns) {
  tableBody.innerHTML = '';
  if (!items.length) {
    tableBody.innerHTML = `<tr><td class="empty" colspan="${columns}">No hay registros aún.</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = mapper(item);
    tableBody.appendChild(row);
  });
}

function renderServiceRow(service) {
  return `
    <td>${escapeHTML(service.name)}</td>
    <td>${escapeHTML(service.description)}</td>
    <td><button class="action-btn" data-delete="services:${service.id}" data-value="${escapeHTML(service.name)}">Eliminar</button></td>
  `;
}

function renderSpecialtyRow(specialty) {
  return `
    <td>${escapeHTML(specialty.name)}</td>
    <td>${escapeHTML(specialty.doctor)}</td>
    <td><button class="action-btn" data-delete="specialties:${specialty.id}" data-value="${escapeHTML(specialty.name)}">Eliminar</button></td>
  `;
}

function renderAppointmentRow(appointment) {
  return `
    <td>${escapeHTML(appointment.patient)}</td>
    <td>${escapeHTML(appointment.doctor)}</td>
    <td>${escapeHTML(appointment.specialty)}</td>
    <td>${escapeHTML(appointment.service)}</td>
    <td>${escapeHTML(appointment.date)}</td>
    <td>${escapeHTML(appointment.time)}</td>
    <td><button class="action-btn" data-delete="appointments:${appointment.id}">Eliminar</button></td>
  `;
}

function renderRecordRow(record) {
  return `
    <td>${escapeHTML(record.patient)}</td>
    <td>${escapeHTML(record.doctor)}</td>
    <td>${escapeHTML(record.diagnosis)}</td>
    <td>${escapeHTML(record.treatment)}</td>
    <td>${escapeHTML(record.createdAt)}</td>
    <td><button class="action-btn" data-delete="records:${record.id}">Eliminar</button></td>
  `;
}

function updateCounters() {
  refs.counts.services.textContent = state.services.length;
  refs.counts.specialties.textContent = state.specialties.length;
  refs.counts.appointments.textContent = state.appointments.length;
  refs.counts.records.textContent = state.records.length;
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);
  try {
    const parsed = JSON.parse(saved);
    return {
      services: Array.isArray(parsed.services) ? parsed.services : [],
      specialties: Array.isArray(parsed.specialties) ? parsed.specialties : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      records: Array.isArray(parsed.records) ? parsed.records : []
    };
  } catch {
    return structuredClone(defaultData);
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
