# 🧪 TESTS E2E - MÓDULO DE USUARIOS CON RBAC

## 📋 Descripción

Suite completa de tests end-to-end para verificar el funcionamiento del módulo de usuarios con sistema RBAC (Role-Based Access Control).

## 🎯 ¿Qué se prueba?

### ✅ Funcionalidades Principales:

1. **Autenticación y Permisos**
   - Login de usuario admin
   - Verificación de estructura RBAC (user.role.permissions)
   - Validación de permisos clave

2. **Gestión de Roles**
   - Listar roles disponibles
   - Crear roles personalizados
   - Actualizar permisos de roles
   - Eliminar roles

3. **Gestión de Usuarios con RBAC**
   - Crear usuario con `roleId` (sin `permissions` directo)
   - Backend rechaza campo `permissions`
   - Herencia automática de permisos desde el rol
   - Actualización de rol y propagación de permisos

4. **Activación/Desactivación**
   - Toggle de estado de usuarios
   - Verificación de cambios

5. **Validaciones RBAC**
   - Backend rechaza `permissions` en create/update
   - Backend requiere `roleId` en create
   - Usuarios NO tienen campo `permissions` directo
   - Permisos heredados desde `role.permissions`

---

## 🚀 OPCIÓN 1: Test Simplificado (Recomendado)

**Archivo:** `test-users-e2e-simple.js`

### Ventajas:
- ✅ No requiere conocer la contraseña del admin
- ✅ Usa el token del navegador (ya estás autenticado)
- ✅ Rápido de configurar
- ✅ Ideal para verificaciones rápidas

### 📝 Instrucciones:

#### 1. Obtener token del navegador:

```bash
# A. Abre el frontend
http://localhost:5173

# B. Inicia sesión con tu usuario admin

# C. Abre la consola del navegador (F12)

# D. Ejecuta en la consola:
localStorage.getItem('alexatech_token')

# E. Copia el token que aparece (será una cadena larga)
```

#### 2. Configurar el test:

```bash
# Abre el archivo:
test-users-e2e-simple.js

# Busca la línea 20:
const TOKEN_FROM_BROWSER = 'PEGA_TU_TOKEN_AQUI';

# Reemplaza 'PEGA_TU_TOKEN_AQUI' con el token copiado:
const TOKEN_FROM_BROWSER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Tu token
```

#### 3. Ejecutar el test:

```bash
cd "C:\Users\nesto\OneDrive\Escritorio\PROYECTO SOTFWARE\ingenieria-software"
node test-users-e2e-simple.js
```

### ✅ Salida Esperada:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    TEST E2E - MÓDULO USUARIOS (SIMPLE)                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

================================================================================
🔐 TEST 1: VERIFICAR TOKEN
================================================================================
✅ PASS: Token es válido (obtiene usuarios)
📊 Usuarios en sistema: 5

================================================================================
🎨 TEST 2: CREAR ROL PERSONALIZADO
================================================================================
✅ PASS: Rol creado exitosamente
✅ PASS: Rol tiene ID
✅ PASS: Rol es personalizado
🆔 Rol creado: cmi5hcc...

================================================================================
👤 TEST 3: CREAR USUARIO CON ROL (RBAC)
================================================================================
📤 Payload (sin permissions):
{
  "username": "e2euser_1732901234567",
  "email": "e2euser_1732901234567@test.com",
  "password": "***",
  "firstName": "E2E",
  "lastName": "Usuario",
  "roleId": "cmi5hcc...",
  "isActive": true
}
✅ PASS: Usuario creado exitosamente
✅ PASS: Usuario tiene roleId correcto
✅ PASS: Usuario NO tiene campo permissions directo
🆔 Usuario creado: cmi5hdd...

... [más tests] ...

================================================================================
🎉 TODOS LOS TESTS PASARON 🎉
================================================================================
✅ RBAC funcionando correctamente
✅ Backend rechaza campo permissions
✅ Herencia de permisos desde roles
✅ Actualización de roles funciona
================================================================================
```

---

## 🔐 OPCIÓN 2: Test Completo con Credenciales

**Archivo:** `test-users-module-e2e.js`

### Ventajas:
- ✅ Más completo (9 tests vs 8)
- ✅ Incluye test de autenticación
- ✅ No requiere configuración manual

### Requisitos:
- ❌ Necesitas conocer las credenciales del usuario admin

### 📝 Instrucciones:

#### 1. Verificar credenciales del admin:

```bash
cd "C:\Users\nesto\OneDrive\Escritorio\PROYECTO SOTFWARE\ingenieria-software\alexa-tech-backend"
node get-admin-credentials.js
```

**Salida esperada:**
```
✅ Encontrados 1 usuario(s) admin:

1. Usuario:
   Email:     admin@alexatech.com
   Username:  admin
   Nombre:    Admin Nestor
   Rol:       Admin
   Permisos:  33
   Activo:    ✅

CREDENCIALES PARA TESTS:
1. Usar credenciales del seed:
   {
     email: "admin@alexatech.com",
     password: "Admin123!@#"
   }
