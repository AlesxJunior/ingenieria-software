# Checklist QA Reusable por Módulo

Preparación
- Backend dev levantado (puerto libre). Preferencia: `http://localhost:3004/api`.
- `npm run db:seed` (usuarios/permiso iniciales).
- Frontend dev en `http://localhost:5173/` y `VITE_API_BASE_URL` alineado con backend.

Smoke Test
- Carga de vista sin errores visuales.
- Modales abren/cierran sin crash.
- Consola limpia: sin warnings/errores.

UI/UX
- Desktop y Mobile: legibilidad, accesibilidad, foco correcto.
- Estados: cargando, vacío, error, éxito.
- Notificaciones: claridad en éxito/fracaso.

Filtros y Búsqueda
- Texto parcial y exacto.
- Filtros combinables (categoría/tipo, rango precio/fechas, ubicación, estado).
- Reset retorna al listado completo.

Creación (NuevoModal)
- Validaciones de campos obligatorios.
- Reglas de negocio (rangos/formato/unicidad).
- Éxito refleja en lista; error muestra mensaje y mantiene modal.

Edición (EditarModal)
- Datos precargados y código read-only si aplica.
- Validaciones coherentes.
- Éxito actualiza lista; error con feedback.

Estado (Activar/Inhabilitar)
- Toggle refleja en UI y persiste.
- Error de backend no debe cambiar UI.

API Integración
- Contratos correctos: payloads y respuestas `{ success, data, message }`.
- Errores esperados: 400, 401, 403, 404, 409, 500.

Roles y Permisos
- Acceso sin token: 401.
- Roles sin permiso: 403.
- Roles con permiso: operaciones válidas.

Consola y Warnings
- Styled-components con props transientes (`$error`, `$compact`) sin atributos DOM inválidos.
- Sin llaves repetidas en listas.

Performance
- Listas grandes responden fluidas.
- Considerar debounce de búsqueda si necesario.

Aceptación
- Criterios cumplidos, sin errores de consola.
- Documentación y contratos actualizados.