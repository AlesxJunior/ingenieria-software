# 📊 ANÁLISIS COMPLETO: MÓDULO DE USUARIOS Y ROLES

## 📋 Estado Actual del Sistema

### 🔍 **PROBLEMAS IDENTIFICADOS**

#### **1. DUPLICACIÓN DE ARCHIVOS** ❌
```
src/pages/
├── ListaUsuarios.tsx          ← VERSIÓN ANTIGUA (no se usa)
├── ListaRoles.tsx             ← ACTIVA (se usa en App.tsx)
├── CrearUsuario.tsx           ← VERSIÓN ANTIGUA
└── EditarUsuario.tsx          ← VERSIÓN ANTIGUA

src/modules/users/pages/
├── ListaUsuarios.tsx          ← ACTIVA (se usa en App.tsx)
├── CrearUsuario.tsx           ← ACTIVA
└── EditarUsuario.tsx          ← ACTIVA
```

**Problema:** Archivos duplicados que causan confusión y mantenimiento difícil.

---

#### **2. DISCREPANCIA EN GESTIÓN DE PERMISOS** ❌

**EN LISTA DE USUARIOS:**
```typescript
// Modal: EditarUsuarioModal.tsx
// ✅ Permite editar permisos individuales directamente
interface EditarUsuarioModalProps {
  user: ExtendedUser;
  onSave: (userData: UserFormData) => void;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions: string[];  // ← PERMISOS DIRECTOS
}
```

**EN LISTA DE ROLES:**
```typescript
// Modal: EditarRolModal.tsx
// ✅ Permite editar permisos del ROL
interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];  // ← PERMISOS DEL ROL
}
```

**CONFLICTO:** Dos formas de asignar permisos:
1. **Directamente al usuario** (sin rol)
2. **A través de roles** (mejor práctica)

---

#### **3. INCONSISTENCIAS EN BACKEND** ⚠️

**Base de datos actual:**
```prisma
model User {
  id          String    @id @default(cuid())
  username    String    @unique
  email       String    @unique
  password    String
  firstName   String
  lastName    String
  isActive    Boolean   @default(true)
  lastAccess  DateTime?
  permissions String[]  // ← PERMISOS DIRECTOS (Array)
  roleId      String?   // ← ROL OPCIONAL
  role        Role?     @relation(fields: [roleId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  permissions String[] // ← PERMISOS DEL ROL
  isActive    Boolean  @default(true)
  isSystem    Boolean  @default(false)
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Problema:** Sistema híbrido permite:
- Usuario CON rol + permisos adicionales
- Usuario SIN rol + permisos directos
- Usuario CON rol pero sin permisos adicionales

**Esto causa:**
- Confusión en la lógica de autorización
- Dificultad para auditar permisos
- Inconsistencias en la UI

---

## 🎯 PROPUESTA DE SOLUCIÓN PROFESIONAL

### **ARQUITECTURA RECOMENDADA: RBAC (Role-Based Access Control)**

#### **Filosofía:**
```
Rol → Define conjunto de permisos
Usuario → Asignado a UN rol
Permisos efectivos = Permisos del rol
```

### **FLUJO PROPUESTO**

```
┌─────────────────────────────────────────────────────────┐
│                    MÓDULO DE USUARIOS                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. GESTIÓN DE ROLES (Administradores)                  │
│     └─ Crear/Editar/Eliminar Roles                      │
│     └─ Asignar permisos a roles                         │
│     └─ Ver usuarios asignados a cada rol                │
│                                                          │
│  2. GESTIÓN DE USUARIOS (Administradores)                │
│     └─ Crear/Editar/Eliminar Usuarios                   │
│     └─ Asignar UN rol al usuario                        │
│     └─ Ver permisos efectivos (del rol)                 │
│     └─ NO editar permisos individuales                  │
│                                                          │
│  3. MI PERFIL (Todos los usuarios)                      │
│     └─ Ver información personal                         │
│     └─ Cambiar contraseña                               │
│     └─ Ver permisos asignados (solo lectura)            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ ESTRUCTURA PROPUESTA

### **1. Páginas Organizadas**

