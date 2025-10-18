# Project Overview

This is a full-stack enterprise management system called AlexaTech. It is built with a React frontend and a Node.js backend.

**Frontend:**
- React 18 with TypeScript and Vite
- Styled Components for styling
- React Router DOM for routing
- Axios for HTTP requests
- Context API for state management

**Backend:**
- Node.js with Express.js and TypeScript
- PostgreSQL database with Prisma ORM
- JWT for authentication
- bcrypt for password encryption
- Winston for logging
- Express Rate Limit for security

# Building and Running

## Backend

**Installation:**
```bash
cd alexa-tech-backend
npm install
```

**Environment Variables:**
Create a `.env` file in `alexa-tech-backend/` with the following content:
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

**Database Setup:**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos iniciales
npx prisma db seed
```

**Running:**
```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start in production
npm start
```

**Testing:**
```bash
# Run linter
npm run lint

# Run tests
npm test
```

## Frontend

**Installation:**
```bash
cd alexa-tech-react
npm install
```

**Environment Variables:**
Create a `.env` file in `alexa-tech-react/` with the following content:
```env
VITE_API_URL=http://localhost:3001/api
```

**Running:**
```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

**Testing:**
```bash
# Run linter
npm run lint

# Run component tests
npm test

# Run End-to-End tests
npm run test:e2e
```

# Development Conventions

- The project uses `pnpm` as a package manager.
- The codebase is written in TypeScript.
- The project follows a modular architecture with a clear separation of concerns.
- The backend uses a service-oriented architecture.
- The frontend uses a component-based architecture with React.
- The project uses ESLint and Prettier for code linting and formatting.
- The project has a CI/CD pipeline set up with GitHub Actions.
