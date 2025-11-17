"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Animated, Easing, LayoutAnimation, Platform, UIManager } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { useAuth } from "../../navigation/AuthContext"
import { useNavigation } from "@react-navigation/native"

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Document verification (simulated)
  const [docFront, setDocFront] = useState(false)
  const [docBack, setDocBack] = useState(false)
  const [docSelfie, setDocSelfie] = useState(false)

  const totalSteps = 4
  // Enable smooth layout animations on Android
  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setStep((s) => Math.min(totalSteps, s + 1))
  }
  const prevStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setStep((s) => Math.max(1, s - 1))
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Simulate account creation success → sign in and go to app
      signIn()
    }, 1200)
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

  const Step1 = () => (
    <View>
      <Text style={styles.sectionTitle}>Datos personales</Text>
      <Field label="Nombre completo" icon="person-outline">
        <TextInput
          style={styles.input}
          placeholder="Ej: Jesus Rondon"
          placeholderTextColor={COLORS.textTertiary}
          value={fullName}
          onChangeText={setFullName}
        />
      </Field>
      <Field label="Cédula" icon="id-card-outline">
        <TextInput
          style={styles.input}
          placeholder="V-12345678"
          placeholderTextColor={COLORS.textTertiary}
          value={cedula}
          onChangeText={setCedula}
        />
      </Field>
      <Field label="Edad" icon="calendar-outline">
        <TextInput
          style={styles.input}
          placeholder="Ej: 26"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="number-pad"
          value={edad}
          onChangeText={setEdad}
        />
      </Field>
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
          onChangeText={setTelefono}
        />
      </Field>
      <Field label="Correo electrónico" icon="mail-outline">
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </Field>
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
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </Field>
      <Field label="Confirmar contraseña" icon="lock-closed-outline">
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Repite tu contraseña"
          placeholderTextColor={COLORS.textTertiary}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)}>
          <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </Field>
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
    // Barra inferior más sutil y acorde al fondo
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
