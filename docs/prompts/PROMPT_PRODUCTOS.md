# Prompt listo: Módulo Productos

Objetivo:
- Gestionar productos con edición inline, estado activo/inactivo, filtros y búsqueda.
- KPI: edición y creación sin errores; lista y filtros en <300ms.

Alcance
- Frontend:
  - Páginas/modales: ListaProductos, NuevoProductoModal, EditarProductoModal.
  - Componentes: tabla/tarjetas, filtros por categoría, precio, unidad, ubicación, estado.
  - Estados: cargando, vacío, error; responsive.
- Backend:
  - Endpoints: `/api/productos`, `/api/productos/:codigo`, `/api/productos/:codigo/status`.
  - Validaciones: nombre, categoría, `precioVenta` (>0), `stock` (>=0), `unidadMedida` (normalizada), `ubicacion`.
  - Permisos: admin (crear/editar/inactivar), supervisor (editar/reactivar), cajero (lectura).
  - Auditoría: creación, actualización, cambio de estado.

Requerimientos Funcionales (RF)
- RF-01: Crear producto `{ codigo, nombre, descripcion, categoria, precioVenta, stock, unidadMedida, ubicacion }`.
- RF-02: Editar por código (nombre, categoría, precioVenta, stock, unidad, ubicación).
- RF-03: Listar con filtros: `q`, `categoria`, `minPrecio/maxPrecio`, `estado`, `unidadMedida`, `ubicacion`, `minStock`.
- RF-04: Activar/Inactivar por código con permisos.
- RF-05: Manejar duplicados de código (409).

Requerimientos No Funcionales
- Seguridad: JWT y autorización por permisos.
- Performance: filtros y listado <300ms.
- Observabilidad: logs y auditoría.

API Contrato (ejemplos)
- GET `/api/productos?q=texto&categoria=...&minPrecio=...&maxPrecio=...&estado=...&unidadMedida=...&ubicacion=...&minStock=...`
- POST `/api/productos` `{ codigo, nombre, descripcion, categoria, precioVenta, stock, unidadMedida, ubicacion }`
- GET `/api/productos/:codigo`
- PUT `/api/productos/:codigo` `{ nombre, categoria, precioVenta, stock, unidadMedida, ubicacion }`
- PATCH `/api/productos/:codigo/status` `{ estado }`
- Errores esperados: 400, 401, 403, 404, 409, 500.

Modelo de Datos
- Producto: `{ id, codigo, nombre, descripcion, categoria, precioVenta, stock, unidadMedida, ubicacion, estado }`
- Nota: normalizar `unidadMedida` (lower case) para evitar inconsistencias.

Roles y Permisos
- Admin: CRUD y toggle de estado.
- Supervisor: edición y reactivación.
- Cajero: lectura.
- Sin permiso: 403.

UI/UX
- Lista con filtros y búsqueda; estado visible.
- Editar inline con `ModalContext`, código read‑only.
- Notificaciones de éxito/error; UX consistente.
- Responsive móvil/desktop.

Validaciones
- Front: nombre/categoría obligatorios, `precioVenta` > 0, `stock` >= 0, unidad y ubicación válidas.
- Back: mismas reglas; duplicado por código (409).
- Red: no cerrar modal ante error.

Pruebas y Aceptación
- Unit: validadores y helpers.
- Integración: creación, edición, listado, filtros y estado.
- E2E: flujos por rol y errores esperados (400/401/403/409).
- Criterios: lista actualiza tras editar; stock visible coherente; sin errores de consola.

Entorno y Configuración
- `VITE_API_BASE_URL=http://localhost:3004/api`
- `CORS_ORIGIN=http://localhost:5173`

Entregables
- Front: ListaProductos y modales; servicios API.
- Back: rutas, validaciones, permisos, auditoría.
- Tests y documentación.
- Preview verificado.

Observaciones
- Mantener coherencia de stock visible (`initialStock`/`currentStock`).