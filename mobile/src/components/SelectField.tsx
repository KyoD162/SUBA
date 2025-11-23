import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TEXT_STYLES } from '../theme';
import { scale, verticalScale } from '../utils/responsive';

interface SelectFieldProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  icon,
  value,
  placeholder,
  onPress,
  containerStyle,
  error,
}) => {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.selector, error && styles.selectorError]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {icon && <Ionicons name={icon} size={scale(20)} color={COLORS.textTertiary} />}
        <Text style={[styles.valueText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={scale(18)} color={COLORS.textTertiary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: scale(SPACING.md),
    paddingVertical: verticalScale(SPACING.md),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorError: {
    borderColor: COLORS.danger,
  },
  valueText: {
    flex: 1,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textTertiary,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
