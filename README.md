 diff --git a/README.md b/README.md
index 3dc85f1b7a62e06737cc7e7b04b2a08a53d7ea0b..f265f850d93ceed9578565b7d6c1a093c41c3830 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,26 @@
-# clinica-atencion-integral
-Web de clínica de atención integral
+# Clínica de Atención Integral
+
+Aplicación web de administración para una clínica que permite:
+
+- Registrar servicios que ofrece la clínica.
+- Registrar especialidades médicas y médico responsable.
+- Agendar citas entre pacientes y médicos.
+- Llevar historial clínico con diagnóstico y tratamiento.
+- Administrar toda la información desde un panel único.
+
+## Tecnologías
+
+- HTML
+- CSS
+- JavaScript (sin dependencias)
+- Persistencia local en `localStorage`
+
+## Ejecutar en local
+
+Como es una app estática, puedes abrir `index.html` directamente o ejecutar un servidor local:
+
+```bash
+python3 -m http.server 4173
+```
+
+Luego abre: `http://localhost:4173`
