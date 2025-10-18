# 🚀 AlexaTech - Sistema de Gestión Empresarial

## 📋 Descripción del Proyecto

AlexaTech es un sistema completo de gestión empresarial desarrollado con tecnologías modernas. Incluye autenticación robusta, gestión de usuarios con permisos granulares, validaciones de seguridad avanzadas y una interfaz de usuario intuitiva.

## 🏗️ Arquitectura del Sistema

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Styling**: Styled Components
- **Estado Global**: Context API (AuthContext, AppContext, NotificationContext, ModalContext)
- **Routing**: React Router DOM
- **HTTP Client**: Axios con interceptores

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js
- **Framework**: Express.js con TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (Access + Refresh Tokens)
- **Encriptación**: bcrypt (12 rounds)
- **Validaciones**: Sistema personalizado de validaciones
- **Logging**: Winston con múltiples niveles
- **Rate Limiting**: Express Rate Limit

## ✨ Características Implementadas

### 🔐 Autenticación y Seguridad
- ✅ Sistema de login/logout con JWT
- ✅ Registro de usuarios con validaciones robustas
- ✅ Validaciones de contraseña con requisitos específicos
- ✅ Encriptación con bcrypt (12 rounds)
- ✅ Tokens de acceso y renovación (refresh tokens)
- ✅ Rutas protegidas con middleware de autenticación
- ✅ Middleware de seguridad (Helmet, CORS)
- ✅ Rate limiting para prevenir ataques
- ✅ Validación de tokens y manejo de expiración
- ✅ Logout de todas las sesiones

### 👥 Gestión de Usuarios
- ✅ CRUD completo de usuarios
- ✅ Sistema de permisos granulares basado en CRUD (module.action)
- ✅ Permisos por módulos: users, sales, products, inventory, reports
- ✅ Validaciones de unicidad (email/username)
- ✅ Perfiles de usuario personalizables
- ✅ Estados activo/inactivo (soft delete)
- ✅ Filtros y búsqueda avanzada
- ✅ Paginación de resultados
- ✅ Asignación granular de permisos individuales

### 🛍️ Gestión de Ventas
- ✅ Interfaz de punto de venta (POS)
- ✅ Carrito de compras interactivo
- ✅ Selección de clientes
- ✅ Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- ✅ Cálculo automático de totales e impuestos
- ✅ Historial de ventas con filtros
- ✅ Estados de venta (completada, pendiente, cancelada)
- ✅ Búsqueda por número de venta y cliente

### 📦 Gestión de Inventario
- ✅ CRUD completo de productos
- ✅ Control de stock en tiempo real
- ✅ Categorización de productos
- ✅ Estados de producto (disponible, agotado, próximamente)
- ✅ Códigos de producto únicos
- ✅ Búsqueda y filtros avanzados
- ✅ Actualización automática de stock en ventas

### 👤 Gestión de Clientes
- ✅ Registro completo de clientes
- ✅ Tipos de documento (DNI, RUC)
- ✅ Información de contacto completa
- ✅ Búsqueda por nombre, email y teléfono
- ✅ Modales para crear y editar clientes
- ✅ Validaciones de datos de contacto

### 💰 Gestión de Caja
- ✅ Apertura y cierre de caja
- ✅ Control de montos iniciales y finales
- ✅ Estados de caja (abierta/cerrada)
- ✅ Asociación con usuarios y ventas
- ✅ Historial de movimientos de caja

### 🧪 Testing y Calidad de Código
- ✅ **Linting y Formateo**: Configuración de ESLint y Prettier para mantener un código limpio y consistente.
- ✅ **Tests Unitarios (Backend)**: Base de tests con Jest para los servicios de negocio, mockeando la base de datos.
- ✅ **Tests de Integración (Backend)**: Pruebas con Supertest para verificar el comportamiento de los endpoints de la API.
- ✅ **Tests de Componentes (Frontend)**: Configuración de Vitest y React Testing Library para probar componentes de UI.
- ✅ **Integración Continua (CI)**: Workflow de GitHub Actions que ejecuta automáticamente todos los linters y tests en cada push.

### 📊 Dashboard y Reportes
- ✅ Dashboard principal con métricas
- ✅ Estadísticas de ventas en tiempo real
- ✅ Contadores de usuarios activos
- ✅ Auditoría de logs (estructura implementada)
- ✅ Reportes de actividad por usuario

## 🛠️ Tecnologías Utilizadas

### Frontend
```json
{
  "react": "^18.3.1",
  "typescript": "~5.6.2",
  "vite": "^6.0.1",
  "react-router-dom": "^6.28.0",
  "axios": "^1.7.7",
  "styled-components": "^6.1.13",
  "lucide-react": "^0.454.0"
}
```

