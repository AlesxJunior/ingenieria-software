# Alexa Tech - Frontend

Este directorio contiene todo el código fuente para la aplicación de frontend del sistema de gestión empresarial Alexa Tech.

## 🚀 Tecnologías Principales

- **Framework**: React 19 con TypeScript
- **Build Tool**: Vite
- **Styling**: Styled Components
- **Routing**: React Router DOM
- **Gestión de Estado**: React Context API
- **Testing de Componentes**: Vitest, React Testing Library
- **Testing E2E**: Playwright

---

## ⚙️ Instalación y Configuración

Para instrucciones detalladas sobre la configuración de las variables de entorno, por favor consulta el [README principal del proyecto](../README.md).

1.  **Navegar al directorio**
    ```bash
    cd alexa-tech-react
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

---

## 📜 Scripts Disponibles

-   **`npm run dev`**: Inicia el servidor de desarrollo de Vite. La aplicación estará disponible en `http://localhost:5173`.

-   **`npm run build`**: Compila la aplicación para producción.

-   **`npm run preview`**: Sirve localmente el contenido de la compilación de producción.

-   **`npm run lint`**: Ejecuta ESLint para analizar la calidad y consistencia del código.

-   **`npm test`**: Ejecuta los tests de componentes y unitarios con Vitest.

-   **`npm run test:e2e`**: Ejecuta los tests End-to-End con Playwright.