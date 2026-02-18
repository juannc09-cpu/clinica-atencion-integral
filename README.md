# Clínica de Atención Integral

Aplicación web con vistas separadas y privadas por rol para una clínica.

## Vistas y privacidad por rol

- **Paciente:** acceso con PIN, agenda de cita y consulta de citas por nombre.
- **Especialista / médico:** acceso con PIN, agenda filtrada por médico e historial clínico asociado.
- **Administración:** acceso con PIN, gestión de servicios, especialidades, citas e historial clínico.

## PIN de acceso (demo)

- Paciente: `PACIENTE123`
- Médico: `MEDICO123`
- Administrador: `ADMIN123`

> Nota: Esta privacidad es de front-end (demo) con `localStorage`. Para seguridad real se recomienda backend con autenticación y control de sesión.

## Tecnologías

- HTML
- CSS
- JavaScript (sin dependencias)
- Persistencia local con `localStorage`

## Ejecutar en local

```bash
python3 -m http.server 4173
```

Luego abre:

`http://localhost:4173`
