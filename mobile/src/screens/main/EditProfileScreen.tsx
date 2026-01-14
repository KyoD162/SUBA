'use client';

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Card, Input, Button, SelectField } from '../../components';
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import React from 'react';

const initialProfile = {
  fullName: 'Jesus Rondon',
  email: 'jesus.rondon@email.com',
  phone: '+58 424 555 1234',
  documentId: 'V-12.345.678',
  city: 'Puerto Ordaz',
  bio: 'Ingeniero de software apasionado por mejorar la movilidad urbana.',
};

const initialPreferences = {
  routeAlerts: true,
  marketingEmails: true,
  shareLocation: false,
};

const CITY_OPTIONS = [
  'Puerto Ordaz',
  'San Félix',
  'Barcelona',
  'Puerto La Cruz',
  'Ciudad Bolívar',
  'Valencia',
  'Caracas',
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s-]{8,15}$/;
const documentRegex = /^[VEP]-\d{2}\.\d{3}\.\d{3}$/i;

type ProfileForm = typeof initialProfile;

type PreferenceForm = typeof initialPreferences;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [form, setForm] = useState<ProfileForm>(initialProfile);
  const [preferences, setPreferences] = useState<PreferenceForm>(initialPreferences);
  const [preferenceDraft, setPreferenceDraft] = useState<PreferenceForm>(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(form) !== JSON.stringify(profile) ||
      JSON.stringify(preferenceDraft) !== JSON.stringify(preferences)
    );
  }, [form, preferenceDraft, preferences, profile]);

  const validateField = (field: keyof ProfileForm, value: string) => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'El correo es obligatorio';
        if (!emailRegex.test(value.trim())) return 'Correo inválido';
        return '';
      case 'phone':
        if (!value.trim()) return 'El teléfono es obligatorio';
        if (!phoneRegex.test(value.trim())) return 'Teléfono inválido';
        return '';
      case 'documentId':
        if (!value.trim()) return 'El documento es obligatorio';
        if (!documentRegex.test(value.trim())) return 'Formato esperado: V-00.000.000';
        return '';
      case 'city':
        if (!value.trim()) return 'Selecciona una ciudad';
        if (!CITY_OPTIONS.includes(value)) return 'Ciudad no disponible';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus('idle');
    if (['email', 'phone', 'documentId', 'city'].includes(field)) {
      const message = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: message || undefined }));
    }
  };

  const handlePreferenceToggle = (field: keyof PreferenceForm, value: boolean) => {
    setPreferenceDraft((prev) => ({ ...prev, [field]: value }));
    setStatus('idle');
  };

  const handleCitySelect = (value: string) => {
    setCityPickerVisible(false);
    setForm((prev) => ({ ...prev, city: value }));
    setStatus('idle');
    const message = validateField('city', value);
    setErrors((prev) => ({ ...prev, city: message || undefined }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    const fieldsToValidate: (keyof ProfileForm)[] = ['email', 'phone', 'documentId', 'city'];
    const validationResults: Partial<Record<keyof ProfileForm, string | undefined>> = {};
    fieldsToValidate.forEach((field) => {
      const value = form[field];
      const message = validateField(field, value);
      validationResults[field] = message || undefined;
    });
    setErrors((prev) => ({ ...prev, ...validationResults }));
    const hasBlockingErrors = Object.values(validationResults).some((message) => Boolean(message));
    if (hasBlockingErrors) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProfile(form);
    setPreferences(preferenceDraft);
    setSaving(false);
    setStatus('success');
    // Future: replace the above block with an API call once the backend endpoint exists
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>Editar perfil</Text>
            <Text style={styles.subtitle}>Actualiza tu información personal y preferencias</Text>
          </View>
        </View>

        {status === 'success' && (
          <View style={styles.statusBanner}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={styles.statusText}>Cambios guardados localmente</Text>
          </View>
        )}

        <Card style={styles.summaryCard}>
          <View style={styles.summaryAvatar}>
            <Ionicons name="person" size={28} color={COLORS.textInverse} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryName}>{profile.fullName}</Text>
            <Text style={styles.summaryMeta}>{profile.email}</Text>
            <Text style={styles.summaryMeta}>{profile.city}</Text>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Datos personales</Text>
          <Input
            label="Nombre completo"
            icon="person-outline"
            value={form.fullName}
            onChangeText={(text) => handleChange('fullName', text)}
            placeholder="Nombre y apellido"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Correo"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="correo@suba.com"
            error={errors.email}
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Teléfono"
            icon="call-outline"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="Ej: +58 424 000 0000"
            error={errors.phone}
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Documento"
            icon="card-outline"
            value={form.documentId}
            onChangeText={(text) => handleChange('documentId', text)}
            placeholder="V-00.000.000"
            error={errors.documentId}
            containerStyle={styles.inputSpacing}
          />
          <SelectField
            label="Ciudad"
            icon="location-outline"
            value={form.city}
            placeholder="Selecciona una ciudad"
            onPress={() => setCityPickerVisible(true)}
            containerStyle={styles.inputSpacing}
            error={errors.city}
          />
          <Input
            label="Sobre ti"
            icon="create-outline"
            value={form.bio}
            onChangeText={(text) => handleChange('bio', text)}
            placeholder="Comparte algo sobre ti"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <PreferenceRow
            label="Alertas de ruta"
            description="Recibe cambios en tiempo real"
            value={preferenceDraft.routeAlerts}
            onToggle={(value) => handlePreferenceToggle('routeAlerts', value)}
          />
          <View style={styles.preferenceDivider} />
          <PreferenceRow
            label="Promociones"
            description="Noticias y descuentos por correo"
            value={preferenceDraft.marketingEmails}
            onToggle={(value) => handlePreferenceToggle('marketingEmails', value)}
          />
          <View style={styles.preferenceDivider} />
          <PreferenceRow
            label="Compartir ubicación"
            description="Usa tu posición para mejores rutas"
            value={preferenceDraft.shareLocation}
            onToggle={(value) => handlePreferenceToggle('shareLocation', value)}
          />
        </Card>

        <Button
          title={hasChanges ? 'Guardar cambios' : 'Nada por guardar'}
          onPress={handleSave}
          loading={saving}
          disabled={!hasChanges}
          size="lg"
        />
      </ScrollView>
      <CityPickerModal
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onSelect={handleCitySelect}
        options={CITY_OPTIONS}
        selectedValue={form.city}
      />
    </SafeAreaView>
  );
}

interface PreferenceRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function PreferenceRow({ label, description, value, onToggle }: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={value ? COLORS.primary : COLORS.surface}
      />
    </View>
  );
}

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: string[];
  selectedValue?: string;
}

function CityPickerModal({
  visible,
  onClose,
  onSelect,
  options,
  selectedValue,
}: CityPickerModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecciona tu ciudad</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <View style={styles.cityOptionDivider} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.cityOption, selectedValue === item && styles.cityOptionActive]}
                onPress={() => onSelect(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.cityOptionLabel}>{item}</Text>
                {selectedValue === item && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    gap: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  subtitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.success,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  summaryAvatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  summaryMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    gap: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  inputSpacing: {
    marginBottom: SPACING.lg,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
  },
  preferenceDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'] ?? SPACING.xl,
    gap: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  cityOptionActive: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  cityOptionLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  cityOptionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