```

#### 2. Configurar credenciales:

```bash
# Abre el archivo:
test-users-module-e2e.js

# Busca la línea 17:
const CREDENTIALS = {
  admin: {
    email: 'admin@alexatech.com',
    password: 'Admin123!@#' // ⚠️ Ajusta si usaste otra contraseña
  }
};
```

#### 3. Ejecutar el test:

```bash
cd "C:\Users\nesto\OneDrive\Escritorio\PROYECTO SOTFWARE\ingenieria-software"
node test-users-module-e2e.js
```

---

## 📊 Comparación de Tests

| Característica | Simple | Completo |
|----------------|--------|----------|
| **Archivo** | test-users-e2e-simple.js | test-users-module-e2e.js |
| **Tests** | 8 | 9 |
| **Configuración** | Manual (token) | Automática (credenciales) |
| **Tiempo setup** | 1 min | 2 min |
| **Requiere login manual** | ✅ Sí (en navegador) | ❌ No |
| **Requiere conocer password** | ❌ No | ✅ Sí |
| **Test de autenticación** | ❌ No | ✅ Sí |
| **Ideal para** | Verificación rápida | Testing completo |

---

## 🐛 Solución de Problemas

### ❌ Error: "Token no configurado"

**Problema:**
```
❌ No has configurado el token
```

**Solución:**
1. Asegúrate de haber copiado el token del navegador
2. Verifica que no haya espacios o comillas extra
3. El token debe empezar con algo como `eyJhbGciOi...`

---

### ❌ Error: "Request failed with status code 401"

**Problema:**
```
❌ Test 1 falló: Request failed with status code 401
Response data: { success: false, message: 'Credenciales inválidas' }
```

**Solución:**

**Para test simple:**
- El token expiró → Vuelve a obtenerlo del navegador

**Para test completo:**
1. Verifica las credenciales en `test-users-module-e2e.js`
2. Ejecuta `node get-admin-credentials.js` para ver email correcto
3. Si usaste seed: password es `Admin123!@#`
4. Si creaste admin manual: usa tu password

---

### ❌ Error: "Cannot find module 'axios'"

**Problema:**
```
Error: Cannot find module 'axios'
```

**Solución:**
```bash
cd "C:\Users\nesto\OneDrive\Escritorio\PROYECTO SOTFWARE\ingenieria-software"
npm install axios
```

---

### ❌ Error: "connect ECONNREFUSED ::1:3001"

**Problema:**
```
Error: connect ECONNREFUSED ::1:3001
```

**Solución:**
1. Verifica que el backend esté corriendo:
   ```bash
   cd alexa-tech-backend
   npm run dev
   ```

2. Debe mostrar:
   ```
   ✅ Servidor corriendo en http://localhost:3001
   ```

---

## 📝 Tests Incluidos

### Test Simple (8 tests):

1. ✅ Verificar token
2. ✅ Crear rol personalizado
3. ✅ Crear usuario con rol (RBAC)
4. ✅ Verificar herencia de permisos
5. ✅ Cambiar rol de usuario
6. ✅ Rechazar campo permissions
7. ✅ Activar/desactivar usuario
8. ✅ Limpieza de recursos

### Test Completo (9 tests):

1. ✅ Autenticación y permisos
2. ✅ Listar roles
3. ✅ Crear rol personalizado
4. ✅ Crear usuario con rol (RBAC)
5. ✅ Actualizar rol de usuario
6. ✅ Activar/desactivar usuario
7. ✅ Listar usuarios con filtros
8. ✅ Actualizar permisos de rol
9. ✅ Limpieza de recursos

---

## 🎯 Verificaciones Clave

Ambos tests verifican:

✅ **Backend rechaza campo "permissions" en create/update**
✅ **Backend requiere campo "roleId" en create**
✅ **Usuarios NO tienen campo "permissions" directo**
✅ **Usuarios heredan permisos desde role.permissions**
✅ **Cambio de rol actualiza permisos automáticamente**
✅ **Activar/desactivar usuarios funciona correctamente**
✅ **CRUD de roles funciona correctamente**
✅ **Actualización de permisos de rol se propaga a usuarios**

---

## 🚀 Recomendación

**Usa el test simple** (`test-users-e2e-simple.js`) si:
- Solo quieres verificar que todo funciona
- No conoces la contraseña del admin
- Ya estás logueado en el frontend

**Usa el test completo** (`test-users-module-e2e.js`) si:
- Necesitas testing exhaustivo
- Conoces las credenciales del admin
- Quieres automatizar completamente

---

## 📞 Soporte

Si los tests fallan:

1. ✅ Verifica que el backend esté corriendo (`npm run dev`)
2. ✅ Verifica que la base de datos esté accesible
3. ✅ Verifica las credenciales/token según el test que uses
4. ✅ Revisa los logs del backend para más detalles
5. ✅ Ejecuta `node get-admin-credentials.js` para ver datos del admin

---

**🎉 ¡Listo! Ya tienes tests E2E completos para el módulo de usuarios con RBAC.**
