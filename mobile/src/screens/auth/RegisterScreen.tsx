"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Animated, Easing, LayoutAnimation, Platform, UIManager } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { useAuth } from "../../navigation/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { authService } from "../../services/auth"
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateFullName, 
  validatePhone, 
  validateCedula, 
  validateAge,
  sanitizeInput 
} from "../../utils/validation"

const totalSteps = 4

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function RegisterScreen() {
  const navigation = useNavigation()
  const { signIn } = useAuth()
  const insets = useSafeAreaInsets()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [cedula, setCedula] = useState("")
  const [edad, setEdad] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [specialDiscount, setSpecialDiscount] = useState<'none' | 'student' | 'disabled' | 'senior'>('none')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Document verification (simulated)
  const [docFront, setDocFront] = useState(false)
  const [docBack, setDocBack] = useState(false)
  const [docSelfie, setDocSelfie] = useState(false)
  
  // Estados de error para validación
  const [errors, setErrors] = useState({
    fullName: '',
    cedula: '',
    edad: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Validación del paso actual con feedback visual
  const validateCurrentStep = (): boolean => {
    let isValid = true
    const newErrors = { ...errors }

    if (step === 1) {
      // Validar nombre completo
      const nameValidation = validateFullName(fullName)
      if (!nameValidation.isValid) {
        newErrors.fullName = nameValidation.error || ''
        isValid = false
      } else {
        newErrors.fullName = ''
      }
      
      // Validar cédula (opcional pero si tiene valor, validarlo)
      if (cedula.trim()) {
        const cedulaValidation = validateCedula(cedula)
        if (!cedulaValidation.isValid) {
          newErrors.cedula = cedulaValidation.error || ''
          isValid = false
        } else {
          newErrors.cedula = ''
        }
      }
      
      // Validar edad (opcional pero si tiene valor, validarlo)
      if (edad.trim()) {
        const ageValidation = validateAge(edad)
        if (!ageValidation.isValid) {
          newErrors.edad = ageValidation.error || ''
          isValid = false
        } else {
          newErrors.edad = ''
        }
      }
    }
    
    if (step === 2) {
      // Validar teléfono
      const phoneValidation = validatePhone(telefono)
      if (!phoneValidation.isValid) {
        newErrors.telefono = phoneValidation.error || ''
        isValid = false
      } else {
        newErrors.telefono = ''
      }
      
      // Validar email
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || ''
        isValid = false
      } else {
        newErrors.email = ''
      }
    }
    
    if (step === 3) {
      // Validar contraseña
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error || ''
        isValid = false
      } else {
        newErrors.password = ''
      }
      
      // Validar coincidencia
      const matchValidation = validatePasswordMatch(password, confirmPassword)
      if (!matchValidation.isValid) {
        newErrors.confirmPassword = matchValidation.error || ''
        isValid = false
      } else {
        newErrors.confirmPassword = ''
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Validaciones suavizadas para no bloquear el avance entre pasos (MVP)
  const canNext = useMemo(() => {
    if (step === 1) return fullName.trim().length > 2 // cédula/edad opcional por ahora
    if (step === 2) return email.includes("@") // teléfono opcional por ahora
    if (step === 3) return password.length >= 6 && password === confirmPassword
    if (step === 4) return docFront && docBack && docSelfie
    return true
  }, [step, fullName, email, password, confirmPassword, docFront, docBack, docSelfie])

  const nextStep = () => {
    // Validar antes de avanzar
    if (!validateCurrentStep()) {
      return
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setStep((s) => Math.min(totalSteps, s + 1))
  }

  const prevStep = () => {
    // Limpiar errores al retroceder
    setErrors({
      fullName: '',
      cedula: '',
      edad: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setStep((s) => Math.max(1, s - 1))
  }

  const submit = async () => {
    // Validación final
    if (!validateCurrentStep()) {
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.registerRider({
        email: sanitizeInput(email.toLowerCase()),
        password,
        name: sanitizeInput(fullName),
        phone: sanitizeInput(telefono),
        specialDiscount
      });
      // response contains { token, refreshToken, user: { id, email, role, name } }
      await signIn(response.token, response.refreshToken, response.user);
    } catch (error: any) {
      alert(error.message || 'Error al registrar');
    } finally {
      setLoading(false)
    }
  }
  
  // Handlers para limpiar errores mientras se escribe
  const handleFullNameChange = (text: string) => {
    setFullName(text)
    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }))
  }
  
  const handleCedulaChange = (text: string) => {
    setCedula(text)
    if (errors.cedula) setErrors(prev => ({ ...prev, cedula: '' }))
  }
  
  const handleEdadChange = (text: string) => {
    setEdad(text)
    if (errors.edad) setErrors(prev => ({ ...prev, edad: '' }))
  }
  
  const handleTelefonoChange = (text: string) => {
    setTelefono(text)
    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: '' }))
  }
  
  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
  }
  
  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
  }
  
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text)
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
  }

  const progressAnim = useRef(new Animated.Value(1 / totalSteps)).current
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step / totalSteps,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [step])

  const StepIndicator = () => (
    <View style={styles.stepperContainer}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              transform: [{ scaleX: progressAnim }],
            },
          ]}
        />
      </View>
      <View style={styles.stepDotsRow}>
        {new Array(totalSteps).fill(0).map((_, idx) => {
          const n = idx + 1
          const active = n === step
          const completed = n < step
          return (
            <View key={n} style={[styles.stepDot, active && styles.stepDotActive, completed && styles.stepDotCompleted]}>
              {completed ? (
                <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
              ) : (
                <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{n}</Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => (step === 1 ? navigation.goBack() : prevStep())}>
        <Ionicons name="chevron-back-outline" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Crear cuenta</Text>
      <View style={{ width: 24 }} />
    </View>
  )

  const Field = ({ label, icon, children }: { label: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color={COLORS.textTertiary} />
        {children}
      </View>
    </View>
  )

  const discountOptions = [
    { value: 'none', label: 'Ninguno' },
    { value: 'student', label: 'Estudiante' },
    { value: 'disabled', label: 'Discapacitado' },
    { value: 'senior', label: 'Adulto Mayor' },
  ]

  const Step1 = () => (
    <View>
      <Text style={styles.sectionTitle}>Datos personales</Text>
      <Field label="Nombre completo" icon="person-outline">
        <TextInput
          style={styles.input}
          placeholder="Tu nombre y apellido"
          placeholderTextColor={COLORS.textTertiary}
          value={fullName}
          onChangeText={handleFullNameChange}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </Field>
      {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
      
      <Field label="Cédula" icon="id-card-outline">
        <TextInput
          style={styles.input}
          placeholder="V-12345678"
          placeholderTextColor={COLORS.textTertiary}
          value={cedula}
          onChangeText={handleCedulaChange}
          autoCapitalize="characters"
        />
      </Field>
      {errors.cedula ? <Text style={styles.errorText}>{errors.cedula}</Text> : null}
      
      <Field label="Edad" icon="calendar-outline">
        <TextInput
          style={styles.input}
          placeholder="Ej: 26"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="number-pad"
          value={edad}
          onChangeText={handleEdadChange}
        />
      </Field>
      {errors.edad ? <Text style={styles.errorText}>{errors.edad}</Text> : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descuento especial</Text>
        <View style={styles.discountOptionsRow}>
          {discountOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.discountOption,
                specialDiscount === opt.value && styles.discountOptionActive
              ]}
              onPress={() => setSpecialDiscount(opt.value as any)}
            >
              <Text style={{ color: specialDiscount === opt.value ? COLORS.textInverse : COLORS.text }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  const Step2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Contacto</Text>
      <Field label="Teléfono" icon="call-outline">
        <TextInput
          style={styles.input}
          placeholder="Ej: +58 412 000 0000"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={handleTelefonoChange}
        />
      </Field>
      {errors.telefono ? <Text style={styles.errorText}>{errors.telefono}</Text> : null}
      
      <Field label="Correo electrónico" icon="mail-outline">
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Field>
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
    </View>
  )

  const Step3 = () => (
    <View>
      <Text style={styles.sectionTitle}>Seguridad</Text>
      <Field label="Contraseña" icon="lock-closed-outline">
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={COLORS.textTertiary}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={handlePasswordChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </Field>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      
      <Field label="Confirmar contraseña" icon="lock-closed-outline">
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Repite tu contraseña"
          placeholderTextColor={COLORS.textTertiary}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)}>
          <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </Field>
      {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
      
      <View style={styles.passwordHintRow}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.textTertiary} />
        <Text style={styles.passwordHint}>Usa al menos 6 caracteres. Mezcla letras y números para mayor seguridad.</Text>
      </View>
    </View>
  )

  const DocItem = ({ label, done, onToggle, icon }: { label: string; done: boolean; onToggle: () => void; icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={styles.docItem}>
      <View style={styles.docLeft}>
        <View style={[styles.docIcon, done && styles.docIconDone]}>
          <Ionicons name={icon} size={20} color={done ? COLORS.textInverse : COLORS.primary} />
        </View>
        <Text style={styles.docLabel}>{label}</Text>
      </View>
      <TouchableOpacity style={[styles.docButton, done && styles.docButtonDone]} onPress={onToggle}>
        <Ionicons name={done ? "checkmark-circle-outline" : "cloud-upload-outline"} size={18} color={done ? COLORS.textInverse : COLORS.primary} />
        <Text style={[styles.docButtonText, done && styles.docButtonTextDone]}>{done ? "Subido" : "Subir"}</Text>
      </TouchableOpacity>
    </View>
  )

  const Step4 = () => (
    <View>
      <Text style={styles.sectionTitle}>Verificación de documentos</Text>
      <Text style={styles.sectionSubtitle}>Sube los documentos requeridos para validar tu identidad</Text>
      <View style={styles.docsContainer}>
        <DocItem label="Cédula - Frente" done={docFront} onToggle={() => setDocFront((v) => !v)} icon="id-card-outline" />
        <DocItem label="Cédula - Reverso" done={docBack} onToggle={() => setDocBack((v) => !v)} icon="id-card-outline" />
        <DocItem label="Selfie" done={docSelfie} onToggle={() => setDocSelfie((v) => !v)} icon="person-circle-outline" />
      </View>
      <View style={styles.verificationHintRow}>
        <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
        <Text style={styles.verificationHint}>Tus datos están seguros y cifrados. Este paso toma menos de 2 minutos.</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />
      {/* Hero banner */}
      <View style={styles.heroContainer}>
        <View style={styles.heroIconCircle}>
          <Ionicons name="bus" size={28} color={COLORS.textInverse} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Únete a la familia SUBA</Text>
          <Text style={styles.heroSubtitle}>El transporte inteligente de Puerto Ordaz</Text>
        </View>
      </View>
      <StepIndicator />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}

        {/* Mensaje inspiracional inferior */}
        <View style={styles.bottomMessage}>
          <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
          <Text style={styles.bottomMessageText}>
            Muévete mejor por la ciudad con SUBA. Rutas en tiempo real, pagos seguros y una experiencia rápida.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footerButtons, { paddingBottom: Math.max(insets.bottom, 8) + SPACING.md }]}>
        {step > 1 ? (
          <TouchableOpacity style={[styles.secondaryButton]} onPress={prevStep} disabled={loading} activeOpacity={0.8}>
            <View style={styles.buttonContentRow}>
              <Ionicons name="chevron-back" size={18} color={styles.secondaryButtonText.color as string} />
              <Text style={styles.secondaryButtonText}>Atrás</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 1 }} />
        )}

        {step < totalSteps ? (
          <TouchableOpacity
            style={[styles.primaryButton]}
            onPress={nextStep}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContentRow}>
              <Text style={styles.primaryButtonText}>Siguiente</Text>
              <Ionicons name="chevron-forward" size={18} color={styles.primaryButtonText.color as string} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, !canNext && styles.primaryButtonDisabled]}
            onPress={submit}
            disabled={!canNext || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <View style={styles.buttonContentRow}>
                <Ionicons name="person-add-outline" size={18} color={styles.primaryButtonText.color as string} />
                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  stepperContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  stepDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...globalStyles.centered,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepNumber: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: "700",
  },
  stepNumberActive: {
    color: COLORS.textInverse,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  heroContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    ...globalStyles.centered,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  heroSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottomMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  bottomMessageText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  discountOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  discountOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  discountOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  passwordHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  passwordHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  docsContainer: {
    gap: SPACING.md,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    ...globalStyles.centered,
  },
  docIconDone: {
    backgroundColor: COLORS.success,
  },
  docLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  docButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  docButtonDone: {
    backgroundColor: COLORS.primary,
  },
  docButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: "700",
  },
  docButtonTextDone: {
    color: COLORS.textInverse,
  },
  verificationHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingTop: SPACING.md,
  },
  verificationHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...globalStyles.centered,
    minWidth: 160,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textInverse,
    fontWeight: "700",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
})
