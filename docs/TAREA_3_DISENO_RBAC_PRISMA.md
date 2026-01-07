# ✅ TAREA 3 COMPLETADA: Diseño del Modelo RBAC en Prisma

**Fecha:** 18 de Noviembre, 2025  
**Sistema:** AlexaTech ERP  
**Estado:** ✅ COMPLETADO

---

## 📋 RESUMEN EJECUTIVO

Se diseñó e implementó el modelo **Role-Based Access Control (RBAC)** completo en Prisma, creando la tabla `Role` y la relación `User → Role`.

### Cambios Realizados

✅ **Modelo RBAC implementado:**
- Nuevo modelo `Role` con 8 campos
- Relación `User.roleId → Role.id`
- Migración SQL aplicada exitosamente
- Campo `User.permissions` marcado como deprecado (se mantiene para migración)

---

## 🏗️ DISEÑO DEL MODELO RBAC

### Diagrama de Relaciones

```
┌──────────────────────────────────────────┐
│              ROLE                        │
│                                          │
│  id:          String (PK, cuid)          │
│  name:        String (UNIQUE) ⭐         │
│  description: String? (opcional)         │
│  permissions: String[] (array)           │
│  isActive:    Boolean (default: true)    │
│  isSystem:    Boolean (default: false) ⚠️│
│  createdAt:   DateTime                   │
│  updatedAt:   DateTime                   │
│                                          │
│  users:       User[] (relación)          │
└────────────┬─────────────────────────────┘
             │
             │ 1:N (One to Many)
             │
             ▼
┌──────────────────────────────────────────┐
│              USER                        │
│                                          │
│  id:          String (PK, cuid)          │
│  email:       String (UNIQUE)            │
│  username:    String (UNIQUE)            │
│  password:    String                     │
│  firstName:   String                     │
│  lastName:    String                     │
│  isActive:    Boolean                    │
│                                          │
│  ⭐ roleId:   String? (FK nullable)      │
│  ⭐ role:     Role (relación)            │
│                                          │
│  ⚠️ permissions: String[] (DEPRECADO)   │
│                                          │
│  createdAt:   DateTime                   │
│  updatedAt:   DateTime                   │
│  lastAccess:  DateTime?                  │
└──────────────────────────────────────────┘

Cardinalidad:
• 1 Role → N Users (Un rol puede tener múltiples usuarios)
• 1 User → 1 Role (Un usuario tiene exactamente un rol)
```

---

## 📐 ESPECIFICACIÓN DEL MODELO ROLE

