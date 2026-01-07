# Alexa Tech - Backend

![Tests](https://img.shields.io/badge/tests-351%20passing-success)
![Coverage](https://img.shields.io/badge/coverage-47.91%25-yellow)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Este directorio contiene todo el código fuente para la API del backend del sistema de gestión empresarial Alexa Tech.

## 🚀 Tecnologías Principales

- **Runtime**: Node.js
- **Framework**: Express.js con TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (Access + Refresh Tokens)
- **Testing**: Vitest + @vitest/coverage-v8

---

## ⚙️ Instalación y Configuración

Para instrucciones detalladas sobre la configuración de la base de datos y las variables de entorno, por favor consulta el [README principal del proyecto](../README.md).

### Primeros Pasos (Configuración Inicial)

Para configurar y levantar el backend por primera vez, sigue estos pasos en orden:

1.  **Navegar al directorio**:
    ```bash
    cd alexa-tech-backend
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Aplicar migraciones de la base de datos**:
    Este comando creará las tablas y estructuras necesarias en tu base de datos.
    ```bash
    npx prisma migrate dev
    ```

4.  **Poblar la base de datos (Seed)**:
    Este comando llenará la base de datos con datos iniciales, incluyendo los usuarios por defecto.
    ```bash
    npx prisma db seed
    ```

Después de completar estos pasos, ya puedes iniciar el servidor en modo de desarrollo.


---

## 📜 Scripts Disponibles

-   **`npm run dev`**: Inicia el servidor en modo de desarrollo con recarga automática (usando `nodemon`).

-   **`npm run build`**: Compila el código de TypeScript a JavaScript para producción.

-   **`npm run start`**: Inicia el servidor en modo de producción (usando el código compilado).

-   **`npm run lint`**: Ejecuta ESLint para analizar la calidad y consistencia del código.

-   **`npm test`**: Ejecuta toda la suite de pruebas (unitarias y de integración) con Jest.

-   **`npx prisma migrate dev`**: Aplica las migraciones pendientes a la base de datos de desarrollo.

-   **`npx prisma db seed`**: Puebla la base de datos con los datos iniciales definidos.

-   **`npx prisma studio`**: Abre el administrador visual de la base de datos de Prisma.

---

## 🧪 Testing y Cobertura

### Estadísticas Actuales

- **Total Tests**: 351 (100% passing ✅)
- **Coverage Global**: 47.91%
- **Framework**: Vitest 4.0.6

### Módulos con Mayor Cobertura

| Módulo | Tests | Coverage | Estado |
|--------|-------|----------|--------|
| Warehouses | 24 | 100% | ✅ |
| Permissions | 31 | 100% | ✅ |
| Inventory | 34 | 94.73% | ✅ |
| Clients | 41 | 84.05% | ✅ |
| JWT Utils | 32 | ~85% | ✅ |
| Auth Middleware | 26 | ~80% | ✅ |
| Users | 25 | 70%+ | ✅ |

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ver reporte HTML de cobertura
open coverage/index.html  # macOS/Linux
start coverage/index.html # Windows
```

### Reportes de Cobertura

El reporte HTML completo se genera en `coverage/index.html` y proporciona:
- Cobertura detallada por archivo
- Líneas cubiertas y no cubiertas
- Visualización de branches y funciones
- Métricas por módulo

````
