const STORAGE_KEY = 'clinicaAtencionIntegralData';

const defaultData = {
  services: [],
  specialties: [],
  appointments: [],
  records: []
};

const state = loadState();
let doctorFilterValue = '';
let patientFilterValue = '';

const refs = {
  roleButtons: document.querySelectorAll('.role-btn'),
  roleViews: document.querySelectorAll('.role-view'),
  tabs: document.querySelectorAll('.tab'),
  navButtons: document.querySelectorAll('.nav-btn'),

  servicesTable: document.getElementById('servicesTable'),
  specialtiesTable: document.getElementById('specialtiesTable'),
  appointmentsTable: document.getElementById('appointmentsTable'),
  recordsTable: document.getElementById('recordsTable'),
  doctorAppointmentsTable: document.getElementById('doctorAppointmentsTable'),
  doctorRecordsTable: document.getElementById('doctorRecordsTable'),
  patientAppointmentsTable: document.getElementById('patientAppointmentsTable'),

  serviceSelect: document.getElementById('appointmentService'),
  specialtySelect: document.getElementById('appointmentSpecialty'),
  publicServiceSelect: document.getElementById('publicService'),
  publicSpecialtySelect: document.getElementById('publicSpecialty'),
  publicDoctorInput: document.getElementById('publicDoctor'),

  serviceForm: document.getElementById('serviceForm'),
  specialtyForm: document.getElementById('specialtyForm'),
  appointmentForm: document.getElementById('appointmentForm'),
  publicAppointmentForm: document.getElementById('publicAppointmentForm'),
  recordForm: document.getElementById('recordForm'),

  doctorFilterForm: document.getElementById('doctorFilterForm'),
  doctorFilterInput: document.getElementById('doctorFilter'),
  patientFilterForm: document.getElementById('patientFilterForm'),
  patientFilterInput: document.getElementById('patientFilter'),

  publicFeedback: document.getElementById('publicAppointmentFeedback'),
  clearDataBtn: document.getElementById('clearDataBtn'),

  doctorAppointmentsCount: document.getElementById('doctorAppointmentsCount'),
  doctorRecordsCount: document.getElementById('doctorRecordsCount'),

  counts: {
    services: document.getElementById('servicesCount'),
    specialties: document.getElementById('specialtiesCount'),
    appointments: document.getElementById('appointmentsCount'),
    records: document.getElementById('recordsCount')
  }
};

init();

function init() {
  bindRoleViews();
  bindAdminNavigation();
  bindForms();
  bindActions();
  renderAll();
}

function bindRoleViews() {
  refs.roleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      refs.roleButtons.forEach((btn) => btn.classList.remove('active'));
      refs.roleViews.forEach((view) => view.classList.remove('active'));
      button.classList.add('active');
      const target = document.getElementById(button.dataset.roleView);
      if (target) target.classList.add('active');
    });
  });
}

function bindAdminNavigation() {
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
    const data = new FormData(event.currentTarget);
    state.services.push({
      id: crypto.randomUUID(),
      name: data.get('name').toString().trim(),
      description: data.get('description').toString().trim()
    });
    event.currentTarget.reset();
    persistAndRender();
  });

  refs.specialtyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.specialties.push({
      id: crypto.randomUUID(),
      name: data.get('name').toString().trim(),
      doctor: data.get('doctor').toString().trim()
    });
    event.currentTarget.reset();
    persistAndRender();
  });

  refs.appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    createAppointment(event.currentTarget);
  });

  refs.publicAppointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const created = createAppointment(event.currentTarget);
    refs.publicFeedback.textContent = created
      ? '✅ Cita confirmada. Puedes verla en "Mis citas".'
      : '⚠️ No se pudo agendar. Verifica los datos.';

    if (created) {
      setTimeout(() => {
        refs.publicFeedback.textContent = '';
      }, 3200);
    }
  });

  refs.recordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.records.push({
      id: crypto.randomUUID(),
      patient: data.get('patient').toString().trim(),
      doctor: data.get('doctor').toString().trim(),
      diagnosis: data.get('diagnosis').toString().trim(),
      treatment: data.get('treatment').toString().trim(),
      createdAt: new Date().toLocaleString('es-MX')
    });
    event.currentTarget.reset();
    persistAndRender();
  });

  refs.doctorFilterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    doctorFilterValue = refs.doctorFilterInput.value.trim().toLowerCase();
    renderDoctorView();
  });

  refs.patientFilterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    patientFilterValue = refs.patientFilterInput.value.trim().toLowerCase();
    renderPatientView();
  });
}