### Backend
```json
{
  "express": "^4.21.1",
  "typescript": "^5.6.3",
  "prisma": "^6.16.2",
  "@prisma/client": "^6.16.2",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "helmet": "^8.0.0",
  "winston": "^3.15.0",
  "express-rate-limit": "^7.4.1",
  "morgan": "^1.10.0",
  "dotenv": "^16.4.7"
}
```

### Base de Datos
- **PostgreSQL** - Base de datos principal
- **Prisma** - ORM y generador de cliente
- **Migraciones** - Control de versiones de BD

### Herramientas de Desarrollo
- **Vite** - Build tool y dev server
- **ESLint** - Linting de código
- **TypeScript Compiler** - Verificación de tipos
- **Prisma Studio** - Administración de BD
- **nodemon** - Auto-reload del servidor
- **ts-node** - Ejecución directa de TypeScript

## 📁 Estructura del Proyecto

```
ingenieria-software/
├── .github/
│   └── workflows/
│       └── ci.yml
├── README.md
├── VALIDACION_REQUISITOS.md
├── 📋 PLAN DE IMPLEMENTACIÓN.md
├── docs/
│   └── prompts/
│       ├── CHECKLIST_QA_MODULO.md
│       ├── PROMPT_ENTIDADES.md
│       ├── PROMPT_NUEVO_MODULO.md
│       ├── PROMPT_PRODUCTOS.md
│       └── PROMPT_USUARIOS.md
├── alexa-tech-react/                # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── pages/                   # Páginas
│   │   ├── components/              # Componentes UI
│   │   ├── context/                 # Contextos (Auth, App, Notificaciones)
│   │   ├── hooks/                   # Hooks personalizados
│   │   ├── utils/                   # API y validaciones
│   │   ├── styles/                  # Estilos globales
│   │   ├── assets/                  # Recursos estáticos
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   │   └── e2e/                     # Pruebas E2E (Playwright)
│   ├── playwright.config.ts
│   ├── .env                         # Configuración local
│   ├── .env.e2e                     # Configuración E2E
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── alexa-tech-backend/              # Backend (Node.js + Express + TS)
│   ├── src/
│   │   ├── app.ts                   # Configuración de Express
│   │   ├── index.ts                 # Entrada del servidor
│   │   ├── controllers/             # Controladores
│   │   ├── routes/                  # Rutas (auth, users, entidades, etc.)
│   │   ├── middleware/              # Autenticación y permisos
│   │   ├── services/                # Lógica de negocio (auth, usuarios, entidades)
│   │   ├── models/                  # Modelos auxiliares
│   │   ├── utils/                   # JWT, logger, response
│   │   ├── types/                   # Tipos TS compartidos
│   │   ├── tests/                   # Pruebas de integración
│   │   └── __tests__/               # Pruebas unitarias
│   ├── prisma/
│   │   ├── schema.prisma            # Esquema de BD
│   │   ├── migrations/              # Migraciones
│   │   └── seed.ts                  # Datos iniciales
│   ├── scripts/                     # Scripts de verificación y tests
│   │   ├── check-auth-health.js
│   │   ├── run-all-tests.js
│   │   ├── test-clients-module.js
│   │   ├── test-products-module.js
│   │   └── test-users-module.js
│   ├── package.json
│   └── tsconfig.json
└── package.json                      # Configuración monorepo
```

## 📊 Estado Actual del Desarrollo

### ✅ Funcionalidades Completamente Implementadas

#### Backend (100% Funcional)
- **Autenticación y Autorización**: Sistema completo con JWT, refresh tokens, middleware de autenticación
- **Gestión de Usuarios**: CRUD completo con permisos granulares, soft delete, validaciones
- **Sistema de Permisos**: Modelo granular basado en CRUD (module.action) con asignación individual
- **Middleware de Seguridad**: Rate limiting, logging de requests, manejo de errores
- **Base de Datos**: Esquema Prisma con migraciones y seeding automático
- **Servicios**: AuthService y UserService completamente implementados
- **Logging**: Sistema de logs con Winston para auditoría y debugging

#### Frontend (95% Funcional)
- **Autenticación**: Login, logout, protección de rutas, manejo de tokens
- **Gestión de Usuarios**: Lista, creación, edición, eliminación con validaciones
- **Gestión de Clientes**: CRUD completo con validación de documentos
- **Gestión de Productos**: Inventario con categorías y control de stock
- **Sistema de Ventas**: POS funcional con carrito interactivo
- **Gestión de Caja**: Apertura, cierre, movimientos de efectivo
- **Dashboard**: Métricas en tiempo real y reportes básicos
- **UI/UX**: Interfaz moderna con styled-components y responsive design

