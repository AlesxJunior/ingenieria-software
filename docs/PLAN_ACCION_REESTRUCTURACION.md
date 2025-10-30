# 🎯 Plan de Acción: Reestructuración del Proyecto AlexaTech

## 📅 Cronograma Sugerido

| Fase | Duración | Prioridad | Impacto |
|------|----------|-----------|---------|
| **Fase 1**: Preparación | 2 días | 🔴 Alta | Bajo |
| **Fase 2**: Código Compartido | 3-4 días | 🔴 Alta | Alto |
| **Fase 3**: Documentación | 2 días | 🟡 Media | Medio |
| **Fase 4**: Backend Modular | 4-5 días | 🟡 Media | Alto |
| **Fase 5**: Frontend Modular | 4-5 días | 🟡 Media | Alto |
| **Fase 6**: Configuración | 2-3 días | 🔴 Alta | Medio |
| **Fase 7**: Scripts Superiores | 1-2 días | 🟢 Baja | Bajo |
| **Fase 8**: Docker | 2-3 días | 🟢 Baja | Medio |

**Total estimado**: 20-26 días laborables (~4-5 semanas)

---

## 🚀 FASE 1: PREPARACIÓN (Día 1-2)

### ✅ Tareas Prioritarias

#### 1.1 Backup y Branching
```powershell
# Crear backup
git branch backup-before-restructure
git push origin backup-before-restructure

# Crear rama de trabajo
git checkout -b refactor/project-restructure

# Commit inicial
git commit --allow-empty -m "feat: inicio de reestructuración del proyecto"
git push -u origin refactor/project-restructure
```

#### 1.2 Inventario de Archivos
```powershell
# Crear inventario
cd "c:\Users\nesto\OneDrive\Escritorio\PROYECTO SOTFWARE\ingenieria-software"

# Listar todos los archivos TypeScript
Get-ChildItem -Recurse -Filter *.ts | Select-Object FullName | Out-File -FilePath "docs\inventory-ts-files.txt"

# Listar todos los archivos de configuración
Get-ChildItem -Recurse -Filter *.json | Select-Object FullName | Out-File -FilePath "docs\inventory-config-files.txt"

# Listar documentación
Get-ChildItem -Recurse -Filter *.md | Select-Object FullName | Out-File -FilePath "docs\inventory-docs.txt"
```

#### 1.3 Crear Estructura Base
```powershell
# Crear carpetas principales
New-Item -ItemType Directory -Path "shared\types" -Force
New-Item -ItemType Directory -Path "shared\constants" -Force
New-Item -ItemType Directory -Path "shared\validation" -Force
New-Item -ItemType Directory -Path "shared\utils" -Force

# Crear estructura de docs
New-Item -ItemType Directory -Path "docs\architecture" -Force
New-Item -ItemType Directory -Path "docs\api" -Force
New-Item -ItemType Directory -Path "docs\development" -Force
New-Item -ItemType Directory -Path "docs\deployment" -Force
New-Item -ItemType Directory -Path "docs\modules" -Force
New-Item -ItemType Directory -Path "docs\reports" -Force

# Crear archivos README
New-Item -ItemType File -Path "docs\README.md" -Force
New-Item -ItemType File -Path "shared\README.md" -Force
```

---

## 🔗 FASE 2: CÓDIGO COMPARTIDO (Día 3-6)

### ✅ Prioridad Alta - Impacto Inmediato

#### 2.1 Configurar Paquete Shared
```powershell
cd shared

# Crear package.json
@"
{
  "name": "@alexa-tech/shared",
  "version": "1.0.0",
  "description": "Código compartido entre backend y frontend",
  "main": "index.js",
  "types": "index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "keywords": ["shared", "common", "types"],
  "author": "AlexaTech Team",
  "license": "MIT"
}
"@ | Out-File -FilePath "package.json" -Encoding utf8
```

#### 2.2 Consolidar Tipos TypeScript

**Archivo: `shared/types/index.ts`**
```typescript
// Re-exportar todos los tipos
export * from './user.types';
export * from './product.types';
export * from './inventory.types';
export * from './validation.types';
export * from './api-response.types';
export * from './common.types';
```