function bindActions() {
  refs.publicSpecialtySelect.addEventListener('change', () => {
    const selected = refs.publicSpecialtySelect.value;
    const match = state.specialties.find((item) => item.name === selected);
    if (match) refs.publicDoctorInput.value = match.doctor;
  });

  refs.clearDataBtn.addEventListener('click', () => {
    const confirmed = confirm('¿Deseas eliminar todos los datos?');
    if (!confirmed) return;

    Object.assign(state, structuredClone(defaultData));
    doctorFilterValue = '';
    patientFilterValue = '';
    refs.doctorFilterInput.value = '';
    refs.patientFilterInput.value = '';
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

function createAppointment(formElement) {
  if (!state.services.length || !state.specialties.length) {
    alert('Primero registra servicios y especialidades desde Administración.');
    return false;
  }

  const data = new FormData(formElement);
  const patient = data.get('patient').toString().trim();
  const doctor = data.get('doctor').toString().trim();
  const specialty = data.get('specialty').toString();
  const service = data.get('service').toString();
  const date = data.get('date').toString();
  const time = data.get('time').toString();

  if (!patient || !doctor || !specialty || !service || !date || !time) return false;

  state.appointments.push({
    id: crypto.randomUUID(),
    patient,
    doctor,
    specialty,
    service,
    date,
    time
  });

  formElement.reset();
  persistAndRender();
  return true;
}

function renderAll() {
  renderSelects();
  renderAdminTables();
  renderDoctorView();
  renderPatientView();
  updateCounters();
}

function renderAdminTables() {
  renderRows(refs.servicesTable, state.services, renderServiceRow, 3);
  renderRows(refs.specialtiesTable, state.specialties, renderSpecialtyRow, 3);
  renderRows(refs.appointmentsTable, state.appointments, renderAppointmentRow, 7);
  renderRows(refs.recordsTable, state.records, renderRecordRow, 6);
}

function renderDoctorView() {
  const appointments = doctorFilterValue
    ? state.appointments.filter((item) => item.doctor.toLowerCase().includes(doctorFilterValue))
    : state.appointments;

  const records = doctorFilterValue
    ? state.records.filter((item) => item.doctor.toLowerCase().includes(doctorFilterValue))
    : state.records;

  renderRows(refs.doctorAppointmentsTable, appointments, renderDoctorAppointmentRow, 5);
  renderRows(refs.doctorRecordsTable, records, renderDoctorRecordRow, 4);

  refs.doctorAppointmentsCount.textContent = String(appointments.length);
  refs.doctorRecordsCount.textContent = String(records.length);
}

function renderPatientView() {
  const appointments = patientFilterValue
    ? state.appointments.filter((item) => item.patient.toLowerCase().includes(patientFilterValue))
    : state.appointments;

  renderRows(refs.patientAppointmentsTable, appointments, renderPatientAppointmentRow, 5);
}

function renderSelects() {
  populateSelect(refs.serviceSelect, state.services, 'name', 'servicio');
  populateSelect(refs.publicServiceSelect, state.services, 'name', 'servicio');
  populateSelect(refs.specialtySelect, state.specialties, 'name', 'especialidad');
  populateSelect(refs.publicSpecialtySelect, state.specialties, 'name', 'especialidad');
}

function populateSelect(selectElement, items, key, label) {
  selectElement.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = items.length ? `Selecciona ${label}` : `No hay ${label}es registradas`;
  selectElement.appendChild(empty);

  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item[key];
    option.textContent = item[key];
    selectElement.appendChild(option);
  });
}

function renderRows(tableBody, items, mapper, colSpan) {
  tableBody.innerHTML = '';
  if (!items.length) {
    tableBody.innerHTML = `<tr><td class="empty" colspan="${colSpan}">No hay registros aún.</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = mapper(item);
    tableBody.appendChild(row);
  });
}

function renderServiceRow(service) {
  return `<td>${escapeHTML(service.name)}</td><td>${escapeHTML(service.description)}</td><td><button class="action-btn" data-delete="services:${service.id}" data-value="${escapeHTML(service.name)}">Eliminar</button></td>`;
}

function renderSpecialtyRow(specialty) {
  return `<td>${escapeHTML(specialty.name)}</td><td>${escapeHTML(specialty.doctor)}</td><td><button class="action-btn" data-delete="specialties:${specialty.id}" data-value="${escapeHTML(specialty.name)}">Eliminar</button></td>`;
}

function renderAppointmentRow(appointment) {
  return `<td>${escapeHTML(appointment.patient)}</td><td>${escapeHTML(appointment.doctor)}</td><td>${escapeHTML(appointment.specialty)}</td><td>${escapeHTML(appointment.service)}</td><td>${escapeHTML(appointment.date)}</td><td>${escapeHTML(appointment.time)}</td><td><button class="action-btn" data-delete="appointments:${appointment.id}">Eliminar</button></td>`;
}

function renderRecordRow(record) {
  return `<td>${escapeHTML(record.patient)}</td><td>${escapeHTML(record.doctor)}</td><td>${escapeHTML(record.diagnosis)}</td><td>${escapeHTML(record.treatment)}</td><td>${escapeHTML(record.createdAt)}</td><td><button class="action-btn" data-delete="records:${record.id}">Eliminar</button></td>`;
}

function renderDoctorAppointmentRow(item) {
  return `<td>${escapeHTML(item.patient)}</td><td>${escapeHTML(item.specialty)}</td><td>${escapeHTML(item.service)}</td><td>${escapeHTML(item.date)}</td><td>${escapeHTML(item.time)}</td>`;
}

function renderDoctorRecordRow(item) {
  return `<td>${escapeHTML(item.patient)}</td><td>${escapeHTML(item.diagnosis)}</td><td>${escapeHTML(item.treatment)}</td><td>${escapeHTML(item.createdAt)}</td>`;
}

function renderPatientAppointmentRow(item) {
  return `<td>${escapeHTML(item.doctor)}</td><td>${escapeHTML(item.specialty)}</td><td>${escapeHTML(item.service)}</td><td>${escapeHTML(item.date)}</td><td>${escapeHTML(item.time)}</td>`;
}

function updateCounters() {
  refs.counts.services.textContent = String(state.services.length);
  refs.counts.specialties.textContent = String(state.specialties.length);
  refs.counts.appointments.textContent = String(state.appointments.length);
  refs.counts.records.textContent = String(state.records.length);
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultData);

  try {
    const parsed = JSON.parse(raw);
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
