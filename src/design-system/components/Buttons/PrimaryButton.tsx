import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ActivityIndicator, View, Image } from 'react-native';
import { colors, radius, spacing, shadows } from '../../tokens';
import { AppText } from '../AppText';
import { MaterialIcons } from '@expo/vector-icons';

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: 'filled' | 'surface'; // 'surface' for Google-style buttons
  icon?: keyof typeof MaterialIcons.glyphMap | 'google';
  iconPosition?: 'left' | 'right';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  loading = false,
  variant = 'filled',
  icon,
  iconPosition = 'left',
  style,
  disabled,
  ...props
}) => {
  const isSurface = variant === 'surface';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSurface ? styles.surfaceContainer : styles.filledContainer,
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isSurface ? colors.primary : colors.surface} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon === 'google' ? 'language' : icon as any}
              size={20}
              color={isSurface ? colors.primary : colors.surface}
              style={[styles.icon, { marginRight: spacing.sm }]}
            />
          )}
          <AppText
            variant="subheading"
            style={[
              styles.text,
              isSurface ? styles.surfaceText : styles.filledText
            ]}
          >
            {label}
          </AppText>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon === 'google' ? 'language' : icon as any}
              size={20}
              color={isSurface ? colors.primary : colors.surface}
              style={[styles.icon, { marginLeft: spacing.sm }]}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
    ...shadows.md,
  },
  filledContainer: {
    backgroundColor: colors.primary,
  },
  surfaceContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1, // Optional, looks clean without too
    borderColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.disabled,
    ...shadows.none,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: '700',
  },
  filledText: {
    color: colors.surface,
  },
  surfaceText: {
    color: colors.textPrimary,
  }
});