#### Base de Datos (100% Implementada)
- **Modelos**: User con sistema de permisos integrado (permissions array)
- **Migraciones**: Sistema de versionado de esquema con limpieza de modelos obsoletos
- **Seeding**: Datos iniciales con usuarios y permisos CRUD predefinidos
- **Validaciones**: Constraints y validaciones a nivel de base de datos

### 🔄 En Desarrollo/Pendiente
- **Reportes Avanzados**: Gráficos y análisis detallados
- **Notificaciones Push**: Sistema de notificaciones en tiempo real
- **Backup Automático**: Sistema de respaldo de datos
- **API Documentation**: Documentación completa con Swagger
- **Testing**: Pruebas unitarias e integración
- **Deployment**: Configuración para producción

### 🎯 Próximos Pasos
1. Implementar sistema de reportes avanzados
2. Agregar pruebas automatizadas
3. Configurar CI/CD pipeline
4. Optimizar rendimiento y caching
5. Documentar APIs con Swagger

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (v18 o superior)
- **PostgreSQL** (v14 o superior)
- **npm** o **yarn**
- **Git**

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd ingenieria-software
```

### 2. Configuración del Backend

#### Instalar Dependencias
```bash
cd alexa-tech-backend
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en `alexa-tech-backend/`:
```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/alexatech_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor - Puerto fijo configurado
PORT=3001
NODE_ENV=development

# CORS - Puerto fijo del frontend
CORS_ORIGIN="http://localhost:5173"

# Configuración de encriptación
BCRYPT_ROUNDS=12
```

#### Configurar Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos iniciales
npx prisma db seed
```

#### Iniciar Servidor Backend
```bash
npm run dev
# Servidor disponible en: http://localhost:3001
```

### 3. Configuración del Frontend

#### Instalar Dependencias
```bash
cd ../alexa-tech-react
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en `alexa-tech-react/`:
```env
VITE_API_URL=http://localhost:3001/api
```

#### Iniciar Servidor Frontend
```bash
npm run dev
# Aplicación disponible en: http://localhost:5173
```

### 4. Comandos Útiles

#### Backend
```bash
# Desarrollo con auto-reload
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm start

# Ejecutar linter
npm run lint

# Ejecutar tests
npm test

# Prisma Studio (administrador de BD)
npx prisma studio --port 5555
```

#### Frontend
```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Preview de construcción
npm run preview

# Ejecutar linter
npm run lint

# Ejecutar tests de componentes
npm test

# Ejecutar tests End-to-End
npm run test:e2e
```

### 5. Configuración de Puertos Fijos

Para evitar conflictos de puertos y garantizar consistencia en el desarrollo, el proyecto está configurado con puertos fijos:

#### Puertos Definidos
- **Backend API**: `3001` (configurado en `.env`)
- **Frontend React**: `5173` (configurado en `vite.config.ts`)
- **Prisma Studio**: `5555` (especificado en comandos)
- **PostgreSQL**: `5432` (puerto estándar)

#### Configuración Backend
El archivo `.env` del backend incluye:
```env
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

#### Configuración Frontend
El archivo `vite.config.ts` incluye:
```typescript
server: {
  port: 5173, // Puerto fijo para desarrollo
  host: true, // Permite conexiones externas
  strictPort: true, // Falla si el puerto está ocupado
}
```

#### Verificación de Puertos
```bash
# Verificar puertos en uso (Windows)
netstat -an | findstr :3001
netstat -an | findstr :5173