### Schema Prisma

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique         // Nombre único del rol (ej: "Admin", "Vendedor")
  description String?                  // Descripción del propósito del rol
  permissions String[] @default([])    // Array de permisos asignados al rol
  isActive    Boolean  @default(true)  // Permite desactivar roles sin eliminarlos
  isSystem    Boolean  @default(false) // Roles del sistema no se pueden eliminar (Admin, Supervisor, etc.)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  users       User[]

  @@map("roles")
}
```

### Campos Detallados

#### 1. `id` (String, PK)
- **Tipo:** Primary Key, cuid generado automáticamente
- **Propósito:** Identificador único del rol
- **Ejemplo:** `"clk123abc456def789"`

#### 2. `name` (String, UNIQUE)
- **Tipo:** String con constraint UNIQUE
- **Propósito:** Nombre del rol (usado en UI y lógica)
- **Restricción:** No puede haber dos roles con el mismo nombre
- **Ejemplos:** 
  - `"Admin"`
  - `"Supervisor"`
  - `"Vendedor"`
  - `"Cajero"`
  - `"Contador"` (rol personalizado)

#### 3. `description` (String?, opcional)
- **Tipo:** String nullable
- **Propósito:** Descripción del propósito y responsabilidades del rol
- **Ejemplos:**
  - Admin: `"Acceso total al sistema, gestión de usuarios y configuración"`
  - Vendedor: `"Realizar ventas, gestionar clientes y ver productos"`
  - Cajero: `"Manejo de caja, ventas y cierre de sesiones"`

#### 4. `permissions` (String[])
- **Tipo:** Array de strings
- **Propósito:** Lista de permisos asignados al rol
- **Default:** Array vacío `[]`
- **Restricción:** Los permisos deben coincidir con los 33 permisos del sistema
- **Ejemplo:**
  ```typescript
  [
    "dashboard.read",
    "sales.create",
    "sales.read",
    "clients.read",
    "clients.create",
    "products.read"
  ]
  ```

#### 5. `isActive` (Boolean)
- **Tipo:** Boolean
- **Default:** `true`
- **Propósito:** Permite desactivar roles sin eliminarlos (soft delete)
- **Uso:** Si `isActive = false`, los usuarios no pueden ser asignados a ese rol
- **Ventaja:** Mantiene integridad referencial sin perder historial

#### 6. `isSystem` (Boolean) ⭐ IMPORTANTE
- **Tipo:** Boolean
- **Default:** `false`
- **Propósito:** Proteger roles críticos del sistema contra eliminación
- **Uso:**
  - `isSystem = true`: Roles como Admin, Supervisor, Vendedor, Cajero (NO se pueden eliminar)
  - `isSystem = false`: Roles personalizados creados por admins (SÍ se pueden eliminar)
- **Validación:** El backend debe validar que no se puedan eliminar roles con `isSystem = true`

#### 7. `createdAt` (DateTime)
- **Tipo:** Timestamp
- **Default:** CURRENT_TIMESTAMP
- **Propósito:** Auditoría - fecha de creación del rol

#### 8. `updatedAt` (DateTime)
- **Tipo:** Timestamp
- **Auto-update:** Se actualiza automáticamente con cada modificación
- **Propósito:** Auditoría - última modificación del rol

---

## 📐 ESPECIFICACIÓN DEL MODELO USER (ACTUALIZADO)

### Schema Prisma

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  username    String    @unique
  password    String
  firstName   String
  lastName    String
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastAccess  DateTime?
  
  // ⭐ RBAC: Relación con Role
  roleId      String?                   // ID del rol asignado (nullable para migración)
  role        Role?     @relation(fields: [roleId], references: [id], onDelete: SetNull)
  
  // ⚠️ DEPRECADO: Mantener temporalmente para migración
  permissions String[]  @default([])    // ⚠️ DEPRECADO: Usar role.permissions en su lugar

  // Relaciones existentes...
  auditLogs   AuditLog[]
  userActivities UserActivity[]
  // ... otras relaciones ...

  @@map("users")
}
```

### Nuevos Campos

#### 1. `roleId` (String?, nullable FK)
- **Tipo:** Foreign Key nullable (apunta a `Role.id`)
- **Nullable:** `true` (permite usuarios sin rol durante migración)
- **OnDelete:** `SetNull` (si se elimina un rol, el usuario queda sin rol)
- **Propósito:** Conectar usuario con su rol asignado

#### 2. `role` (Role?, relación)
- **Tipo:** Relación con modelo Role
- **Nullable:** `true`
- **Propósito:** Acceder a los datos del rol del usuario
- **Uso en código:**
  ```typescript
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true } // ⭐ Incluir permisos del rol
  });
  
  const userPermissions = user.role?.permissions || [];
  ```

#### 3. `permissions` (String[], DEPRECADO)
- **Estado:** ⚠️ **DEPRECADO** - Se mantiene solo para migración
- **Propósito:** Permitir transición gradual de permisos directos a RBAC
- **Plan:** Eliminar en futuras versiones una vez que todos los usuarios tengan rol asignado
- **Uso actual:** Si `roleId` es `null`, usar `permissions` como fallback

---

## 🗄️ MIGRACIÓN SQL GENERADA

