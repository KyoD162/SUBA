'use client';

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme';
import { Card, Badge, Button } from '../../components';
import type { RootStackParamList } from '../../navigation/types';

interface MenuOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action?: () => void;
  badge?: string;
}

interface PreferenceOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const BASE_MENU_OPTIONS: MenuOption[] = [
  { id: '1', icon: 'person-outline', label: 'Editar Perfil' },
  { id: '2', icon: 'card-outline', label: 'Métodos de Pago' },
  { id: '3', icon: 'location-outline', label: 'Direcciones Guardadas', badge: '3' },
  { id: '4', icon: 'star-outline', label: 'Rutas Favoritas' },
  // Ionicons no tiene 'history-outline'; usa 'time-outline' para historial
  { id: '5', icon: 'time-outline', label: 'Historial de Transacciones' },
  { id: '6', icon: 'notifications-outline', label: 'Notificaciones' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offersEnabled, setOffersEnabled] = useState(true);

  const [preferences, setPreferences] = useState<PreferenceOption[]>([
    {
      id: '1',
      label: 'Notificaciones de ruta',
      description: 'Recibe alertas de retrasos y cambios',
      enabled: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: '2',
      label: 'Ofertas especiales',
      description: 'Recibe promociones y descuentos',
      enabled: offersEnabled,
      onToggle: setOffersEnabled,
    },
  ]);

  const menuOptions = useMemo(() => {
    return BASE_MENU_OPTIONS.map((option) =>
      option.id === '1' ? { ...option, action: () => navigation.navigate('EditProfile') } : option,
    );
  }, [navigation]);

  const MenuItem = ({ option }: { option: MenuOption }) => (
    <TouchableOpacity style={styles.menuItem} onPress={option.action} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={option.icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.menuLabel}>{option.label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {option.badge && <Badge label={option.badge} variant="primary" size="sm" />}
        <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  const PreferenceItem = ({ item }: { item: PreferenceOption }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceLabel}>{item.label}</Text>
        <Text style={styles.preferenceDescription}>{item.description}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={item.onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.success }}
        thumbColor={item.enabled ? COLORS.success : COLORS.textTertiary}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={COLORS.textInverse} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Jesus Rondon</Text>
              <Text style={styles.userEmail}>jesus.rondon@email.com</Text>
            </View>
            <Badge label="Gold" variant="primary" />
          </View>

          {/* User Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="navigate" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Viajes</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>1,240</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                {/* Ionicons no incluye 'crown'; usa 'ribbon-outline' como equivalente */}
                <Ionicons name="ribbon-outline" size={20} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.statValue}>Gold</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>

          <Button
            title="Editar Perfil"
            variant="outline"
            size="md"
            style={{ marginTop: SPACING.lg }}
            onPress={() => navigation.navigate('EditProfile')}
          />
        </Card>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <FlatList
            data={menuOptions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <MenuItem option={item} />}
            ItemSeparatorComponent={() => <View style={styles.menuSeparator} />}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <Card>
            <FlatList
              data={preferences}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => <PreferenceItem item={item} />}
              ItemSeparatorComponent={() => <View style={styles.preferenceSeparator} />}
            />
          </Card>
        </View>

        {/* Loyalty Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programa de Lealtad</Text>
          <Card variant="elevated">
            <View style={styles.loyaltyContent}>
              <View style={styles.loyaltyHeader}>
                <Ionicons name="star" size={32} color={COLORS.warning} />
                <View>
                  <Text style={styles.loyaltyTitle}>Gold Member</Text>
                  <Text style={styles.loyaltySubtitle}>Próximo nivel: Platinum</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.progressText}>Faltan 400 puntos para Platinum</Text>

              <View style={styles.benefitsGrid}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitValue}>10%</Text>
                  <Text style={styles.benefitLabel}>Descuento</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitValue}>2x</Text>
                  <Text style={styles.benefitLabel}>Puntos</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitValue}>VIP</Text>
                  <Text style={styles.benefitLabel}>Soporte</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda</Text>
          <View style={styles.helpOptions}>
            <TouchableOpacity style={styles.helpOption}>
              <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.helpText}>Centro de ayuda</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpOption}>
              <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
              <Text style={styles.helpText}>Soporte al cliente</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpOption}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.helpText}>Acerca de SUBA</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <Button title="Cerrar Sesión" variant="outline" size="lg" style={styles.logoutButton} />

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SUBA v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  profileCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuSeparator: {
    height: SPACING.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  preferenceDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  preferenceSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  loyaltyContent: {
    gap: SPACING.lg,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  loyaltyTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  loyaltySubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: RADIUS.full,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  benefitsGrid: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  benefitItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  benefitValue: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
  },
  benefitLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  helpOptions: {
    gap: SPACING.md,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  versionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
});
