import { ValidationError, ValidationResult } from '../types';

export class Validator {
  private errors: ValidationError[] = [];

  // Validaciones básicas
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

  pattern(
    value: string,
    pattern: RegExp,
    field: string,
    message?: string,
  ): this {
    if (value && !pattern.test(value)) {
      this.errors.push({
        field,
        message: message || `${field} no tiene el formato correcto`,
        value,
      });
    }
    return this;
  }

  oneOf(value: any, allowedValues: any[], field: string): this {
    if (value && !allowedValues.includes(value)) {
      this.errors.push({
        field,
        message: `${field} debe ser uno de: ${allowedValues.join(', ')}`,
        value,
      });
    }
    return this;
  }

  // Validaciones específicas
  password(value: string, field: string = 'password'): this {
    this.required(value, field);
    this.minLength(value, 8, field);

    if (value) {
      // Al menos una mayúscula
      if (!/[A-Z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra mayúscula`,
          value,
        });
      }

      // Al menos una minúscula
      if (!/[a-z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra minúscula`,
          value,
        });
      }

      // Al menos un número
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

  username(value: string, field: string = 'username'): this {
    this.required(value, field);
    this.minLength(value, 3, field);
    this.maxLength(value, 30, field);
    this.pattern(
      value,
      /^[a-zA-Z0-9_-]+$/,
      field,
      `${field} solo puede contener letras, números, guiones y guiones bajos`,
    );
    return this;
  }

  confirmPassword(password: string, confirmPassword: string): this {
    if (password !== confirmPassword) {
      this.errors.push({
        field: 'confirmPassword',
        message: 'Las contraseñas no coinciden',
        value: confirmPassword,
      });
    }
    return this;
  }

  // Obtener resultado
  getResult(): ValidationResult {
    const result = {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
    };

    // Limpiar errores para próxima validación
    this.errors = [];

    return result;
  }
}

// Funciones de utilidad para validaciones comunes
export const validateLoginRequest = (data: any): ValidationResult => {
  return new Validator()
    .required(data.email, 'email')
    .email(data.email, 'email')
    .required(data.password, 'password')
    .getResult();
};

export const validateRegisterRequest = (data: any): ValidationResult => {
  return new Validator()
    .username(data.username)
    .required(data.email, 'email')
    .email(data.email, 'email')
    .password(data.password)
    .required(data.confirmPassword, 'confirmPassword')
    .confirmPassword(data.password, data.confirmPassword)
    .getResult();
};

export const validateUserUpdate = (data: any): ValidationResult => {
  const validator = new Validator();

  if (data.username !== undefined) {
    validator.username(data.username);
  }

  if (data.email !== undefined) {
    validator.required(data.email, 'email').email(data.email, 'email');
  }

  if (data.password !== undefined) {
    validator.password(data.password);
  }

  if (data.firstName !== undefined) {
    validator.maxLength(data.firstName, 50, 'firstName');
  }

  if (data.lastName !== undefined) {
    validator.maxLength(data.lastName, 50, 'lastName');
  }

  return validator.getResult();
};

export const validateUserCreate = (data: any): ValidationResult => {
  const validator = new Validator();

  validator
    .username(data.username)
    .required(data.email, 'email')
    .email(data.email, 'email')
    .password(data.password);

  if (data.firstName !== undefined) {
    validator.maxLength(data.firstName, 50, 'firstName');
  }

  if (data.lastName !== undefined) {
    validator.maxLength(data.lastName, 50, 'lastName');
  }

  return validator.getResult();
};

export const validateUserStatusUpdate = (data: any): ValidationResult => {
  return new Validator().required(data.isActive, 'isActive').getResult();
};

export default Validator;

// Validaciones de Productos
export const validateProductCreate = (data: any): ValidationResult => {
  const validator = new Validator();

  validator
    .required(data.codigo, 'codigo')
    .required(data.nombre, 'nombre')
    .required(data.categoria, 'categoria')
    .required(data.precioVenta, 'precioVenta')
    .required(data.unidadMedida, 'unidadMedida');

  if (data.descripcion !== undefined) {
    validator.maxLength(data.descripcion, 500, 'descripcion');
  }

  if (data.ubicacion !== undefined) {
    validator.maxLength(data.ubicacion, 200, 'ubicacion');
  }

  // Validaciones numéricas básicas
  if (data.precioVenta !== undefined) {
    const precio = Number(data.precioVenta);
    if (isNaN(precio) || precio <= 0) {
      (validator as any).errors.push({
        field: 'precioVenta',
        message: 'precioVenta debe ser un número mayor a 0',
        value: data.precioVenta,
      });
    }
  }

  if (data.stock !== undefined) {
    const stock = Number(data.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      (validator as any).errors.push({
        field: 'stock',
        message: 'stock debe ser un entero no negativo',
        value: data.stock,
      });
    }
  }

  if (data.estado !== undefined && typeof data.estado !== 'boolean') {
    (validator as any).errors.push({
      field: 'estado',
      message: 'estado debe ser booleano',
      value: data.estado,
    });
  }

  return validator.getResult();
};

export const validateProductUpdate = (data: any): ValidationResult => {
  const validator = new Validator();

  if (data.nombre !== undefined) {
    validator.required(data.nombre, 'nombre');
  }
  if (data.categoria !== undefined) {
    validator.required(data.categoria, 'categoria');
  }
  if (data.unidadMedida !== undefined) {
    validator.required(data.unidadMedida, 'unidadMedida');
  }
  if (data.descripcion !== undefined) {
    validator.maxLength(data.descripcion, 500, 'descripcion');
  }
  if (data.ubicacion !== undefined) {
    validator.maxLength(data.ubicacion, 200, 'ubicacion');
  }

  if (data.precioVenta !== undefined) {
    const precio = Number(data.precioVenta);
    if (isNaN(precio) || precio <= 0) {
      (validator as any).errors.push({
        field: 'precioVenta',
        message: 'precioVenta debe ser un número mayor a 0',
        value: data.precioVenta,
      });
    }
  }

  if (data.stock !== undefined) {
    const stock = Number(data.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      (validator as any).errors.push({
        field: 'stock',
        message: 'stock debe ser un entero no negativo',
        value: data.stock,
      });
    }
  }

  if (data.estado !== undefined && typeof data.estado !== 'boolean') {
    (validator as any).errors.push({
      field: 'estado',
      message: 'estado debe ser booleano',
      value: data.estado,
    });
  }

  return validator.getResult();
};

export const validateProductStatusUpdate = (data: any): ValidationResult => {
  return new Validator().required(data.estado, 'estado').getResult();
};

// Validación de filtros de consulta para productos
export const validateProductQueryFilters = (query: any): ValidationResult => {
  const validator = new Validator();

  const toNumber = (val: any) =>
    val !== undefined && val !== null ? Number(val) : undefined;
  const minPrecio = toNumber(query.minPrecio);
  const maxPrecio = toNumber(query.maxPrecio);
  const minStock = toNumber(query.minStock);
  const maxStock = toNumber(query.maxStock);

  if (query.estado !== undefined) {
    const val = query.estado;
    const isBoolString =
      typeof val === 'string' && ['true', 'false'].includes(val.toLowerCase());
    const isBool = typeof val === 'boolean';
    if (!isBool && !isBoolString) {
      (validator as any).errors.push({
        field: 'estado',
        message: 'estado debe ser booleano (true/false)',
        value: val,
      });
    }
  }

  if (query.minPrecio !== undefined) {
    if (isNaN(minPrecio as number) || (minPrecio as number) < 0) {
      (validator as any).errors.push({
        field: 'minPrecio',
        message: 'minPrecio debe ser número >= 0',
        value: query.minPrecio,
      });
    }
  }
  if (query.maxPrecio !== undefined) {
    if (isNaN(maxPrecio as number) || (maxPrecio as number) < 0) {
      (validator as any).errors.push({
        field: 'maxPrecio',
        message: 'maxPrecio debe ser número >= 0',
        value: query.maxPrecio,
      });
    }
  }
  if (
    minPrecio !== undefined &&
    maxPrecio !== undefined &&
    (minPrecio as number) > (maxPrecio as number)
  ) {
    (validator as any).errors.push({
      field: 'precioVenta',
      message: 'minPrecio no puede ser mayor que maxPrecio',
      value: [minPrecio, maxPrecio],
    });
  }

  if (query.minStock !== undefined) {
    if (!Number.isInteger(minStock) || (minStock as number) < 0) {
      (validator as any).errors.push({
        field: 'minStock',
        message: 'minStock debe ser entero >= 0',
        value: query.minStock,
      });
    }
  }
  if (query.maxStock !== undefined) {
    if (!Number.isInteger(maxStock) || (maxStock as number) < 0) {
      (validator as any).errors.push({
        field: 'maxStock',
        message: 'maxStock debe ser entero >= 0',
        value: query.maxStock,
      });
    }
  }
  if (
    minStock !== undefined &&
    maxStock !== undefined &&
    (minStock as number) > (maxStock as number)
  ) {
    (validator as any).errors.push({
      field: 'stock',
      message: 'minStock no puede ser mayor que maxStock',
      value: [minStock, maxStock],
    });
  }

  if (query.categoria !== undefined) {
    validator.maxLength(query.categoria, 100, 'categoria');
  }
  if (query.unidadMedida !== undefined) {
    validator.maxLength(query.unidadMedida, 50, 'unidadMedida');
  }
  if (query.ubicacion !== undefined) {
    validator.maxLength(query.ubicacion, 200, 'ubicacion');
  }
  if (query.q !== undefined) {
    validator.maxLength(query.q, 200, 'q');
  }

  return validator.getResult();
};

// Validaciones de Compras
export const validatePurchaseCreate = (data: any): ValidationResult => {
  const validator = new Validator();

  validator
    .required(data.proveedorId, 'proveedorId')
    .required(data.almacenId, 'almacenId')
    .required(data.fechaEmision, 'fechaEmision');

  if (data.tipoComprobante !== undefined) {
    validator.maxLength(data.tipoComprobante, 50, 'tipoComprobante');
  }
  if (data.formaPago !== undefined) {
    validator.maxLength(data.formaPago, 50, 'formaPago');
  }
  if (data.observaciones !== undefined) {
    validator.maxLength(data.observaciones, 500, 'observaciones');
  }

  // Items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    (validator as any).errors.push({
      field: 'items',
      message: 'Debe incluir al menos un item de compra',
      value: data.items,
    });
  } else {
    data.items.forEach((item: any, idx: number) => {
      const prefix = `items[${idx}]`;
      new Validator()
        .required(item.productoId, `${prefix}.productoId`)
        .required(item.cantidad, `${prefix}.cantidad`)
        .required(item.precioUnitario, `${prefix}.precioUnitario`);

      const cantidad = Number(item.cantidad);
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        (validator as any).errors.push({
          field: `${prefix}.cantidad`,
          message: 'cantidad debe ser un número mayor a 0',
          value: item.cantidad,
        });
      }
      const precio = Number(item.precioUnitario);
      if (!Number.isFinite(precio) || precio <= 0) {
        (validator as any).errors.push({
          field: `${prefix}.precioUnitario`,
          message: 'precioUnitario debe ser un número mayor a 0',
          value: item.precioUnitario,
        });
      }
      if (item.nombreProducto !== undefined) {
        validator.maxLength(
          item.nombreProducto,
          200,
          `${prefix}.nombreProducto`,
        );
      }
    });
  }

  return validator.getResult();
};