**Archivo: `shared/types/user.types.ts`**
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastAccess: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER'
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  role?: UserRole;
  permissions?: string[];
  isActive?: boolean;
}
```

**Archivo: `shared/types/validation.types.ts`**
```typescript
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
```

**Archivo: `shared/types/api-response.types.ts`**
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### 2.3 Consolidar Constantes

**Archivo: `shared/constants/permissions.ts`**
```typescript
export const PERMISSIONS = {
  USERS: {
    CREATE: 'users.create',
    READ: 'users.read',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE_PERMISSIONS: 'users.manage_permissions',
  },
  PRODUCTS: {
    CREATE: 'products.create',
    READ: 'products.read',
    UPDATE: 'products.update',
    DELETE: 'products.delete',
  },
  INVENTORY: {
    CREATE: 'inventory.create',
    READ: 'inventory.read',
    UPDATE: 'inventory.update',
    DELETE: 'inventory.delete',
    ADJUST: 'inventory.adjust',
  },
  PURCHASES: {
    CREATE: 'purchases.create',
    READ: 'purchases.read',
    UPDATE: 'purchases.update',
    DELETE: 'purchases.delete',
    APPROVE: 'purchases.approve',
  },
  SALES: {
    CREATE: 'sales.create',
    READ: 'sales.read',
    UPDATE: 'sales.update',
    DELETE: 'sales.delete',
    REFUND: 'sales.refund',
  },
  REPORTS: {
    VIEW: 'reports.view',
    EXPORT: 'reports.export',
  },
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];
```

**Archivo: `shared/constants/product-categories.ts`**
```typescript
export const PRODUCT_CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electrónica' },
  { value: 'CLOTHING', label: 'Ropa' },
  { value: 'FOOD', label: 'Alimentos' },
  { value: 'BOOKS', label: 'Libros' },
  { value: 'TOYS', label: 'Juguetes' },
  { value: 'SPORTS', label: 'Deportes' },
  { value: 'HOME', label: 'Hogar' },
  { value: 'BEAUTY', label: 'Belleza' },
  { value: 'OTHER', label: 'Otros' },
] as const;

export const PRODUCT_UNITS = [
  { value: 'UNIT', label: 'Unidad' },
  { value: 'KG', label: 'Kilogramo' },
  { value: 'LITER', label: 'Litro' },
  { value: 'METER', label: 'Metro' },
  { value: 'BOX', label: 'Caja' },
  { value: 'PACK', label: 'Paquete' },
] as const;
```

#### 2.4 Consolidar Validaciones

**Archivo: `shared/validation/index.ts`**
```typescript
export * from './validators';
export * from './rules';
export * from './schemas';
```

**Archivo: `shared/validation/validators.ts`**
```typescript
import { ValidationError, ValidationResult } from '../types';

export class Validator {
  private errors: ValidationError[] = [];

  required(value: any, field: string): this {
    if (value === undefined || value === null || value === '') {
      this.errors.push({
        field,
        message: `${field} es requerido`,
        value,
      });
    }
    return this;
  }

