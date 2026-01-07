# 📚 Índice de Documentación - ALEXA-TECH

## 🏗️ Arquitectura

### Reestructuración del Proyecto
- [Plan de Acción](./architecture/restructure-action-plan.md) - Plan completo de reestructuración del proyecto
- [Análisis de Reestructuración](./architecture/restructure-analysis.md) - Análisis detallado del estado actual y propuesta
- [Resumen Ejecutivo](./architecture/restructure-executive-summary.md) - Resumen ejecutivo de la reestructuración
- [Checklist](./architecture/restructure-checklist.md) - Lista de verificación de tareas
- [Diagrama Visual](./architecture/restructure-diagram.md) - Diagramas visuales de la estructura
- [Progreso](./architecture/restructure-progress.md) - Estado actual del progreso de reestructuración

### Fases Completadas
- ✅ [Fase 1: Preparación](./architecture/restructure-progress.md#fase-1-preparación-día-1-2) - Backup, inventarios, estructura base
- ✅ [Fase 2: Código Compartido](./architecture/restructure-progress.md#fase-2-código-compartido-día-3-6) - Paquete shared con tipos y constantes
- ✅ [Fase 3: Documentación](./FASE_3_COMPLETADA.md) - Organización de 16 documentos
- ✅ [Fase 4: Backend Modular](./FASE_4_COMPLETADA.md) - 8 módulos funcionales migrados
- ✅ [Fase 5: Frontend Modular](./FASE_5_COMPLETADA.md) - 7 módulos con 64 archivos reorganizados

---

## 🔌 API

### Documentación de Endpoints
- **Usuarios**: Gestión de usuarios y autenticación
- **Productos**: CRUD de productos e inventario
- **Compras**: Órdenes de compra y proveedores
- **Ventas**: Transacciones y facturación
- **Inventario**: Movimientos y stock por almacén
- **Almacenes**: Gestión de almacenes
- **Entidades Comerciales**: Clientes y proveedores

> Nota: La documentación específica de cada endpoint se creará en la Fase 3

---

## 👨‍💻 Desarrollo

### Guías de Desarrollo
- [Plan de Implementación](./development/implementation-plan.md) - Plan detallado de implementación de funcionalidades
- [Validación de Requisitos](./development/requirements-validation.md) - Validación y documentación de requisitos
- [Guía del Paquete Compartido](./development/shared-package-guide.md) - Cómo usar el paquete @alexa-tech/shared

### Inventarios
- [Archivos TypeScript](./development/inventory-ts-files.txt) - Inventario de todos los archivos .ts del proyecto
- [Archivos de Configuración](./development/inventory-config-files.txt) - Inventario de archivos .json
- [Documentación](./development/inventory-docs.txt) - Inventario de archivos .md

---

## 📦 Módulos

### Documentación por Módulo
- [Presentación del Módulo de Compras](./modules/purchases-presentation.md) - Presentación completa del módulo de compras

> Nota: Se agregará documentación detallada de cada módulo durante la reestructuración

---

## 🚀 Deployment

### Guías de Despliegue
> Esta sección se completará con guías de deployment para producción

---

## 📊 Reportes

### Reportes Técnicos
- [Correcciones del Módulo Kardex](./reports/kardex-corrections.md) - Documentación de correcciones realizadas
- [Diagnóstico SIGO](./reports/diagnostico-sigo.md) - Reporte de diagnóstico del sistema SIGO
- [Reporte Final Kardex](./reports/kardex-final-report.md) - Reporte final de implementación del módulo Kardex

---

## 🤖 Prompts de IA

### Prompts y Plantillas
- [Prompts de IA](./prompts/ai-prompts.md) - Colección de prompts usados con asistentes de IA

---

## 📖 Convenciones y Estándares

### Código Compartido (@alexa-tech/shared)

El proyecto utiliza un paquete compartido entre frontend y backend:

**Estructura:**
```
shared/
├── types/          # Definiciones TypeScript
├── constants/      # Constantes y enums
├── validation/     # Validaciones reutilizables
└── utils/          # Utilidades comunes
```

**Uso:**
```typescript
// Backend y Frontend
import { User, Product, PERMISSIONS } from '@alexa-tech/shared';
import { validateEmail, validatePassword } from '@alexa-tech/shared/validation';
```

### Convenciones de Código

**Backend (Node.js/Express/TypeScript):**
- Controllers en `src/controllers/`
- Services en `src/services/`
- Middleware en `src/middleware/`
- Configuración en `src/config/`

**Frontend (React/TypeScript):**
- Componentes en `src/components/`
- Páginas en `src/pages/`
- Servicios API en `src/services/`
- Hooks personalizados en `src/hooks/`

**Base de Datos (PostgreSQL/Prisma):**
- Schema en `prisma/schema.prisma`
- Migraciones en `prisma/migrations/`
- Seeds en `prisma/seed.ts`

---

## 🔍 Enlaces Rápidos

### Repositorio
- [README Principal](../README.md)
- [Backend README](../alexa-tech-backend/README.md)
- [Frontend README](../alexa-tech-react/README.md)
- [Shared Package README](../shared/README.md)

### Recursos Externos
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

---

## 📝 Notas

**Estado de la Documentación:**
- ✅ Fase 1 (Preparación): Completa
- ✅ Fase 2 (Código Compartido): Completa
- ✅ Fase 3 (Documentación): Completa
- ✅ Fase 4 (Backend Modular): Completa
- ✅ Fase 5 (Frontend Modular): Completa
- ⏸️ Fases 6-8: Pendientes

**Última Actualización:** 2025-01-XX (Progreso: ~60%)

---

## 🤝 Contribuir

Para agregar o actualizar documentación:

1. Identifica la sección apropiada (architecture, api, development, modules, etc.)
2. Crea o actualiza el archivo correspondiente
3. Actualiza este índice con el enlace
4. Haz commit con mensaje descriptivo: `docs(seccion): descripción del cambio`

---

*Este índice se actualiza continuamente durante el proceso de reestructuración.*
