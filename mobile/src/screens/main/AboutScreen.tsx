'use client';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme';
import { Card } from '../../components';

const pillars = [
  {
    title: 'Geolocalización en tiempo real',
    description:
      'Permitimos seguir la flota de autobuses minuto a minuto para que cada viaje inicie con información confiable.',
    icon: 'navigate-outline' as const,
  },
  {
    title: 'Tiempo Estimado de Llegada',
    description:
      'Estimaciones precisas del próximo arribo reducen la incertidumbre y facilitan la planificación del día a día.',
    icon: 'time-outline' as const,
  },
  {
    title: 'Nivel ocupacional',
    description:
      'Conocer la capacidad disponible otorga control y seguridad antes de subir a la unidad.',
    icon: 'people-outline' as const,
  },
];

const impacts = [
  'Movilidad inteligente y conectada para Puerto Ordaz',
  'Mayor confianza en el transporte colectivo gracias a la transparencia de la información',
  'Impulso a la planificación urbana basada en datos reales',
  'Mejora tangible en la calidad de vida urbana',
];

const highlights = [
  { icon: 'bus-outline' as const, label: 'Flota', value: '100% conectada' },
  { icon: 'locate-outline' as const, label: 'ETA', value: 'En tiempo real' },
  { icon: 'shield-checkmark-outline' as const, label: 'Confianza', value: '+ seguridad' },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.heroIcon}>
            <Ionicons name="bus" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.tagline}>Sistema Urbano de Boletería Automática</Text>
          <Text style={styles.title}>SUBA</Text>
          <Text style={styles.subtitle}>Modernizamos el transporte público en Puerto Ordaz.</Text>
        </View>

        <View style={styles.highlightRow}>
          {highlights.map((item) => (
            <Card key={item.label} style={styles.highlightCard}>
              <Ionicons name={item.icon} size={24} color={COLORS.primary} />
              <Text style={styles.highlightValue}>{item.value}</Text>
              <Text style={styles.highlightLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Información del proyecto</Text>
          <Text style={[styles.body, styles.paragraph]}>
            La presente propuesta describe el desarrollo del Sistema Urbano de Boletería Automática
            (SUBA), una aplicación móvil esencial para modernizar el transporte público en Puerto
            Ordaz. El proyecto aborda la ineficiencia operativa y la falta de información al usuario
            mediante la implementación de la geolocalización en tiempo real de la flota.
          </Text>
          <Text style={[styles.body, styles.paragraph]}>
            SUBA proveerá una plataforma digital que optimizará la movilidad, permitiendo a los
            ciudadanos consultar el tiempo exacto de arribo, la ubicación en vivo y el nivel
            ocupacional de los autobuses.
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Lo que aportamos a la ciudad</Text>
          {pillars.map((pillar) => (
            <View key={pillar.title} style={styles.pillarItem}>
              <View style={styles.pillarIcon}>
                <Ionicons name={pillar.icon} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.pillarContent}>
                <Text style={styles.pillarTitle}>{pillar.title}</Text>
                <Text style={styles.body}>{pillar.description}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios que visualizamos</Text>
          {impacts.map((impact) => (
            <View key={impact} style={styles.impactItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.body}>{impact}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra visión</Text>
          <Text style={[styles.body, styles.paragraph]}>
            Creemos que los beneficios potenciales superan ampliamente las barreras actuales: una
            planificación urbana más eficiente, un impulso al uso del transporte colectivo y una
            mejora tangible en la calidad de vida de los ciudadanos, al brindarles mayor control,
            información y seguridad en sus trayectos.
          </Text>
          <Text style={[styles.body, styles.paragraph]}>
            SUBA se establece como la herramienta clave para una movilidad inteligente y un futuro
            urbano sostenible para Puerto Ordaz.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  tagline: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.text,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  section: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  body: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  paragraph: {
    marginBottom: SPACING.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  highlightCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    minWidth: 100,
  },
  highlightValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  highlightLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  pillarItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  pillarIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillarContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  pillarTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
  },
  impactItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
});
