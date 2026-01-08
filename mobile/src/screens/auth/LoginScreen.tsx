"use client"

import React, { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { useAuth } from "../../navigation/AuthContext"
import { useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { authService } from "../../services/auth"
import { validateEmail, validatePassword } from "../../utils/validation"

// === COMPONENTE TOAST ===
interface ToastProps {
  visible: boolean
  message: string
  type: 'error' | 'success' | 'info'
  onHide: () => void
}

function Toast({ visible, message, type, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto-hide después de 4 segundos
      const timer = setTimeout(() => {
        hideToast()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide())
  }

  if (!visible) return null

  const bgColor = type === 'error' ? COLORS.error : type === 'success' ? COLORS.success : COLORS.primary

  return (
    <Animated.View 
      style={[
        toastStyles.container, 
        { backgroundColor: bgColor, transform: [{ translateY }], opacity }
      ]}
    >
      <Ionicons 
        name={type === 'error' ? 'alert-circle' : type === 'success' ? 'checkmark-circle' : 'information-circle'} 
        size={24} 
        color={COLORS.textInverse} 
      />
      <Text style={toastStyles.message}>{message}</Text>
      <TouchableOpacity onPress={hideToast}>
        <Ionicons name="close" size={20} color={COLORS.textInverse} />
      </TouchableOpacity>
    </Animated.View>
  )
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: SPACING.sm,
  },
  message: {
    flex: 1,
    color: COLORS.textInverse,
    ...TEXT_STYLES.bodySm,
    fontWeight: '500',
  },
})

export default function LoginScreen() {
  const { signIn } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Estados de error
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  
  // Estado del toast
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'error',
  })

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ visible: true, message, type })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }))
  }

  const handleLogin = async () => {
    if (isLoading) return
    
    // Limpiar errores previos
    setEmailError("")
    setPasswordError("")
    
    // Validar email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "")
      return
    }
    
    // Validar contraseña
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || "")
      return
    }
    
    setIsLoading(true)
    try {
      // El servicio ya sanitiza los inputs internamente
      const response = await authService.login({ email, password })
      
      // Mostrar toast de éxito brevemente
      showToast('¡Bienvenido de nuevo!', 'success')
      
      // Iniciar sesión - la navegación se maneja automáticamente por AuthContext
      await signIn(response.token, response.refreshToken, response.user)
      
      console.log('[LOGIN] Login exitoso, rol:', response.user.role)
    } catch (error: any) {
      console.error('[LOGIN] Error:', error)
      // Usar el mensaje amigable del servicio de autenticación
      const errorMessage = authService.getErrorMessage(error)
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Validación en tiempo real del email
  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (emailError) {
      setEmailError("")
    }
  }
  
  // Validación en tiempo real de la contraseña
  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (passwordError) {
      setPasswordError("")
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Toast de notificación */}
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={hideToast} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="bus-outline" size={48} color={COLORS.textInverse} />
          </View>
          <Text style={styles.title}>SUBA</Text>
          <Text style={styles.subtitle}>Tu transporte público inteligente</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
              <Ionicons name="mail-outline" size={20} color={emailError ? COLORS.error : COLORS.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
              <Ionicons name="lock-closed-outline" size={20} color={passwordError ? COLORS.error : COLORS.textTertiary} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textTertiary}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.textInverse} size="small" />
                <Text style={styles.loadingText}>Iniciando sesión...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signupLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: "center",
    marginTop: SPACING["2xl"],
    marginBottom: SPACING["2xl"],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    ...globalStyles.centered,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  form: {
    marginTop: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
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
  inputContainerError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
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
  },
  forgotPassword: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    textAlign: "right",
    marginBottom: SPACING.xl,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textInverse,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textInverse,
    fontWeight: '500',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING["2xl"],
    marginBottom: SPACING.lg,
  },
  footerText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  signupLink: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
})