### Archivo: `20251119024309_add_rbac_roles_table/migration.sql`

```sql
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN "roleId" TEXT;

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
```

### Análisis de la Migración

✅ **Cambios aplicados:**
1. ✅ Agregado campo `roleId` a tabla `users` (nullable)
2. ✅ Creada tabla `roles` con todos los campos
3. ✅ Creado índice UNIQUE en `roles.name`
4. ✅ Creada foreign key `users.roleId → roles.id`
5. ✅ OnDelete SET NULL (usuarios no se eliminan si se borra el rol)

✅ **Validaciones de la BD:**
- 🔒 `roles.name` es UNIQUE (no puede haber roles duplicados)
- 🔒 `roles.id` es PRIMARY KEY
- 🔒 `users.roleId` es FOREIGN KEY con integridad referencial
- ✅ Valores por defecto aplicados correctamente

---

## 🎯 ROLES DEL SISTEMA (isSystem = true)

Los siguientes 4 roles serán creados en el seed con `isSystem = true`:

### 1. Admin (33 permisos)
```typescript
{
  name: "Admin",
  description: "Administrador del sistema con acceso total",
  permissions: [
    "dashboard.read",
    "users.create", "users.read", "users.update",
    "clients.create", "clients.read", "clients.update", "clients.delete",
    "sales.create", "sales.read", "sales.update", "sales.delete",
    "products.create", "products.read", "products.update", "products.delete",
    "inventory.read", "inventory.update",
    "purchases.create", "purchases.read", "purchases.update", "purchases.delete",
    "cash-registers.create", "cash-registers.read", "cash-registers.update", "cash-registers.delete",
    "cash-sessions.create", "cash-sessions.read", "cash-sessions.update",
    "system.settings",
    "reports.sales", "reports.inventory", "reports.financial"
  ],
  isActive: true,
  isSystem: true  // ⚠️ NO SE PUEDE ELIMINAR
}
```

### 2. Supervisor (24 permisos)
```typescript
{
  name: "Supervisor",
  description: "Supervisor con permisos de gestión operativa",
  permissions: [
    "dashboard.read",
    "users.read",
    "clients.create", "clients.read", "clients.update",
    "sales.create", "sales.read", "sales.update",
    "products.create", "products.read", "products.update",
    "inventory.read", "inventory.update",
    "purchases.create", "purchases.read", "purchases.update",
    "cash-registers.read", "cash-registers.update",
    "cash-sessions.create", "cash-sessions.read", "cash-sessions.update",
    "reports.sales", "reports.inventory", "reports.financial"
  ],
  isActive: true,
  isSystem: true  // ⚠️ NO SE PUEDE ELIMINAR
}
```

### 3. Vendedor (9 permisos)
```typescript
{
  name: "Vendedor",
  description: "Vendedor con permisos de ventas y clientes",
  permissions: [
    "dashboard.read",
    "clients.create", "clients.read", "clients.update",
    "sales.create", "sales.read",
    "products.read",
    "inventory.read",
    "reports.sales"
  ],
  isActive: true,
  isSystem: true  // ⚠️ NO SE PUEDE ELIMINAR
}
```

### 4. Cajero (9 permisos)
```typescript
{
  name: "Cajero",
  description: "Cajero con permisos de caja y ventas",
  permissions: [
    "dashboard.read",
    "clients.read",
    "sales.create", "sales.read",
    "products.read",
    "inventory.read",
    "cash-sessions.create", "cash-sessions.read", "cash-sessions.update"
  ],
  isActive: true,
  isSystem: true  // ⚠️ NO SE PUEDE ELIMINAR
}
```

---

## 🔄 ESTRATEGIA DE MIGRACIÓN DE DATOS

### Fase 1: Crear Roles por Defecto
```typescript
// Script: prisma/seed-roles.ts
const roles = await Promise.all([
  prisma.role.create({ data: ADMIN_ROLE }),
  prisma.role.create({ data: SUPERVISOR_ROLE }),
  prisma.role.create({ data: VENDEDOR_ROLE }),
  prisma.role.create({ data: CAJERO_ROLE })
]);
```

