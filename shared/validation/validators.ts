// Clase de validación reutilizable

import { ValidationError, ValidationResult } from '../types';

export class Validator {
  private errors: ValidationError[] = [];

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

  min(value: number, min: number, field: string): this {
    if (value !== undefined && value !== null && value < min) {
      this.errors.push({
        field,
        message: `${field} debe ser al menos ${min}`,
        value,
      });
    }
    return this;
  }

  max(value: number, max: number, field: string): this {
    if (value !== undefined && value !== null && value > max) {
      this.errors.push({
        field,
        message: `${field} no puede ser mayor a ${max}`,
        value,
      });
    }
    return this;
  }

  pattern(value: string, pattern: RegExp, field: string, customMessage?: string): this {
    if (value && !pattern.test(value)) {
      this.errors.push({
        field,
        message: customMessage || `${field} tiene un formato inválido`,
        value,
      });
    }
    return this;
  }

  password(value: string, field: string = 'password'): this {
    this.required(value, field);
    this.minLength(value, 8, field);

    if (value) {
      if (!/[A-Z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra mayúscula`,
          value,
        });
      }

      if (!/[a-z]/.test(value)) {
        this.errors.push({
          field,
          message: `${field} debe contener al menos una letra minúscula`,
          value,
        });
      }

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

  custom(validator: (value: any) => boolean, value: any, field: string, message: string): this {
    if (!validator(value)) {
      this.errors.push({
        field,
        message,
        value,
      });
    }
    return this;
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  reset(): void {
    this.errors = [];
  }
}
