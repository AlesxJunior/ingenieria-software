// Reglas de validación reutilizables

import type { ValidationResult } from '../types';
import { Validator } from './validators';

export const validatePassword = (password: string): ValidationResult => {
  const validator = new Validator();
  validator.password(password, 'Contraseña');
  return validator.getResult();
};

export const validateEmail = (email: string): ValidationResult => {
  const validator = new Validator();
  validator.required(email, 'Email').email(email, 'Email');
  return validator.getResult();
};

export const validateUsername = (username: string): ValidationResult => {
  const validator = new Validator();
  validator
    .required(username, 'Nombre de usuario')
    .minLength(username, 3, 'Nombre de usuario')
    .maxLength(username, 50, 'Nombre de usuario');
  return validator.getResult();
};

export const validateProductCode = (code: string): ValidationResult => {
  const validator = new Validator();
  validator
    .required(code, 'Código de producto')
    .minLength(code, 2, 'Código de producto')
    .maxLength(code, 50, 'Código de producto')
    .pattern(code, /^[A-Z0-9-]+$/, 'Código de producto', 'El código solo puede contener letras mayúsculas, números y guiones');
  return validator.getResult();
};

export const validatePrice = (price: number): ValidationResult => {
  const validator = new Validator();
  validator
    .required(price, 'Precio')
    .min(price, 0.01, 'Precio')
    .custom(
      (val) => Number.isFinite(val) && val > 0,
      price,
      'Precio',
      'El precio debe ser un número válido mayor a 0'
    );
  return validator.getResult();
};

export const validateQuantity = (quantity: number): ValidationResult => {
  const validator = new Validator();
  validator
    .required(quantity, 'Cantidad')
    .min(quantity, 1, 'Cantidad')
    .custom(
      (val) => Number.isInteger(val),
      quantity,
      'Cantidad',
      'La cantidad debe ser un número entero'
    );
  return validator.getResult();
};

export const validateRUC = (ruc: string): ValidationResult => {
  const validator = new Validator();
  validator
    .required(ruc, 'RUC')
    .pattern(ruc, /^\d{11}$/, 'RUC', 'El RUC debe tener 11 dígitos');
  return validator.getResult();
};

export const validateDNI = (dni: string): ValidationResult => {
  const validator = new Validator();
  validator
    .required(dni, 'DNI')
    .pattern(dni, /^\d{8}$/, 'DNI', 'El DNI debe tener 8 dígitos');
  return validator.getResult();
};

export const validatePhone = (phone: string): ValidationResult => {
  const validator = new Validator();
  validator
    .required(phone, 'Teléfono')
    .pattern(phone, /^[0-9]{7,15}$/, 'Teléfono', 'El teléfono debe tener entre 7 y 15 dígitos');
  return validator.getResult();
};
