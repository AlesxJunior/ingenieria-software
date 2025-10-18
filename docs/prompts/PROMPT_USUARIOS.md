# Prompt listo: Módulo Usuarios

Objetivo:
- Gestionar usuarios, roles y permisos con seguridad y trazabilidad.
- KPI: listado <300ms, sin errores de consola, permisos respetados (401/403).

Alcance
- Frontend:
  - Páginas/modales: ListaUsuarios, NuevoUsuarioModal, EditarUsuarioModal.
  - Componentes: tabla/tarjetas, filtros, formularios con validaciones y notificaciones.
  - Estados: cargando, vacío, error, éxito; responsive móvil/desktop.
- Backend:
  - Endpoints: `/api/auth/login`, `/api/auth/me`, `/api/users`, `/api/users/:id`, `/api/users/:id/status`.
  - Validaciones: email único, roles válidos, campos obligatorios.
  - Permisos: admin (CRUD), supervisor (lectura y ciertas actualizaciones), cajero/vendedor (lectura).
  - Auditoría: eventos de creación, actualización y cambio de estado.

Requerimientos Funcionales (RF)
- RF-01: Listar usuarios con filtros (q por email/nombre) y paginación si aplica.
- RF-02: Crear usuario con rol y permisos asignados.
- RF-03: Editar datos de usuario y rol.
- RF-04: Activar/Inactivar usuario con control de permisos.
- RF-05: Ver perfil actual (`/auth/me`) pos-login.

Requerimientos No Funcionales
- Seguridad: JWT, autorización por permisos, rate-limit si aplica.
- Performance: listado <300ms en dataset típico.
- Observabilidad: logs y auditoría en acciones clave.

API Contrato (ejemplos)
- POST `/api/auth/login` `{ email, password }` → `{ success, data: { accessToken } }`
- GET `/api/auth/me` → `{ success, data: user }`
- GET `/api/users?q=texto` → `{ success, data: { users: [] } }`
- POST `/api/users` `{ email, username, firstName, lastName, role, permissions }` → `{ success, data: user }`
- PUT `/api/users/:id` `{ ... }` → `{ success, data: user }`
- PATCH `/api/users/:id/status` `{ isActive }` → `{ success, data: user }`
- Errores esperados: 400, 401, 403, 404, 409, 500.

Modelo de Datos
- User: `{ id, email, username, firstName, lastName, permissions[], isActive, role }`
- Seeds disponibles: admin, supervisor, vendedor, cajero con permisos predefinidos.

Roles y Permisos
- Admin: create/read/update/delete.
- Supervisor: read y algunas actualizaciones.
- Cajero/Vendedor: lectura.
- Sin permiso: 403 consistente.

UI/UX
- Lista: filtros por texto (q), estado; tabla accesible.
- Modales: creación y edición con validaciones en tiempo real.
- Notificaciones: éxito/error; no cerrar modal ante fallo backend.
- Responsive: vistas móviles accesibles.

Validaciones
- Front: email válido, campos obligatorios.
- Back: unicidad de email/username, formato correcto.
- Duplicados: 409.

Pruebas y Aceptación
- Unit: validadores y componentes clave.
- Integración: `/auth/login`, `/auth/me`, `/users`.
- E2E: crear/editar/toggle estado, permisos (401/403).
- Criterios: sin errores de consola, respuestas correctas, permisos respetados.

Entorno y Configuración
- `VITE_API_BASE_URL=http://localhost:3004/api`
- `CORS_ORIGIN=http://localhost:5173`

Entregables
- Frontend: lista, modales, servicios API.
- Backend: rutas, validaciones, permisos, auditoría.
- Tests y documentación de contratos.
- Preview verificado en navegador.

Observaciones
- Mantener consistencia con permisos y seeds actuales.