```
src/modules/users/
├── pages/
│   ├── ListaUsuarios.tsx          ✅ Gestión de usuarios
│   ├── CrearUsuario.tsx           ✅ Crear nuevo usuario
│   ├── EditarUsuario.tsx          ✅ Editar usuario existente
│   ├── PerfilUsuario.tsx          ✅ Perfil personal
│   └── ListaRoles.tsx             ✅ MOVER AQUÍ desde src/pages/
│
├── components/
│   ├── NuevoUsuarioModal.tsx      ✅ Modal crear usuario
│   ├── EditarUsuarioModal.tsx     ✅ SIMPLIFICADO (sin permisos)
│   ├── NuevoRolModal.tsx          ✅ Modal crear rol
│   ├── EditarRolModal.tsx         ✅ Modal editar rol
│   ├── AsignarRolModal.tsx        🆕 NUEVO: Modal asignar rol
│   └── VerPermisosModal.tsx       🆕 NUEVO: Modal ver permisos
│
└── services/
    └── usersApi.ts                ✅ Servicios API
```

---

## 📝 INTERFACES ESTANDARIZADAS

### **Backend Schema (Actualizado)**

```prisma
model User {
  id          String    @id @default(cuid())
  username    String    @unique
  email       String    @unique
  password    String
  firstName   String
  lastName    String
  isActive    Boolean   @default(true)
  lastAccess  DateTime?
  roleId      String    // ← OBLIGATORIO (no nullable)
  role        Role      @relation(fields: [roleId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("users")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  permissions String[] // Array de strings: ["users.read", "sales.create", ...]
  isActive    Boolean  @default(true)
  isSystem    Boolean  @default(false) // Admin, Cajero, etc. (no editables)
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("roles")
}
```

### **Frontend Interfaces**

```typescript
// Usuario con rol
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: string;        // ← SIEMPRE presente
  role: Role;            // ← Incluido en consultas
  lastAccess?: string;
  createdAt: string;
  updatedAt: string;
}

// Rol con permisos
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // ["dashboard.read", "users.create", ...]
  isActive: boolean;
  isSystem: boolean;
  _count?: {
    users: number;       // Cantidad de usuarios con este rol
  };
  createdAt: string;
  updatedAt: string;
}

// Formulario crear usuario
interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;        // ← OBLIGATORIO
}

// Formulario editar usuario
interface UpdateUserFormData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleId?: string;       // ← Se puede cambiar de rol
}

// Formulario crear/editar rol
interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}
```

---

## 🎨 FLUJOS DE USUARIO

### **FLUJO 1: Gestión de Roles**

```
┌────────────────────────────────────────────┐
│        PÁGINA: Lista de Roles              │
├────────────────────────────────────────────┤
│                                            │
│  📊 Estadísticas:                          │
│  ┌──────┬──────┬──────┬──────────────┐    │
│  │ 4    │ 4    │ 4    │ 4            │    │
│  │Total │Activ.│Sistem│Usr. Asignados│    │
│  └──────┴──────┴──────┴──────────────┘    │
│                                            │
│  🔍 Buscar roles... [Filtros]  [+ Nuevo]   │
│                                            │
│  📋 Tabla de Roles:                        │
│  ┌────────┬──────┬─────────┬────────┬───┐ │
│  │Nombre  │Tipo  │Permisos │Usuarios│...│ │
│  ├────────┼──────┼─────────┼────────┼───┤ │
│  │Admin   │Sistem│33 perm  │1 usr   │✏️│ │
│  │Cajero  │Sistem│10 perm  │1 usr   │✏️│ │
│  │Vendedor│Sistem│9 perm   │1 usr   │✏️│ │
│  └────────┴──────┴─────────┴────────┴───┘ │
│                                            │
└────────────────────────────────────────────┘
           │
           ▼ Click en "✏️ Editar"
┌────────────────────────────────────────────┐
│     MODAL: Editar Rol "Cajero"            │
├────────────────────────────────────────────┤
│                                            │
│  Nombre: [Cajero                      ]   │
│  Desc:   [Cajero con acceso a ventas  ]   │
│                                            │
│  📋 Permisos por Módulo:                   │
│  ┌─────────────────────────────────────┐  │
│  │ ☑ DASHBOARD                         │  │
│  │   ☑ dashboard.read                  │  │
│  │                                     │  │
│  │ ☑ VENTAS                            │  │
│  │   ☑ sales.create                    │  │
│  │   ☑ sales.read                      │  │
│  │   ☐ sales.update                    │  │
│  │   ☐ sales.delete                    │  │
│  │                                     │  │
│  │ ☑ CAJAS                             │  │
│  │   ☑ cash-sessions.create            │  │
│  │   ☑ cash-sessions.read              │  │
│  └─────────────────────────────────────┘  │
│                                            │
│  [Cancelar]              [Guardar Cambios] │
└────────────────────────────────────────────┘
```

