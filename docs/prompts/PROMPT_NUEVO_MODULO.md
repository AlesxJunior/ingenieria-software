# Plantilla Prompt: Nuevo Módulo

Objetivo
- [Describe el problema y resultado esperado]
- KPI: [ej. respuesta <300ms, sin errores de consola]

Alcance
- Frontend:
  - Rutas y páginas: [/modulo, /modulo/detalle/:id]
  - Modales: [NuevoEntidadModal, EditarEntidadModal]
  - Componentes: [lista, filtros, formularios, notificaciones]
  - Estados: [cargando, vacío, error, éxito] y responsive.
- Backend:
  - Endpoints: [listar, crear, editar, ver por id/código, cambiar estado]
  - Validaciones: [campos obligatorios, rangos, formatos]
  - Permisos: [roles y acciones]
  - Auditoría: [eventos clave]

Requerimientos Funcionales (RF)
- RF-XX: [caso de uso 1]
- RF-YY: [caso de uso 2]
- RF-ZZ: [caso de uso 3]

Requerimientos No Funcionales
- Seguridad: [JWT, autorización, rate-limit]
- Performance: [objetivos]
- Observabilidad: [logs, auditoría]

API Contrato
- [GET] `/api/[modulo]` (query: q, filtros)
- [POST] `/api/[modulo]` `{ ... }`
- [PUT/PATCH] `/api/[modulo]/:id` `{ ... }`
- [GET] `/api/[modulo]/:id`
- [PATCH] `/api/[modulo]/:id/status` `{ estado }`
- Errores: 400, 401, 403, 404, 409, 500.

Modelo de Datos
- Entidad principal: [campos con tipos]
- Relaciones: [si aplica]
- Migraciones y seeds: [detalle]

Roles y Permisos
- Admin: [acciones]
- Supervisor: [acciones]
- Cajero/Vendedor: [acciones]
- Sin permiso: 403.

UI/UX
- Lista y filtros; formularios con validaciones.
- Modales: abrir/cerrar, mensajes, accesibilidad.
- Notificaciones de éxito/error.
- Responsive.

Validaciones
- Front y Back: [reglas y mensajes]
- Duplicados: [definición y manejo]

Pruebas y Aceptación
- Unit: [componentes/funciones]
- Integración: [endpoints]
- E2E: [escenarios críticos]
- Criterios: [lista verificable]

Entorno y Configuración
- `VITE_API_BASE_URL=http://localhost:3004/api`
- `CORS_ORIGIN=http://localhost:5173`

Entregables
- Código (frontend/backend), tests, documentación.
- Preview verificado.

Observaciones y Restricciones
- [restricciones técnicas/negocio]
- [prioridades y deadlines]