### Fase 2: Asignar Usuarios Existentes a Roles
```typescript
// Inferir rol basado en permisos actuales del usuario
const users = await prisma.user.findMany();

for (const user of users) {
  const role = inferRoleFromPermissions(user.permissions, roles);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { roleId: role.id }
  });
}

function inferRoleFromPermissions(permissions: string[], roles: Role[]): Role {
  // Si tiene 33 permisos → Admin
  if (permissions.length === 33) return roles.find(r => r.name === 'Admin')!;
  
  // Si tiene 24 permisos → Supervisor
  if (permissions.length === 24) return roles.find(r => r.name === 'Supervisor')!;
  
  // Si tiene cash-sessions.* → Cajero
  if (permissions.includes('cash-sessions.create')) {
    return roles.find(r => r.name === 'Cajero')!;
  }
  
  // Default → Vendedor
  return roles.find(r => r.name === 'Vendedor')!;
}
```

### Fase 3: Validar Migración
```typescript
// Verificar que todos los usuarios tengan rol asignado
const usersWithoutRole = await prisma.user.count({
  where: { roleId: null }
});

console.log(`Usuarios sin rol: ${usersWithoutRole}`); // Debe ser 0
```

---

## 💡 VENTAJAS DEL DISEÑO RBAC

### 1. Escalabilidad ✅
```
ANTES (Permisos Directos):
- Cambiar permisos de "Vendedor" = Actualizar 10 usuarios manualmente
- Riesgo de inconsistencias entre vendedores

DESPUÉS (RBAC):
- Cambiar permisos de rol "Vendedor" = 1 update
- Todos los vendedores actualizados automáticamente
```

### 2. Mantenibilidad ✅
```
ANTES:
UPDATE users SET permissions = array_append(permissions, 'quotes.create')
WHERE /* identificar vendedores manualmente */ ...

DESPUÉS:
UPDATE roles SET permissions = array_append(permissions, 'quotes.create')
WHERE name = 'Vendedor'  -- ⚠️ Solo 1 registro
```

### 3. Consistencia ✅
```
ANTES:
- Vendedor 1: ["sales.create", "sales.read", "clients.read"]
- Vendedor 2: ["sales.create", "clients.read"] ❌ Falta sales.read

DESPUÉS:
- Todos los Vendedores heredan exactamente los mismos permisos del rol
```

### 4. UX Mejorada ✅
```
ANTES (Crear Usuario):
- Seleccionar 9 permisos de una lista de 33 ❌ Confuso

DESPUÉS (Crear Usuario):
- Seleccionar 1 rol de una lista de 4 ✅ Simple
```

### 5. Auditoría ✅
```
ANTES:
- ¿Qué usuarios son "Vendedores"? → Buscar manualmente por permisos

DESPUÉS:
- SELECT * FROM users WHERE roleId = (SELECT id FROM roles WHERE name = 'Vendedor')
```

---

## 🔒 VALIDACIONES Y REGLAS DE NEGOCIO

### Validaciones en Backend

#### 1. No Eliminar Roles del Sistema
```typescript
// roles.service.ts
async deleteRole(roleId: string) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  
  if (role.isSystem) {
    throw new Error('Los roles del sistema no se pueden eliminar');
  }
  
  // Verificar que no tenga usuarios asignados
  const usersCount = await prisma.user.count({ where: { roleId } });
  
  if (usersCount > 0) {
    throw new Error(`No se puede eliminar el rol. ${usersCount} usuarios asignados`);
  }
  
  await prisma.role.delete({ where: { id: roleId } });
}
```

