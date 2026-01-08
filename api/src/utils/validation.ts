/**
 * Utilidades de validación para el backend
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida un email
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email || typeof email !== 'string') {
    return { field: 'email', message: 'El correo electrónico es requerido' };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { field: 'email', message: 'El correo electrónico es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { field: 'email', message: 'El formato del correo no es válido' };
  }

  if (trimmedEmail.length > 100) {
    return { field: 'email', message: 'El correo es demasiado largo' };
  }

  return null;
}

/**
 * Valida una contraseña
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password || typeof password !== 'string') {
    return { field: 'password', message: 'La contraseña es requerida' };
  }

  if (password.length < 6) {
    return { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' };
  }

  if (password.length > 128) {
    return { field: 'password', message: 'La contraseña es demasiado larga' };
  }

  if (password.trim().length === 0) {
    return { field: 'password', message: 'La contraseña no puede contener solo espacios' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter && !hasNumber) {
    return { field: 'password', message: 'La contraseña debe contener letras o números' };
  }

  return null;
}

/**
 * Valida un nombre completo
 */
export function validateFullName(name: string): ValidationError | null {
  if (!name || typeof name !== 'string') {
    return { field: 'name', message: 'El nombre es requerido' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    return { field: 'name', message: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (trimmedName.length > 100) {
    return { field: 'name', message: 'El nombre es demasiado largo' };
  }

  const words = trimmedName.split(/\s+/);
  if (words.length < 2) {
    return { field: 'name', message: 'Ingresa tu nombre completo (nombre y apellido)' };
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { field: 'name', message: 'El nombre solo puede contener letras' };
  }

  return null;
}

/**
 * Valida un número de teléfono
 */
export function validatePhone(phone: string): ValidationError | null {
  if (!phone || typeof phone !== 'string') {
    return { field: 'phone', message: 'El teléfono es requerido' };
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  const phoneRegex = /^(\+58|0)?4\d{9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { field: 'phone', message: 'Formato de teléfono inválido. Ej: 0412-000-0000' };
  }

  return null;
}

/**
 * Valida un campo requerido
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return { field: fieldName, message: `${fieldName} es requerido` };
  }
  return null;
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remover caracteres de control y no imprimibles
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remover múltiples espacios
    .replace(/\s+/g, ' ')
    // Escapar caracteres HTML básicos para prevenir XSS
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Valida los datos de registro de un rider
 */
export function validateRiderRegistration(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  // Password
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  // Name (opcional pero si existe validarlo)
  if (data.name) {
    const nameError = validateFullName(data.name);
    if (nameError) errors.push(nameError);
  }

  // Phone (opcional pero si existe validarlo)
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.push(phoneError);
  }

  // Special discount
  if (data.specialDiscount) {
    const validDiscounts = ['none', 'student', 'disabled', 'senior'];
    if (!validDiscounts.includes(data.specialDiscount)) {
      errors.push({ field: 'specialDiscount', message: 'Tipo de descuento inválido' });
    }
  }

  return errors;
}

/**
 * Valida los datos de registro de un driver
 */
export function validateDriverRegistration(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  // Password
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  // Name
  const nameError = validateFullName(data.name);
  if (nameError) errors.push(nameError);

  // Phone
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.push(phoneError);

  // License number
  const licenseError = validateRequired(data.licenseNumber, 'licenseNumber');
  if (licenseError) errors.push(licenseError);

  // Vehicle plate
  const plateError = validateRequired(data.vehiclePlate, 'vehiclePlate');
  if (plateError) errors.push(plateError);

  // Vehicle model
  const modelError = validateRequired(data.vehicleModel, 'vehicleModel');
  if (modelError) errors.push(modelError);

  return errors;
}

/**
 * Valida los datos de login
 */
export function validateLoginData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  return errors;
}

/**
 * Valida los datos de registro de un admin
 */
export function validateAdminRegistration(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  // Password
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  // Name
  const nameError = validateFullName(data.name);
  if (nameError) errors.push(nameError);

  // Phone
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.push(phoneError);

  // Department (opcional)
  // No validation needed for department as it's optional

  return errors;
}
