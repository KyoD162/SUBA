/**
 * Utilidades de validación para formularios
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida un email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'El correo electrónico es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El formato del correo no es válido' };
  }

  // Validar longitud razonable
  if (email.length > 100) {
    return { isValid: false, error: 'El correo es demasiado largo' };
  }

  return { isValid: true };
}

/**
 * Valida una contraseña
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'La contraseña es requerida' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'La contraseña es demasiado larga' };
  }

  // Validar que no sea solo espacios
  if (password.trim().length === 0) {
    return { isValid: false, error: 'La contraseña no puede contener solo espacios' };
  }

  // Validación de seguridad básica (opcional pero recomendado)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter && !hasNumber) {
    return { isValid: false, error: 'La contraseña debe contener letras o números' };
  }

  return { isValid: true };
}

/**
 * Valida que dos contraseñas coincidan
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Confirma tu contraseña' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }

  return { isValid: true };
}

/**
 * Valida un nombre completo
 */
export function validateFullName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'El nombre es requerido' };
  }

  if (name.trim().length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'El nombre es demasiado largo' };
  }

  // Validar que contenga al menos dos palabras (nombre y apellido)
  const words = name.trim().split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, error: 'Ingresa tu nombre completo (nombre y apellido)' };
  }

  // Validar que solo contenga letras, espacios, acentos y guiones
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'El nombre solo puede contener letras' };
  }

  return { isValid: true };
}

/**
 * Valida un número de teléfono venezolano
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'El teléfono es requerido' };
  }

  // Remover espacios, guiones y paréntesis para validación
  const cleanPhone = phone.replace(/[\s\-()]/g, '').replace(/^\+/, '');

  // Formato venezolano: +58XXXXXXXXXX o 0XXXXXXXXXX
  const phoneRegex = /^(58|\+?58|0)?4\d{9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Formato inválido. Ej: 0412-000-0000' };
  }

  return { isValid: true };
}

/**
 * Valida una cédula venezolana
 */
export function validateCedula(cedula: string): ValidationResult {
  if (!cedula || cedula.trim() === '') {
    return { isValid: false, error: 'La cédula es requerida' };
  }

  // Remover V-, E-, espacios, puntos
  const cleanCedula = cedula.replace(/[VvEe\-.\s]/g, '');

  // Debe ser solo números
  if (!/^\d+$/.test(cleanCedula)) {
    return { isValid: false, error: 'La cédula solo puede contener números' };
  }

  // Validar rango razonable (5 a 8 dígitos)
  if (cleanCedula.length < 5 || cleanCedula.length > 8) {
    return { isValid: false, error: 'La cédula debe tener entre 5 y 8 dígitos' };
  }

  return { isValid: true };
}

/**
 * Valida edad
 */
export function validateAge(age: string): ValidationResult {
  if (!age || age.trim() === '') {
    return { isValid: false, error: 'La edad es requerida' };
  }

  const ageNum = parseInt(age, 10);

  if (isNaN(ageNum)) {
    return { isValid: false, error: 'La edad debe ser un número' };
  }

  if (ageNum < 18) {
    return { isValid: false, error: 'Debes ser mayor de 18 años' };
  }

  if (ageNum > 120) {
    return { isValid: false, error: 'Edad no válida' };
  }

  return { isValid: true };
}

/**
 * Valida campos requeridos genéricos
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  return { isValid: true };
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    // Remover caracteres de control y no imprimibles
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remover múltiples espacios
    .replace(/\s+/g, ' ');
}