  email(value: string, field: string): this {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors.push({
        field,
        message: `${field} debe ser un email válido`,
        value,
      });
    }
    return this;
  }

  minLength(value: string, minLength: number, field: string): this {
    if (value && value.length < minLength) {
      this.errors.push({
        field,
        message: `${field} debe tener al menos ${minLength} caracteres`,
        value,
      });
    }
    return this;
  }

  maxLength(value: string, maxLength: number, field: string): this {
    if (value && value.length > maxLength) {
      this.errors.push({
        field,
        message: `${field} no puede tener más de ${maxLength} caracteres`,
        value,
      });
    }
    return this;
  }

  password(value: string, field: string = 'password'): this {
    this.required(value, field);
    this.minLength(value, 8, field);

    if (value) {
      if (!/[A-Z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra mayúscula`,
          value,
        });
      }

      if (!/[a-z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra minúscula`,
          value,
        });
      }

      if (!/\d/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos un número`,
          value,
        });
      }
    }

    return this;
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  reset(): void {
    this.errors = [];
  }
}
```

**Archivo: `shared/validation/rules.ts`**
```typescript
import { ValidationResult } from '../types';
import { Validator } from './validators';

export const validatePassword = (password: string): ValidationResult => {
  const validator = new Validator();
  validator.password(password, 'Contraseña');
  return validator.getResult();
};

export const validateEmail = (email: string): ValidationResult => {
  const validator = new Validator();
  validator.required(email, 'Email').email(email, 'Email');
  return validator.getResult();
};

export const validateUsername = (username: string): ValidationResult => {
  const validator = new Validator();
  validator
    .required(username, 'Nombre de usuario')
    .minLength(username, 3, 'Nombre de usuario')
    .maxLength(username, 50, 'Nombre de usuario');
  return validator.getResult();
};
```

#### 2.5 Actualizar Referencias

**Backend - Actualizar imports:**
```powershell
# En alexa-tech-backend/package.json agregar:
"dependencies": {
  "@alexa-tech/shared": "file:../shared",
  ...
}
```

Luego en archivos:
```typescript
// Antes
import { ValidationError, ValidationResult } from '../types';
import { validatePassword } from '../utils/validation';

// Después
import { ValidationError, ValidationResult } from '@alexa-tech/shared/types';
import { validatePassword } from '@alexa-tech/shared/validation';
```

**Frontend - Actualizar imports:**
```powershell
# En alexa-tech-react/package.json agregar:
"dependencies": {
  "@alexa-tech/shared": "file:../shared",
  ...
}
```

#### 2.6 Testing de Migración
```powershell
# Backend
cd alexa-tech-backend
npm install
npm run build
npm test

# Frontend
cd alexa-tech-react
npm install
npm run build
npm test
```

---

## 📚 FASE 3: DOCUMENTACIÓN (Día 7-8)

### ✅ Prioridad Media

#### 3.1 Mover Documentación Existente
```powershell
# Mover archivos de documentación
Move-Item -Path "📋 PLAN DE IMPLEMENTACIÓN.md" -Destination "docs\development\implementation-plan.md"
Move-Item -Path "VALIDACION_REQUISITOS.md" -Destination "docs\development\requirements-validation.md"
Move-Item -Path "GEMINI.md" -Destination "docs\development\ai-prompts.md"

# Mover reportes del backend
Move-Item -Path "alexa-tech-backend\KARDEX_MODULE_CORRECTIONS_DOCUMENTATION.md" -Destination "docs\reports\kardex-corrections.md"
Move-Item -Path "alexa-tech-backend\scripts\REPORTE_DIAGNOSTICO_SIGO.md" -Destination "docs\reports\diagnostico-sigo.md"
Move-Item -Path "alexa-tech-backend\scripts\REPORTE_FINAL_KARDEX.md" -Destination "docs\reports\kardex-final-report.md"
```

#### 3.2 Crear Índice de Documentación
```powershell
# Ver contenido en ANALISIS_Y_REESTRUCTURACION.md sección "Crear Índice de Documentación"
```

#### 3.3 Crear Documentación de API
```markdown
<!-- docs/api/README.md -->
# 📡 Documentación de API

## Endpoints Disponibles

### Autenticación
- [POST /auth/login](authentication.md#login)
- [POST /auth/register](authentication.md#register)
- [POST /auth/logout](authentication.md#logout)
- [POST /auth/refresh](authentication.md#refresh-token)

### Usuarios
- [GET /users](users.md#listar-usuarios)
- [GET /users/:id](users.md#obtener-usuario)
- [POST /users](users.md#crear-usuario)
- [PUT /users/:id](users.md#actualizar-usuario)
- [DELETE /users/:id](users.md#eliminar-usuario)

... (continuar con todos los módulos)
```

---

## 🏗️ FASE 4: BACKEND MODULAR (Día 9-13)

### ✅ Implementación Gradual

#### 4.1 Crear Estructura de Módulos
```powershell
# Crear estructura para cada módulo
$modules = @('auth', 'users', 'products', 'inventory', 'purchases', 'sales', 'warehouses')

foreach ($module in $modules) {
    New-Item -ItemType Directory -Path "alexa-tech-backend\src\modules\$module" -Force
    New-Item -ItemType Directory -Path "alexa-tech-backend\src\modules\$module\__tests__" -Force
    
    # Crear archivos base
    New-Item -ItemType File -Path "alexa-tech-backend\src\modules\$module\$module.controller.ts" -Force
    New-Item -ItemType File -Path "alexa-tech-backend\src\modules\$module\$module.service.ts" -Force
    New-Item -ItemType File -Path "alexa-tech-backend\src\modules\$module\$module.routes.ts" -Force
    New-Item -ItemType File -Path "alexa-tech-backend\src\modules\$module\$module.types.ts" -Force
}
```

#### 4.2 Migrar Módulo por Módulo

**Ejemplo: Migrar módulo de Users**

1. **Mover archivos:**
```powershell
# Mover controller
Copy-Item -Path "alexa-tech-backend\src\controllers\userController.ts" -Destination "alexa-tech-backend\src\modules\users\users.controller.ts"

# Mover service
Copy-Item -Path "alexa-tech-backend\src\services\userService.ts" -Destination "alexa-tech-backend\src\modules\users\users.service.ts"

# Mover routes
Copy-Item -Path "alexa-tech-backend\src\routes\userRoutes.ts" -Destination "alexa-tech-backend\src\modules\users\users.routes.ts"

# Mover tests
Copy-Item -Path "alexa-tech-backend\src\services\userService.test.ts" -Destination "alexa-tech-backend\src\modules\users\__tests__\users.service.test.ts"
```

2. **Actualizar imports en archivos movidos**

3. **Actualizar index de routes:**
```typescript
// src/routes/index.ts
import { Router } from 'express';
import usersRoutes from '../modules/users/users.routes';
import authRoutes from '../modules/auth/auth.routes';
// ... otros módulos

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
// ... otros módulos

export default router;
```

4. **Ejecutar tests:**
```powershell
npm test -- users
```

5. **Si todo funciona, eliminar archivos antiguos:**
```powershell
Remove-Item "alexa-tech-backend\src\controllers\userController.ts"
Remove-Item "alexa-tech-backend\src\services\userService.ts"
# ...
```

**Repetir para cada módulo: auth, products, inventory, purchases, sales, warehouses**

#### 4.3 Reorganizar Scripts
```powershell
# Crear categorías
New-Item -ItemType Directory -Path "alexa-tech-backend\scripts\db" -Force
New-Item -ItemType Directory -Path "alexa-tech-backend\scripts\health" -Force
New-Item -ItemType Directory -Path "alexa-tech-backend\scripts\data" -Force
New-Item -ItemType Directory -Path "alexa-tech-backend\scripts\testing" -Force

# Mover scripts
Move-Item -Path "alexa-tech-backend\scripts\check-auth-health.js" -Destination "alexa-tech-backend\scripts\health\"
Move-Item -Path "alexa-tech-backend\scripts\sync-stock-data.js" -Destination "alexa-tech-backend\scripts\data\"
Move-Item -Path "alexa-tech-backend\scripts\test-*-module.js" -Destination "alexa-tech-backend\scripts\testing\"
```

---

## 🎨 FASE 5: FRONTEND MODULAR (Día 14-18)

### ✅ Implementación Similar al Backend

#### 5.1 Crear Estructura
```powershell
$modules = @('auth', 'users', 'products', 'inventory', 'purchases', 'sales')

foreach ($module in $modules) {
    New-Item -ItemType Directory -Path "alexa-tech-react\src\modules\$module\pages" -Force
    New-Item -ItemType Directory -Path "alexa-tech-react\src\modules\$module\components" -Force
    New-Item -ItemType Directory -Path "alexa-tech-react\src\modules\$module\context" -Force
    New-Item -ItemType Directory -Path "alexa-tech-react\src\modules\$module\hooks" -Force
    New-Item -ItemType Directory -Path "alexa-tech-react\src\modules\$module\__tests__" -Force
}
```

#### 5.2 Migrar por Módulo

**Ejemplo: Módulo de Auth**
```powershell
# Mover páginas
Move-Item -Path "alexa-tech-react\src\pages\Login.tsx" -Destination "alexa-tech-react\src\modules\auth\pages\"
Move-Item -Path "alexa-tech-react\src\pages\Register.tsx" -Destination "alexa-tech-react\src\modules\auth\pages\"

# Mover contexto
Move-Item -Path "alexa-tech-react\src\context\AuthContext.tsx" -Destination "alexa-tech-react\src\modules\auth\context\"

# Actualizar imports en archivos
# Ejecutar tests
npm test
```

#### 5.3 Limpiar Archivos Temporales
```powershell
# Eliminar archivos de debug
Remove-Item "alexa-tech-react\debug-*.js"
Remove-Item "alexa-tech-react\*.png"

# Actualizar .gitignore
Add-Content -Path ".gitignore" -Value "`ndebug-*.js`ndebug-*.png`n*.log"
```

---

## ⚙️ FASE 6: CONFIGURACIÓN (Día 19-21)

### ✅ Prioridad Alta

#### 6.1 Archivos de Entorno
```powershell
# Backend
Copy-Item "alexa-tech-backend\.env.example" -Destination "alexa-tech-backend\.env.development"
Copy-Item "alexa-tech-backend\.env.example" -Destination "alexa-tech-backend\.env.test"
Copy-Item "alexa-tech-backend\.env.example" -Destination "alexa-tech-backend\.env.production"

# Frontend
Copy-Item "alexa-tech-react\.env.example" -Destination "alexa-tech-react\.env.development"
Copy-Item "alexa-tech-react\.env.example" -Destination "alexa-tech-react\.env.test"
Copy-Item "alexa-tech-react\.env.example" -Destination "alexa-tech-react\.env.production"
```

#### 6.2 TypeScript Compartido
Ver sección 6.2 en ANALISIS_Y_REESTRUCTURACION.md

#### 6.3 Prettier Compartido
```powershell
# Crear .prettierrc en raíz
@"
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
"@ | Out-File -FilePath ".prettierrc" -Encoding utf8

# Copiar a backend y frontend
Copy-Item ".prettierrc" -Destination "alexa-tech-backend\"
Copy-Item ".prettierrc" -Destination "alexa-tech-react\"
```

#### 6.4 Consolidar Dependencias
```powershell
# Verificar duplicados
cd alexa-tech-backend
npm ls bcrypt
npm ls bcryptjs

# Si ambos están instalados, elegir uno y desinstalar el otro
npm uninstall bcryptjs  # o bcrypt, según convenga
```

---

## 🎬 FASE 7: SCRIPTS SUPERIORES (Día 22-23)

### ✅ Package.json Raíz
Ver sección 7.1 en ANALISIS_Y_REESTRUCTURACION.md

```powershell
# Instalar concurrently
npm install --save-dev concurrently

# Probar scripts
npm run install:all
npm run dev
npm run test
```

---

## 🐳 FASE 8: DOCKER (Día 24-26)

### ✅ Implementación Opcional

```powershell
# Crear estructura
New-Item -ItemType Directory -Path "infrastructure\docker" -Force

# Crear archivos Docker
# Ver sección 8.1 en ANALISIS_Y_REESTRUCTURACION.md
```

---

## ✅ VALIDACIÓN FINAL

### Checklist de Validación

```powershell
# 1. Backend - Build exitoso
cd alexa-tech-backend
npm run build

# 2. Frontend - Build exitoso
cd alexa-tech-react
npm run build

# 3. Tests pasando
cd alexa-tech-backend
npm test

cd alexa-tech-react
npm test
npm run test:e2e

# 4. Lint sin errores
cd ..
npm run lint

# 5. Desarrollo funciona
npm run dev
# Probar login, crear usuario, crear producto, etc.

# 6. Documentación actualizada
# Verificar que todos los README estén actualizados
```

---

## 📊 Métricas de Progreso

Crear archivo para trackear progreso:

```markdown
<!-- docs/restructure-progress.md -->
# Progreso de Reestructuración

## Fase 1: Preparación ✅
- [x] Backup creado
- [x] Rama de trabajo creada
- [x] Inventario de archivos
- [x] Estructura base creada

## Fase 2: Código Compartido ⏳
- [x] Paquete shared configurado
- [x] Tipos consolidados
- [x] Constantes consolidadas
- [ ] Validaciones consolidadas
- [ ] Referencias actualizadas en backend
- [ ] Referencias actualizadas en frontend
- [ ] Tests ejecutados

... (continuar con todas las fases)
```

---

## 🚨 Plan de Contingencia

### Si algo falla:

1. **Revertir al backup:**
```powershell
git checkout backup-before-restructure
```

2. **Revertir cambio específico:**
```powershell
git log --oneline
git revert <commit-hash>
```

3. **Stash cambios temporales:**
```powershell
git stash
git stash list
git stash pop
```

---

## 📞 Comunicación del Equipo

### Template de Update Semanal

```markdown
## Reporte Semanal - Reestructuración del Proyecto

**Fecha:** [Fecha]
**Fase Actual:** [Número de fase]

### ✅ Completado esta semana
- Item 1
- Item 2

### 🔄 En progreso
- Item 1
- Item 2

### 🚧 Bloqueadores
- Ninguno / [Describir bloqueador]

### 📅 Plan para próxima semana
- Item 1
- Item 2

### 📊 Progreso general
- Fase 1: ✅ 100%
- Fase 2: ⏳ 60%
- Fase 3: ⭕ 0%
```

---

*Última actualización: 29 de octubre de 2025*
