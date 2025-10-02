import { ValidationError, ValidationResult } from '../types';

export class Validator {
  private errors: ValidationError[] = [];

  // Validaciones básicas
  required(value: any, field: string): this {
    if (value === undefined || value === null || value === '') {
      this.errors.push({
        field,
        message: `${field} es requerido`,
        value
      });
    }
    return this;
  }

  email(value: string, field: string): this {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors.push({
        field,
        message: `${field} debe ser un email válido`,
        value
      });
    }
    return this;
  }

  minLength(value: string, minLength: number, field: string): this {
    if (value && value.length < minLength) {
      this.errors.push({
        field,
        message: `${field} debe tener al menos ${minLength} caracteres`,
        value
      });
    }
    return this;
  }

  maxLength(value: string, maxLength: number, field: string): this {
    if (value && value.length > maxLength) {
      this.errors.push({
        field,
        message: `${field} no puede tener más de ${maxLength} caracteres`,
        value
      });
    }
    return this;
  }

  pattern(value: string, pattern: RegExp, field: string, message?: string): this {
    if (value && !pattern.test(value)) {
      this.errors.push({
        field,
        message: message || `${field} no tiene el formato correcto`,
        value
      });
    }
    return this;
  }

  oneOf(value: any, allowedValues: any[], field: string): this {
    if (value && !allowedValues.includes(value)) {
      this.errors.push({
        field,
        message: `${field} debe ser uno de: ${allowedValues.join(', ')}`,
        value
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
          value
        });
      }
      
      // Al menos una minúscula
      if (!/[a-z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra minúscula`,
          value
        });
      }
      
      // Al menos un número
      if (!/\d/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos un número`,
          value
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
        message: 'Las contraseñas no coinciden',
        value: confirmPassword
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
  return new Validator()
    .required(data.isActive, 'isActive')
    .getResult();
};

export default Validator;