export const validatePurchaseUpdate = (data: any): ValidationResult => {
  const validator = new Validator();

  if (data.proveedorId !== undefined) {
    validator.required(data.proveedorId, 'proveedorId');
  }
  if (data.almacenId !== undefined) {
    validator.required(data.almacenId, 'almacenId');
  }
  if (data.fechaEmision !== undefined) {
    validator.required(data.fechaEmision, 'fechaEmision');
  }
  if (data.tipoComprobante !== undefined) {
    validator.maxLength(data.tipoComprobante, 50, 'tipoComprobante');
  }
  if (data.formaPago !== undefined) {
    validator.maxLength(data.formaPago, 50, 'formaPago');
  }
  if (data.observaciones !== undefined) {
    validator.maxLength(data.observaciones, 500, 'observaciones');
  }

  if (data.items !== undefined) {
    if (!Array.isArray(data.items) || data.items.length === 0) {
      (validator as any).errors.push({
        field: 'items',
        message: 'items debe tener al menos un elemento',
        value: data.items,
      });
    } else {
      data.items.forEach((item: any, idx: number) => {
        const prefix = `items[${idx}]`;
        if (item.productoId !== undefined) {
          validator.required(item.productoId, `${prefix}.productoId`);
        }
        if (item.cantidad !== undefined) {
          const cantidad = Number(item.cantidad);
          if (!Number.isFinite(cantidad) || cantidad <= 0) {
            (validator as any).errors.push({
              field: `${prefix}.cantidad`,
              message: 'cantidad debe ser > 0',
              value: item.cantidad,
            });
          }
        }
        if (item.precioUnitario !== undefined) {
          const precio = Number(item.precioUnitario);
          if (!Number.isFinite(precio) || precio <= 0) {
            (validator as any).errors.push({
              field: `${prefix}.precioUnitario`,
              message: 'precioUnitario debe ser > 0',
              value: item.precioUnitario,
            });
          }
        }
        if (item.nombreProducto !== undefined) {
          validator.maxLength(
            item.nombreProducto,
            200,
            `${prefix}.nombreProducto`,
          );
        }
      });
    }
  }

  return validator.getResult();
};

export const validatePurchaseStatusUpdate = (data: any): ValidationResult => {
  return new Validator()
    .required(data.estado, 'estado')
    .oneOf(data.estado, ['Pendiente', 'Recibida', 'Cancelada'], 'estado')
    .getResult();
};

export const validatePurchaseQueryFilters = (query: any): ValidationResult => {
  const validator = new Validator();

  if (query.estado !== undefined) {
    validator.oneOf(
      query.estado,
      ['Pendiente', 'Recibida', 'Cancelada'],
      'estado',
    );
  }
  if (query.fechaInicio !== undefined) {
    validator.required(query.fechaInicio, 'fechaInicio');
  }
  if (query.fechaFin !== undefined) {
    validator.required(query.fechaFin, 'fechaFin');
  }
  if (query.q !== undefined) {
    validator.maxLength(query.q, 200, 'q');
  }
  if (query.proveedorId !== undefined) {
    validator.maxLength(query.proveedorId, 100, 'proveedorId');
  }
  if (query.almacenId !== undefined) {
    validator.maxLength(query.almacenId, 100, 'almacenId');
  }

  return validator.getResult();
};