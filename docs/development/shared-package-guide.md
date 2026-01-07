# 🎯 Guía de Uso del Paquete Shared

## 📦 Instalación Completada

El paquete `@alexa-tech/shared` ya está instalado en:
- ✅ Backend (`alexa-tech-backend`)
- ✅ Frontend (`alexa-tech-react`)

## 🔧 Uso en Backend

### Importar tipos directamente:

```typescript
import { User, Product, MovementType, PurchaseStatus } from '@alexa-tech/shared';

// O importar desde types/
import { User, Product } from '@alexa-tech/shared/types';
```

### Importar constantes:

```typescript
import { 
  PERMISSIONS, 
  PRODUCT_CATEGORIES, 
  MOVEMENT_TYPES,
  PAYMENT_METHODS 
} from '@alexa-tech/shared';

// O importar desde constants/
import { PERMISSIONS } from '@alexa-tech/shared/constants';

// Usar permisos
if (user.permissions.includes(PERMISSIONS.PRODUCTS.CREATE)) {
  // Usuario puede crear productos
}
```

### Usar validaciones:

```typescript
import { 
  validateEmail, 
  validatePassword, 
  validateRUC,
  Validator 
} from '@alexa-tech/shared';

// Validación rápida
const emailResult = validateEmail('user@example.com');
if (!emailResult.isValid) {
  console.log(emailResult.errors);
}

// Validación personalizada
const validator = new Validator();
const result = validator
  .required(productName, 'Nombre')
  .minLength(productName, 3, 'Nombre')
  .getResult();
```

### Ejemplo completo en un controlador:

```typescript
import { 
  CreateProductDTO, 
  ApiResponse, 
  validatePrice,
  validateProductCode 
} from '@alexa-tech/shared';

export const createProduct = async (req: Request, res: Response) => {
  const productData: CreateProductDTO = req.body;
  
  // Validar código
  const codeValidation = validateProductCode(productData.codigo);
  if (!codeValidation.isValid) {
    return res.status(400).json({
      success: false,
      errors: codeValidation.errors
    });
  }
  
  // Validar precio
  const priceValidation = validatePrice(productData.precioVenta);
  if (!priceValidation.isValid) {
    return res.status(400).json({
      success: false,
      errors: priceValidation.errors
    });
  }
  
  // Crear producto...
  const product = await productService.create(productData);
  
  const response: ApiResponse<Product> = {
    success: true,
    message: 'Producto creado exitosamente',
    data: product
  };
  
  res.json(response);
};
```

## 🎨 Uso en Frontend (React)

### Importar tipos:

```typescript
import { User, Product, MovementType } from '@alexa-tech/shared';

// Definir state con tipos compartidos
const [products, setProducts] = useState<Product[]>([]);
const [user, setUser] = useState<User | null>(null);
```

### Usar constantes en componentes:

```typescript
import { 
  PRODUCT_CATEGORIES, 
  PAYMENT_METHODS,
  PURCHASE_STATUS_COLORS 
} from '@alexa-tech/shared';

function ProductForm() {
  return (
    <select>
      {PRODUCT_CATEGORIES.map(cat => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}

function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  const color = PURCHASE_STATUS_COLORS[status];
  return <Badge style={{ backgroundColor: color }}>{status}</Badge>;
}
```

### Validar formularios:

```typescript
import { validateEmail, validatePassword, ValidationResult } from '@alexa-tech/shared';

function LoginForm() {
  const [errors, setErrors] = useState<ValidationResult | null>(null);
  
  const handleSubmit = (email: string, password: string) => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (!emailValidation.isValid) {
      setErrors(emailValidation);
      return;
    }
    
    if (!passwordValidation.isValid) {
      setErrors(passwordValidation);
      return;
    }
    
    // Submit form...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* inputs */}
      {errors && (
        <div>
          {errors.errors.map(err => (
            <p key={err.field}>{err.message}</p>
          ))}
        </div>
      )}
    </form>
  );
}
```

### Usar tipos en servicios API:

```typescript
import axios from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  Product, 
  CreateProductDTO 
} from '@alexa-tech/shared';

class ProductService {
  async getProducts(): Promise<Product[]> {
    const response = await axios.get<ApiResponse<Product[]>>('/api/products');
    return response.data.data || [];
  }
  
  async createProduct(data: CreateProductDTO): Promise<Product> {
    const response = await axios.post<ApiResponse<Product>>('/api/products', data);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data!;
  }
  
  async getProductsPaginated(page: number, limit: number): Promise<PaginatedResponse<Product>> {
    const response = await axios.get<PaginatedResponse<Product>>('/api/products', {
      params: { page, limit }
    });
    return response.data;
  }
}
```

## 🔄 Actualización del Paquete

Cuando se hacen cambios en `shared/`, ambos proyectos deben reinstalar:

```bash
# Backend
cd alexa-tech-backend
npm install

# Frontend
cd alexa-tech-react
npm install
```

O desde la raíz (cuando se configure):
```bash
npm run install:all
```

## ✅ Beneficios

1. **Single Source of Truth**: Los tipos están definidos en un solo lugar
2. **Consistencia**: Backend y frontend usan exactamente los mismos tipos
3. **Mantenibilidad**: Cambios en un tipo se reflejan automáticamente
4. **Autocompletado**: IntelliSense funciona perfectamente
5. **Validación Compartida**: Mismas reglas en cliente y servidor

## 📚 Estructura del Paquete

```
shared/
├── types/              # Interfaces y tipos TypeScript
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── inventory.types.ts
│   ├── purchase.types.ts
│   ├── client.types.ts
│   ├── validation.types.ts
│   ├── api-response.types.ts
│   └── common.types.ts
├── constants/          # Constantes compartidas
│   ├── permissions.ts
│   ├── product-categories.ts
│   ├── movement-types.ts
│   └── purchase-constants.ts
├── validation/         # Validadores
│   ├── validators.ts
│   └── rules.ts
└── index.ts           # Punto de entrada
```

---

*Última actualización: 30 de octubre de 2025*
