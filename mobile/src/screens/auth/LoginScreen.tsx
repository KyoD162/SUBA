"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { useAuth } from "../../navigation/AuthContext"
import { useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { authService } from "../../services/auth"
import { validateEmail, validatePassword, sanitizeInput } from "../../utils/validation"

export default function LoginScreen() {
  const { signIn } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userLoading, setUserLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Estados de error
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handleLogin = async () => {
    if (userLoading) return
    
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
    
    setUserLoading(true)
    try {
      // Sanitizar inputs antes de enviar
      const sanitizedEmail = sanitizeInput(email.toLowerCase())
      // El backend detecta automáticamente el rol del usuario
      const response = await authService.login({ email: sanitizedEmail, password });
      // response contains { token, refreshToken, user: { id, email, role, name } }
      await signIn(response.token, response.refreshToken, response.user);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Credenciales inválidas")
    } finally {
      setUserLoading(false)
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
                editable={!userLoading}
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
                editable={!userLoading}
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
            style={[styles.loginButton, userLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={userLoading}
          >
            {userLoading ? (
              <ActivityIndicator color={COLORS.textInverse} />
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
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textInverse,
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
