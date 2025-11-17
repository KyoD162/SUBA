"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { useAuth } from "../../navigation/AuthContext"
import { useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

export default function LoginScreen() {
  const { signIn, signInAsAdmin } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    // Simulación llamada API estándar usuario
    setTimeout(() => {
      setLoading(false)
      signIn()
    }, 1000)
  }

  const handleAdminLogin = async () => {
    setLoadingAdmin(true)
    // Simulación llamada API con rol admin
    setTimeout(() => {
      setLoadingAdmin(false)
      signInAsAdmin()
    }, 800)
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="bus-outline" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.title}>SUBA</Text>
          <Text style={styles.subtitle}>Tu transporte público inteligente</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón Login Usuario */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Botón Login Admin */}
          <TouchableOpacity
            style={[styles.adminButton, (loadingAdmin || loading) && styles.loginButtonDisabled]}
            onPress={handleAdminLogin}
            disabled={loadingAdmin || loading}
          >
            {loadingAdmin ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.adminButtonText}>Acceder Admin</Text>
            )}
          </TouchableOpacity>

          {/* Alternative path */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>¿Eres conductor?</Text>
            <View style={styles.divider} />
          </View>
          <TouchableOpacity style={styles.altButton}>
            <Text style={styles.altButtonText}>Inicia sesión</Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.success,
    ...globalStyles.centered,
    marginBottom: SPACING.lg,
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
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TEXT_STYLES.body,
    color: COLORS.text,
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
  adminButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textInverse,
  },
  adminButtonText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textInverse,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginHorizontal: SPACING.md,
  },
  socialContainer: {
    flexDirection: "row",
    gap: SPACING.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  socialButtonText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  altButton: {
    alignSelf: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  altButtonText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    fontWeight: "700",
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
