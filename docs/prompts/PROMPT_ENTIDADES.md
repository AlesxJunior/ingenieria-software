# Prompt listo: Módulo Entidades Comerciales (Clientes/Proveedores)

Objetivo:
- Gestionar clientes y proveedores con validaciones de documentos (DNI/RUC/CE), estados y filtros avanzados.
- KPI: filtros y búsqueda responden en <300ms; sin errores de consola.

Alcance
- Frontend:
  - Páginas/modales: ListaEntidades, NuevaEntidadModal, EditarEntidadModal.
  - Componentes: tabla/tarjetas, filtros por tipo, ubicación, documento, fechas.
  - Estados: cargando, vacío, error; responsive.
- Backend:
  - Endpoints: `/api/clientes`, `/api/clientes/:id` (GET/PUT/PATCH), `/api/clientes/:id/status`, `/api/clientes/stats`.
  - Validaciones: DNI 8 dígitos, RUC válido, CE formato; email único.
  - Permisos: admin (CRUD), supervisor (crear/leer/actualizar), cajero (lectura).
  - Auditoría: creación/actualización/cambio de estado.

Requerimientos Funcionales (RF)
- RF-01: Crear entidad (cliente/proveedor) con documento y datos de contacto.
- RF-02: Listar con filtros: tipo, ubicación, documento, rango de fechas, texto parcial.
- RF-03: Editar datos vía PUT/PATCH.
- RF-04: Activar/Inactivar entidad con permisos.
- RF-05: Estadísticas: totales y activos.

Requerimientos No Funcionales
- Seguridad: JWT y autorización por permisos.
- Performance: respuestas <300ms en filtros comunes.
- Observabilidad: logs y auditoría.

API Contrato (ejemplos)
- GET `/api/clientes?q=texto&tipo=Proveedor&ubicacion=Cusco&fechaInicio=...&fechaFin=...`
- POST `/api/clientes` `{ tipo, documento(DNI/RUC/CE), nombres, apellidos, razonSocial?, email, telefono, ubicacion }`
- GET `/api/clientes/:id`
- PUT `/api/clientes/:id` `{ ... }`
- PATCH `/api/clientes/:id` `{ ... }`
- PATCH `/api/clientes/:id/status` `{ isActive }`
- GET `/api/clientes/stats` → `{ total, activos }`
- Errores esperados: 400, 401, 403, 404, 409, 500.

Modelo de Datos
- Entidad: `{ id, tipo, documento, nombres/apellidos o razónSocial, email, teléfono, ubicación, isActive, createdAt }`

Roles y Permisos
- Admin: CRUD completo.
- Supervisor: crear/leer/actualizar.
- Cajero: lectura.
- Sin permiso: 403.

UI/UX
- Lista con filtros combinables y búsqueda parcial.
- Modales de creación/edición con validaciones específicas por documento.
- Notificaciones de éxito/error; no cierre automático ante errores.
- Responsive móvil/desktop.

Validaciones
- Front: máscaras y reglas (DNI 8 dígitos, RUC válido, CE formato).
- Back: mismas reglas + unicidad de email.
- Duplicados: email bloqueado con 409.

Pruebas y Aceptación
- Unit: validación de documentos.
- Integración: creación, edición, estado, filtros, stats.
- E2E: flujos por rol (admin/supervisor/cajero).
- Criterios: filtros correctos, validaciones activas, permisos respetados.

Entorno y Configuración
- `VITE_API_BASE_URL=http://localhost:3004/api`
- `CORS_ORIGIN=http://localhost:5173`

Entregables
- Front: lista, modales, servicios API.
- Back: rutas, validaciones, permisos, auditoría.
- Tests y documentación.
- Preview verificado.

Observaciones
- Respetar reglas por documento y conflictos de email.