# Requisitos de Validación - Sistema de Autenticación AlexaTech

## 📋 Resumen General

Este documento describe todos los requisitos de validación implementados en el sistema de autenticación de AlexaTech, incluyendo validaciones del frontend y backend.

## 🔐 Validación de Contraseñas

### Requisitos Obligatorios

#### 1. **Longitud Mínima**
- **Requisito**: Mínimo 8 caracteres
- **Mensaje de error**: "password debe tener al menos 8 caracteres"
- **Implementación**: Backend (`validation.ts`)

#### 2. **Letra Mayúscula**
- **Requisito**: Al menos una letra mayúscula (A-Z)
- **Mensaje de error**: "password debe contener al menos una letra mayúscula"
- **Patrón**: `/[A-Z]/`
- **Implementación**: Backend (`validation.ts`)

#### 3. **Letra Minúscula**
- **Requisito**: Al menos una letra minúscula (a-z)
- **Mensaje de error**: "password debe contener al menos una letra minúscula"
- **Patrón**: `/[a-z]/`
- **Implementación**: Backend (`validation.ts`)

#### 4. **Número**
- **Requisito**: Al menos un dígito (0-9)
- **Mensaje de error**: "password debe contener al menos un número"
- **Patrón**: `/\d/`
- **Implementación**: Backend (`validation.ts`)

#### 5. **Confirmación de Contraseña**
- **Requisito**: Campo `confirmPassword` debe coincidir exactamente con `password`
- **Mensaje de error**: "Las contraseñas no coinciden"
- **Implementación**: Backend (`validation.ts`)

### Ejemplos de Contraseñas

#### ✅ **Contraseñas Válidas**
```
Password123
Admin2024!
MySecure1
Test123Pass
```

#### ❌ **Contraseñas Inválidas**
```
password123     # Falta mayúscula
PASSWORD123     # Falta minúscula
Password        # Falta número
Pass123         # Muy corta (menos de 8 caracteres)
```

## 👤 Validación de Nombre de Usuario

### Requisitos

#### 1. **Longitud**
- **Mínimo**: 3 caracteres
- **Máximo**: 30 caracteres
- **Mensajes de error**: 
  - "username debe tener al menos 3 caracteres"
  - "username no puede tener más de 30 caracteres"

#### 2. **Caracteres Permitidos**
- **Patrón**: `/^[a-zA-Z0-9_-]+$/`
- **Permitidos**: Letras (a-z, A-Z), números (0-9), guiones (-), guiones bajos (_)
- **Mensaje de error**: "username solo puede contener letras, números, guiones y guiones bajos"

### Ejemplos de Usernames

#### ✅ **Usernames Válidos**
```
admin
user123
test_user
my-username
AlexaTech2024
```

#### ❌ **Usernames Inválidos**
```
ab              # Muy corto
user@domain     # Contiene @
user name       # Contiene espacio
user.name       # Contiene punto
```

## 📧 Validación de Email

### Requisitos

#### 1. **Formato de Email**
- **Patrón**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Mensaje de error**: "email debe ser un email válido"

#### 2. **Campo Requerido**
- **Mensaje de error**: "email es requerido"

### Ejemplos de Emails

#### ✅ **Emails Válidos**
```
user@example.com
admin@alexatech.com
test.user@domain.org
```

#### ❌ **Emails Inválidos**
```
user@domain        # Falta extensión
@domain.com        # Falta usuario
user.domain.com    # Falta @
user @domain.com   # Contiene espacio
```

## 🔄 Flujo de Validación

### Registro de Usuario

1. **Campos Requeridos**:
   - `username` (validación completa)
   - `email` (validación completa)
   - `password` (validación completa)
   - `confirmPassword` (debe coincidir con password)

2. **Proceso de Validación**:
   ```
   Frontend → Validación básica
   Backend → Validación completa
   Base de datos → Verificación de unicidad
   ```

### Login de Usuario

1. **Campos Requeridos**:
   - `email` (formato válido)
   - `password` (campo requerido)

2. **Proceso de Autenticación**:
   ```
   Frontend → Validación de formato
   Backend → Verificación de credenciales
   JWT → Generación de tokens
   ```

## 🛡️ Seguridad Implementada

### Encriptación de Contraseñas
- **Algoritmo**: bcrypt
- **Rounds**: 12 (configurado en `config/index.ts`)
- **Implementación**: Backend (`models/User.ts`)

### Gestión de Tokens
- **Access Token**: JWT con expiración corta
- **Refresh Token**: Para renovación de sesión
- **Almacenamiento**: LocalStorage (frontend)

### Validación de Unicidad
- **Email**: Único en la base de datos
- **Username**: Único en la base de datos
- **Verificación**: Antes de crear usuario

## 📍 Ubicación de Archivos

### Backend
- **Validaciones**: `src/utils/validation.ts`
- **Modelo de Usuario**: `src/models/User.ts`
- **Servicio de Auth**: `src/services/authService.ts`
- **Controlador de Auth**: `src/controllers/authController.ts`

### Frontend
- **Contexto de Auth**: `src/context/AuthContext.tsx`
- **Utilidades de API**: `src/utils/api.ts`
- **Componentes de Login**: `src/pages/Login.tsx`

## 🧪 Usuarios de Prueba

### Usuarios Predefinidos
```javascript
// Usuario con permisos completos
email: "admin@alexatech.com"
password: "admin123" // ❌ Necesita mayúscula
permissions: ["users.create", "users.read", "users.update", "users.delete", "sales.create", "sales.read", "sales.update", "sales.delete", "products.create", "products.read", "products.update", "products.delete", "inventory.read", "inventory.update", "reports.sales", "reports.users"]

// Usuario con permisos de supervisión
email: "supervisor@alexatech.com"  
password: "supervisor123" // ❌ Necesita mayúscula
permissions: ["users.read", "sales.create", "sales.read", "sales.update", "products.create", "products.read", "products.update", "inventory.read", "inventory.update", "reports.sales"]

// Usuario con permisos básicos
email: "user@alexatech.com"
password: "user123" // ❌ Necesita mayúscula
permissions: ["sales.create", "sales.read", "products.read", "inventory.read"]

// Usuario de Prueba (Válido)
email: "testuser3@example.com"
password: "Password123" // ✅ Cumple todos los requisitos
permissions: ["sales.read", "products.read"]
```

## 🔧 Configuración

### Variables de Entorno
```env
# Backend
PORT=3001
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
```

### Puertos de Desarrollo
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api

## 📝 Notas Importantes

1. **Todas las validaciones se ejecutan tanto en frontend como backend** para máxima seguridad
2. **Las contraseñas nunca se almacenan en texto plano** - siempre encriptadas con bcrypt
3. **Los tokens JWT incluyen información del usuario** pero no contraseñas
4. **La validación de unicidad se realiza en tiempo real** durante el registro
5. **Los mensajes de error son específicos** para ayudar al usuario a corregir problemas

## 🚀 Próximas Mejoras

- [ ] Validación de fortaleza de contraseña en tiempo real (frontend)
- [ ] Política de expiración de contraseñas
- [ ] Historial de contraseñas para evitar reutilización
- [ ] Autenticación de dos factores (2FA)
- [ ] Bloqueo de cuenta por intentos fallidos

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Versión del sistema**: 1.0.0