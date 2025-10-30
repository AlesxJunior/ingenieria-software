# 📦 @alexa-tech/shared

Paquete de código compartido entre backend y frontend del proyecto AlexaTech.

## 📁 Estructura

```
shared/
├── types/           # Interfaces y tipos TypeScript compartidos
├── constants/       # Constantes y enums compartidos
├── validation/      # Reglas de validación compartidas
├── utils/           # Utilidades compartidas
└── README.md
```

## 🎯 Propósito

Este paquete centraliza:
- **Tipos TypeScript**: Interfaces comunes entre frontend y backend
- **Constantes**: Valores estáticos (permisos, categorías, etc.)
- **Validaciones**: Lógica de validación reutilizable
- **Utilidades**: Funciones helper compartidas

## 📦 Instalación

El paquete se instala como dependencia local:

```bash
# En backend
cd alexa-tech-backend
npm install

# En frontend
cd alexa-tech-react
npm install
```

## 🔧 Uso

```typescript
// Importar tipos
import { User, UserRole, CreateUserDTO } from '@alexa-tech/shared/types';

// Importar constantes
import { PERMISSIONS, PRODUCT_CATEGORIES } from '@alexa-tech/shared/constants';

// Importar validaciones
import { validatePassword, validateEmail } from '@alexa-tech/shared/validation';
```

## 🚀 Desarrollo

Después de realizar cambios en `shared/`:

```bash
# Backend
cd alexa-tech-backend
npm install

# Frontend
cd alexa-tech-react
npm install
```

## 📝 Convenciones

- Todos los tipos deben exportarse desde `types/index.ts`
- Todas las constantes deben exportarse desde `constants/index.ts`
- Todas las validaciones deben exportarse desde `validation/index.ts`
- Usar nomenclatura PascalCase para interfaces y tipos
- Usar UPPER_SNAKE_CASE para constantes

---

*Última actualización: 30 de octubre de 2025*