### **FLUJO 2: Gestión de Usuarios**

```
┌────────────────────────────────────────────┐
│       PÁGINA: Lista de Usuarios            │
├────────────────────────────────────────────┤
│                                            │
│  📊 Estadísticas:                          │
│  ┌──────┬──────┬──────┬──────────────┐    │
│  │ 3    │ 3    │ 0    │ 0            │    │
│  │Total │Activ.│Inact.│Sin Rol       │    │
│  └──────┴──────┴──────┴──────────────┘    │
│                                            │
│  🔍 Buscar usuarios... [Filtros] [+ Nuevo] │
│                                            │
│  📋 Tabla de Usuarios:                     │
│  ┌────────┬────────┬───────┬────────┬───┐ │
│  │Nombre  │Email   │Rol    │Estado  │...│ │
│  ├────────┼────────┼───────┼────────┼───┤ │
│  │Admin   │admin@..│Admin  │Activo  │✏️│ │
│  │Juan P. │juan@.. │Cajero │Activo  │✏️│ │
│  │María G.│maria@..│Vendor │Activo  │✏️│ │
│  └────────┴────────┴───────┴────────┴───┘ │
│                                            │
└────────────────────────────────────────────┘
           │
           ▼ Click en "✏️ Editar"
┌────────────────────────────────────────────┐
│     MODAL: Editar Usuario "Juan"          │
├────────────────────────────────────────────┤
│                                            │
│  Usuario:   [juanperez              ]     │
│  Email:     [juan@alexatech.com     ]     │
│  Nombre:    [Juan                   ]     │
│  Apellido:  [Pérez                  ]     │
│                                            │
│  Rol Actual: [Cajero ▼]                   │
│  ┌────────────────────────────────────┐   │
│  │ ● Admin                            │   │
│  │ ● Cajero        ← SELECCIONADO     │   │
│  │ ● Supervisor                       │   │
│  │ ● Vendedor                         │   │
│  └────────────────────────────────────┘   │
│                                            │
│  📋 Permisos efectivos (del rol Cajero):  │
│  [Ver permisos]  ← Link que abre modal    │
│                                            │
│  Estado: ☑ Activo                         │
│                                            │
│  [Cancelar]              [Guardar Cambios] │
└────────────────────────────────────────────┘
           │
           ▼ Click en "Ver permisos"
┌────────────────────────────────────────────┐
│  MODAL: Permisos efectivos (solo lectura) │
├────────────────────────────────────────────┤
│                                            │
│  Usuario: Juan Pérez                       │
│  Rol: Cajero                               │
│                                            │
│  ✅ dashboard.read - Ver Dashboard         │
│  ✅ sales.create - Crear Ventas            │
│  ✅ sales.read - Ver Ventas                │
│  ✅ clients.read - Ver Clientes            │
│  ✅ products.read - Ver Productos          │
│  ✅ cash-sessions.create - Abrir Caja      │
│  ✅ cash-sessions.read - Ver Caja          │
│                                            │
│  ℹ️ Para modificar permisos, edite el rol │
│     "Cajero" en Gestión de Roles.         │
│                                            │
│  [Cerrar]                                  │
└────────────────────────────────────────────┘
```

---

## 🔒 LÓGICA DE AUTORIZACIÓN

### **Backend Middleware**

```typescript
// src/modules/auth/requirePermission.ts

export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    if (!user || !user.role) {
      return res.status(403).json({ 
        message: 'Usuario sin rol asignado' 
      });
    }

    // ✅ Permisos vienen SOLO del rol
    const permissions = user.role.permissions;

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para esta acción',
        required: requiredPermission,
        current: permissions
      });
    }

    next();
  };
};
```

### **Frontend Protected Routes**

```typescript
// src/modules/auth/components/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  // ✅ Verificar permiso del rol del usuario
  const hasPermission = user.role?.permissions.includes(requiredPermission);

  if (!hasPermission) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};
```

---

## 📦 MIGRACIONES NECESARIAS

### **1. Migración de Base de Datos**

