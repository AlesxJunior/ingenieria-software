export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class Validator {
  private errors: ValidationError[] = [];

  // Validaciones básicas
  required(value: any, field: string): this {
    if (value === undefined || value === null || value === '') {
      this.errors.push({
        field,
        message: `${field} es requerido`
      });
    }
    return this;
  }

  email(value: string, field: string): this {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors.push({
        field,
        message: `${field} debe ser un email válido`
      });
    }
    return this;
  }

  minLength(value: string, minLength: number, field: string): this {
    if (value && value.length < minLength) {
      this.errors.push({
        field,
        message: `${field} debe tener al menos ${minLength} caracteres`
      });
    }
    return this;
  }

  maxLength(value: string, maxLength: number, field: string): this {
    if (value && value.length > maxLength) {
      this.errors.push({
        field,
        message: `${field} no puede tener más de ${maxLength} caracteres`
      });
    }
    return this;
  }

  pattern(value: string, pattern: RegExp, field: string, message?: string): this {
    if (value && !pattern.test(value)) {
      this.errors.push({
        field,
        message: message || `${field} no tiene el formato correcto`
      });
    }
    return this;
  }

  // Validación robusta de contraseña (igual que el backend)
  password(value: string, field: string = 'password'): this {
    this.required(value, field);
    this.minLength(value, 8, field);
    
    if (value) {
      // Al menos una mayúscula
      if (!/[A-Z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra mayúscula`
        });
      }
      
      // Al menos una minúscula
      if (!/[a-z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra minúscula`
        });
      }
      
      // Al menos un número
      if (!/\d/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos un número`
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
      `${field} solo puede contener letras, números, guiones y guiones bajos`
    );
    return this;
  }

  confirmPassword(password: string, confirmPassword: string): this {
    if (password !== confirmPassword) {
      this.errors.push({
        field: 'confirmPassword',
        message: 'Las contraseñas no coinciden'
      });
    }
    return this;
  }

  // Obtener resultado
  getResult(): ValidationResult {
    const result = {
      isValid: this.errors.length === 0,
      errors: [...this.errors]
    };
    
    // Limpiar errores para próxima validación
    this.errors = [];
    
    return result;
  }
}

// Funciones de utilidad para validaciones comunes
export const validatePassword = (password: string): ValidationResult => {
  return new Validator()
    .password(password, 'Contraseña')
    .getResult();
};

export const validatePasswordWithConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  return new Validator()
    .password(password, 'Contraseña')
    .required(confirmPassword, 'Confirmar contraseña')
    .confirmPassword(password, confirmPassword)
    .getResult();
};

export const validateEmail = (email: string): ValidationResult => {
  return new Validator()
    .required(email, 'Email')
    .email(email, 'Email')
    .getResult();
};

export const validateUsername = (username: string): ValidationResult => {
  return new Validator()
    .username(username, 'Nombre de usuario')
    .getResult();
};

// Función para obtener los requisitos de contraseña como texto
export const getPasswordRequirements = (): string[] => {
  return [
    'Mínimo 8 caracteres',
    'Al menos una letra mayúscula',
    'Al menos una letra minúscula',
    'Al menos un número'
  ];
};

// Función para verificar qué requisitos cumple una contraseña
export const checkPasswordRequirements = (password: string): { [key: string]: boolean } => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password)
  };
};