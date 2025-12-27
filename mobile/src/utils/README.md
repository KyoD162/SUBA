# Utilidades de Validación

Este directorio contiene utilidades para validación de formularios en la aplicación SUBA.

## Módulos

### `validation.ts`

Funciones de validación para inputs de formularios con mensajes de error en español.

#### Funciones disponibles:

##### `validateEmail(email: string): ValidationResult`
Valida formato de correo electrónico.
- ✅ Formato válido: `usuario@dominio.com`
- ❌ Rechaza emails sin @ o dominio
- ❌ Rechaza emails > 100 caracteres

##### `validatePassword(password: string): ValidationResult`
Valida contraseñas seguras.
- ✅ Mínimo 6 caracteres
- ✅ Máximo 128 caracteres
- ✅ Debe contener letras o números
- ❌ Rechaza contraseñas vacías o solo espacios

##### `validatePasswordMatch(password: string, confirmPassword: string): ValidationResult`
Verifica que dos contraseñas coincidan.

##### `validateFullName(name: string): ValidationResult`
Valida nombre completo (nombre y apellido).
- ✅ Mínimo 3 caracteres
- ✅ Debe contener al menos 2 palabras (nombre y apellido)
- ✅ Solo letras, espacios, acentos, guiones
- ❌ Rechaza números o caracteres especiales

##### `validatePhone(phone: string): ValidationResult`
Valida números telefónicos venezolanos.
- ✅ Formato: `0412-000-0000` o `+584120000000`
- ✅ Acepta formato con/sin espacios, guiones, paréntesis
- ✅ Validación de prefijos venezolanos (04XX)

##### `validateCedula(cedula: string): ValidationResult`
Valida cédula de identidad venezolana.
- ✅ Formato: `V-12345678` o `12345678`
- ✅ Entre 5 y 8 dígitos
- ✅ Acepta prefijos V- o E-

##### `validateAge(age: string): ValidationResult`
Valida edad del usuario.
- ✅ Debe ser número entre 18 y 120 años
- ❌ Rechaza menores de edad

##### `validateRequired(value: string, fieldName: string): ValidationResult`
Validación genérica para campos requeridos.

##### `sanitizeInput(input: string): string`
Limpia y sanitiza strings de entrada:
- Elimina espacios al inicio/final
- Elimina caracteres de control
- Normaliza espacios múltiples

## Uso en Formularios

### Ejemplo en LoginScreen:

```tsx
import { validateEmail, validatePassword } from '../../utils/validation'

const handleLogin = () => {
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    setEmailError(emailValidation.error || "")
    return
  }
  
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    setPasswordError(passwordValidation.error || "")
    return
  }
  
  // Continuar con login...
}
```

### Ejemplo en RegisterScreen:

```tsx
import { validateFullName, validatePhone, sanitizeInput } from '../../utils/validation'

const handleSubmit = () => {
  // Validar
  const nameValidation = validateFullName(fullName)
  if (!nameValidation.isValid) {
    setError(nameValidation.error)
    return
  }
  
  // Sanitizar antes de enviar
  const sanitizedName = sanitizeInput(fullName)
  await authService.register({ name: sanitizedName, ... })
}
```

## Tipos

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

## Características

✅ **Mensajes en español** adaptados al contexto venezolano
✅ **Validaciones específicas** para datos venezolanos (cédula, teléfono)
✅ **Sanitización automática** de inputs
✅ **Type-safe** con TypeScript
✅ **Reutilizable** en toda la aplicación

## Próximas mejoras

- [ ] Validación de placas de vehículos
- [ ] Validación de licencias de conducir
- [ ] Validación de direcciones venezolanas
- [ ] Tests unitarios con Jest
