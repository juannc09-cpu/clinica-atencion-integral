# Clínica de Atención Integral

Aplicación web con vistas separadas por rol para una clínica.

## Vistas y acceso

- **Paciente:** acceso directo para agendar y consultar citas.
- **Especialista / médico:** inicio de sesión personalizado con usuario y contraseña.
- **Administrador:** inicio de sesión personalizado con usuario y contraseña.

## Credenciales demo

- Médico
  - Usuario: `medico.carlos`
  - Contraseña: `Medico2026*`
- Administrador
  - Usuario: `admin.clinica`
  - Contraseña: `Admin2026*`

> Nota: Este login es de front-end (demo) con `localStorage`. Para seguridad real se requiere backend con autenticación y manejo de sesión.

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