#### 2. Validar Permisos del Rol
```typescript
const VALID_PERMISSIONS = [
  'dashboard.read',
  'users.create', 'users.read', 'users.update',
  // ... los 33 permisos
];

async createRole(data: CreateRoleDto) {
  // Validar que todos los permisos sean válidos
  const invalidPermissions = data.permissions.filter(
    p => !VALID_PERMISSIONS.includes(p)
  );
  
  if (invalidPermissions.length > 0) {
    throw new Error(`Permisos inválidos: ${invalidPermissions.join(', ')}`);
  }
  
  return await prisma.role.create({ data });
}
```

#### 3. Usuario Debe Tener Rol
```typescript
async createUser(data: CreateUserDto) {
  if (!data.roleId) {
    throw new Error('El usuario debe tener un rol asignado');
  }
  
  const role = await prisma.role.findUnique({ where: { id: data.roleId } });
  
  if (!role || !role.isActive) {
    throw new Error('El rol no existe o está inactivo');
  }
  
  return await prisma.user.create({ data });
}
```

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

| Aspecto | Permisos Directos | RBAC |
|---------|-------------------|------|
| **Tabla Adicional** | ❌ No | ✅ Sí (Role) |
| **Complejidad BD** | ✅ Simple | ⚠️ Media |
| **Queries** | ✅ 1 query | ⚠️ 2 queries (join) |
| **Gestión Permisos** | ❌ Por usuario | ✅ Por rol |
| **Cambios Masivos** | ❌ N updates | ✅ 1 update |
| **Consistencia** | ❌ Manual | ✅ Automática |
| **UX Creación Usuario** | ❌ 33 permisos | ✅ 4 roles |
| **Auditoría** | ❌ Compleja | ✅ Simple |
| **Escalabilidad** | ❌ Baja | ✅ Alta |
| **Flexibilidad** | ✅ Total | ⚠️ Por rol |

---

## 🎯 ESTADO ACTUAL

### ✅ Completado

- [x] Modelo `Role` diseñado con 8 campos
- [x] Relación `User → Role` implementada
- [x] Migración SQL generada y aplicada
- [x] Campo `User.permissions` marcado como deprecado
- [x] Tabla `roles` creada en PostgreSQL
- [x] Foreign key `users.roleId → roles.id` creada
- [x] Índice UNIQUE en `roles.name` creado
- [x] OnDelete SET NULL configurado

### ⏳ Próximos Pasos

**Tarea 4:** Implementar backend módulo Roles
- [ ] Crear `roles.service.ts` con CRUD
- [ ] Crear `roles.controller.ts` con endpoints
- [ ] Crear `roles.routes.ts` con rutas protegidas
- [ ] Validaciones de negocio (isSystem, usuarios asignados, etc.)

**Tarea 5:** Script de migración de datos
- [ ] Crear roles por defecto (Admin, Supervisor, Vendedor, Cajero)
- [ ] Asignar usuarios existentes a roles
- [ ] Validar que todos los usuarios tengan rol

---

## 📝 NOTAS TÉCNICAS

### Nullable Foreign Key
```prisma
roleId String?  // ⚠️ Nullable para permitir migración gradual
```
**Razón:** Durante la migración, los usuarios existentes no tendrán `roleId` asignado. Una vez que todos tengan rol, se podría cambiar a `String` (non-nullable).

### OnDelete SET NULL
```prisma
role Role? @relation(..., onDelete: SetNull)
```
**Razón:** Si se elimina un rol, los usuarios no deben eliminarse. Quedan sin rol (`roleId = null`) y el admin debe reasignarlos.

### Campo Deprecado
```prisma
permissions String[] @default([])  // ⚠️ DEPRECADO
```
**Razón:** Mantener temporalmente para:
1. Permitir migración gradual
2. Fallback si usuario no tiene rol
3. Eliminar en versiones futuras

---

**Documento generado por:** GitHub Copilot  
**Fecha:** 18 de Noviembre, 2025  
**Próxima tarea:** Implementar backend módulo Roles (Tarea 4)