# Verificar puertos en uso (Linux/Mac)
lsof -i :3001
lsof -i :5173
```

## 👤 Usuarios de Prueba

El sistema incluye usuarios predefinidos para pruebas:

### Administrador
- **Email:** admin@alexatech.com
- **Contraseña:** AdminPass123!
- **Rol:** ADMIN
- **Permisos:** Acceso completo al sistema

### Moderador
- **Email:** moderator@alexatech.com
- **Contraseña:** ModeratorPass123!
- **Rol:** MODERATOR
- **Permisos:** Gestión de usuarios y contenido

### Usuario Regular
- **Email:** user@alexatech.com
- **Contraseña:** UserPass123!
- **Rol:** USER
- **Permisos:** Acceso básico al sistema

### Validaciones de Contraseña
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 letra minúscula
- Al menos 1 número
- Caracteres especiales recomendados

## 🔄 Estado del Proyecto

### ✅ Completado y Probado
- [x] **Backend API REST** con Node.js + Express + TypeScript
- [x] **Base de datos PostgreSQL** con Prisma ORM
- [x] **Sistema de autenticación JWT** (Access + Refresh tokens)
- [x] **Validaciones robustas** de contraseña y datos
- [x] **Encriptación bcrypt** para contraseñas
- [x] **Gestión de usuarios** con roles (ADMIN, MODERATOR, USER)
- [x] **Middleware de seguridad** (CORS, Helmet)
- [x] **Migraciones de base de datos** y datos iniciales
- [x] **Endpoints de autenticación** (/login, /register)
- [x] **Health check endpoint** (/health)
- [x] **Frontend React** con TypeScript y Vite
- [x] **Interfaz de usuario** moderna y responsive
- [x] **Bases del testing automatizado** (Unit, Integration, Component, E2E)
- [x] **Integración Continua (CI)** con GitHub Actions

### ✅ Pruebas Realizadas
- [x] **Login con credenciales correctas** ✓
- [x] **Validación de credenciales incorrectas** ✓
- [x] **Registro de usuarios** con validaciones ✓
- [x] **Validaciones de contraseña** (frontend y backend) ✓
- [x] **Conexión a PostgreSQL** ✓
- [x] **Endpoints de API** funcionando ✓
- [x] **Encriptación de contraseñas** ✓
- [x] **Tokens JWT** generación y validación ✓

### 🚧 En Desarrollo
- [ ] CRUD completo de productos
- [ ] Sistema de ventas
- [ ] Gestión de clientes
- [ ] Dashboard con métricas
- [ ] Sistema de reportes
- [ ] Auditoría de logs

### 🎯 Próximas Mejoras
- [ ] Aumentar cobertura de tests
- [ ] Documentación de API (Swagger)
- [ ] Rate limiting y throttling
- [ ] Logs estructurados
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Notificaciones push
- [ ] Exportación de datos

## 🔌 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Autenticación

#### POST /auth/login
Autenticar usuario y obtener tokens JWT.

**Request:**
```json
{
  "email": "admin@alexatech.com",
  "password": "AdminPass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "uuid",
    "email": "admin@alexatech.com",
    "username": "admin",
    "role": "ADMIN",
    "isActive": true
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### POST /auth/register
Registrar nuevo usuario.

**Request:**
```json
{
  "email": "nuevo@alexatech.com",
  "username": "nuevousuario",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "email": "nuevo@alexatech.com",
    "username": "nuevousuario",
    "role": "USER"
  }
}
```

### Sistema

#### GET /health
Verificar estado del servidor y base de datos.

**Response (200):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

### Códigos de Error Comunes
- **400**: Bad Request - Datos inválidos
- **401**: Unauthorized - Token inválido o expirado
- **403**: Forbidden - Sin permisos
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Recurso ya existe
- **500**: Internal Server Error - Error del servidor

## 📝 Notas de Desarrollo

### Base de Datos
El sistema utiliza PostgreSQL como base de datos principal con Prisma como ORM. Los datos se persisten de forma permanente y el sistema incluye:
- Migraciones automáticas
- Datos iniciales (seed)
- Validaciones a nivel de base de datos
- Índices optimizados

### Seguridad Implementada
- **Encriptación**: bcrypt con 12 rounds para contraseñas
- **JWT**: Tokens de acceso (15min) y renovación (7 días)
- **Validaciones**: Frontend y backend sincronizadas
- **CORS**: Configurado para desarrollo local
- **Helmet**: Headers de seguridad HTTP
- **Sanitización**: Validación y limpieza de datos de entrada

### Arquitectura
El proyecto sigue una arquitectura modular con separación clara de responsabilidades:

**Frontend:**
- **Components**: Componentes reutilizables
- **Pages**: Páginas específicas de la aplicación
- **Context**: Gestión de estado global con React Context
- **Hooks**: Lógica reutilizable personalizada
- **Utils**: Funciones auxiliares y validaciones

**Backend:**
- **Controllers**: Lógica de negocio y manejo de requests
- **Routes**: Definición de endpoints y middleware
- **Middleware**: Autenticación, validación y seguridad
- **Utils**: Utilidades, validaciones y helpers
- **Types**: Definiciones de tipos TypeScript

### Validaciones
Sistema robusto de validaciones implementado en ambos extremos:
- **Contraseñas**: Mínimo 8 caracteres, mayúscula, minúscula, número
- **Emails**: Formato válido y unicidad
- **Usernames**: Unicidad y caracteres permitidos
- **Datos requeridos**: Validación de campos obligatorios

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

**Alexa Tech Development Team**
- Email: contact@alexatech.com
- Website: https://alexatech.com

---

*Desarrollado con ❤️ para la gestión empresarial moderna*