```sql
-- Paso 1: Crear rol "Sin Rol" para usuarios sin rol
INSERT INTO roles (id, name, description, permissions, "isActive", "isSystem", "createdAt", "updatedAt")
VALUES (
  'default-role-id',
  'Usuario Básico',
  'Rol por defecto para usuarios sin asignación',
  ARRAY['dashboard.read'],
  true,
  true,
  NOW(),
  NOW()
);

-- Paso 2: Asignar rol por defecto a usuarios sin rol
UPDATE users
SET "roleId" = 'default-role-id'
WHERE "roleId" IS NULL;

-- Paso 3: Hacer roleId NOT NULL
ALTER TABLE users
ALTER COLUMN "roleId" SET NOT NULL;

-- Paso 4: Eliminar columna permissions de users (si existe)
-- ALTER TABLE users DROP COLUMN permissions;
-- ⚠️ SOLO si decides no soportar permisos individuales
```

### **2. Migración de Datos (TypeScript)**

```typescript
// scripts/migrate-user-permissions.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserPermissions() {
  console.log('🔄 Iniciando migración de permisos...');

  // 1. Obtener usuarios con permisos directos
  const usersWithPermissions = await prisma.user.findMany({
    where: {
      permissions: { not: { equals: [] } }
    }
  });

  for (const user of usersWithPermissions) {
    // 2. Crear rol personalizado para cada usuario
    const customRole = await prisma.role.create({
      data: {
        name: `Custom-${user.username}`,
        description: `Rol personalizado para ${user.firstName} ${user.lastName}`,
        permissions: user.permissions,
        isActive: true,
        isSystem: false
      }
    });

    // 3. Asignar rol al usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: customRole.id }
    });

    console.log(`✅ Migrado: ${user.username} → ${customRole.name}`);
  }

  console.log('✅ Migración completada');
}

migrateUserPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **FASE 1: Preparación**
- [ ] Crear roles por defecto en BD (Admin, Cajero, Vendedor, Supervisor)
- [ ] Migrar usuarios existentes a roles
- [ ] Actualizar schema de Prisma
- [ ] Ejecutar migraciones

### **FASE 2: Backend**
- [ ] Actualizar middleware de autenticación
- [ ] Modificar endpoints de usuarios (obligar roleId)
- [ ] Actualizar endpoints de roles
- [ ] Agregar endpoint `GET /users/:id/effective-permissions`
- [ ] Tests unitarios

### **FASE 3: Frontend - Roles**
- [ ] Mover `ListaRoles.tsx` a `src/modules/users/pages/`
- [ ] Actualizar `NuevoRolModal.tsx`
- [ ] Actualizar `EditarRolModal.tsx`
- [ ] Agregar estadísticas de roles
- [ ] Tests de integración

### **FASE 4: Frontend - Usuarios**
- [ ] Actualizar `ListaUsuarios.tsx` (mostrar rol)
- [ ] Modificar `NuevoUsuarioModal.tsx` (selector de rol)
- [ ] Modificar `EditarUsuarioModal.tsx` (cambiar rol, NO permisos)
- [ ] Crear `VerPermisosModal.tsx` (solo lectura)
- [ ] Eliminar gestión de permisos individuales
- [ ] Tests de integración

### **FASE 5: Limpieza**
- [ ] Eliminar archivos duplicados en `src/pages/`
- [ ] Actualizar rutas en `App.tsx`
- [ ] Actualizar documentación
- [ ] Commit y push

---

## 🎯 RESULTADO ESPERADO

### **Ventajas del nuevo sistema:**

✅ **Simplicidad:** Un usuario = Un rol = Conjunto de permisos
✅ **Mantenibilidad:** Cambiar permisos en un rol afecta a todos los usuarios
✅ **Auditoría:** Fácil rastrear quién tiene qué permisos
✅ **Escalabilidad:** Agregar nuevos roles sin modificar usuarios
✅ **Seguridad:** Principio de menor privilegio
✅ **UX Mejorada:** Flujo claro y profesional

### **Antes vs Después:**

| Aspecto | ❌ Antes | ✅ Después |
|---------|----------|------------|
| **Asignación de permisos** | Directamente al usuario | A través de roles |
| **Editar permisos** | En 2 lugares (usuario y rol) | Solo en roles |
| **Usuario sin rol** | Posible (permisos directos) | Imposible (rol obligatorio) |
| **Consistencia** | Baja (múltiples fuentes) | Alta (una sola fuente) |
| **Mantenimiento** | Difícil (muchos puntos) | Fácil (centralizado) |

---

**Fecha de Análisis:** 28 de Noviembre de 2025  
**Versión del Sistema:** 2.0  
**Autor:** GitHub Copilot  
**Estado:** Propuesta de Mejora
