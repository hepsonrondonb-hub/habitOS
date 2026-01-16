import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ActivityIndicator, View, Image } from 'react-native';
import { colors, radius, spacing, shadows } from '../../tokens';
import { AppText } from '../AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: 'filled' | 'surface' | 'danger';
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
  const isFilled = variant === 'filled';
  const isSurface = variant === 'surface';
  const isDanger = variant === 'danger';

  // Content Component
  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={isFilled ? colors.surface : colors.primary} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon === 'google' ? 'language' : icon as any}
              size={20}
              color={isFilled ? colors.surface : isDanger ? colors.danger : colors.primary}
              style={[styles.icon, { marginRight: spacing.sm }]}
            />
          )}
          <AppText
            variant="subheading"
            style={[
              styles.text,
              isFilled ? styles.filledText : isDanger ? styles.dangerText : styles.surfaceText
            ]}
          >
            {label}
          </AppText>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon === 'google' ? 'language' : icon as any}
              size={20}
              color={isFilled ? colors.surface : isDanger ? colors.danger : colors.primary}
              style={[styles.icon, { marginLeft: spacing.sm }]}
            />
          )}
        </>
      )}
    </View>
  );

  const containerStyle = [
    styles.container,
    isSurface && styles.surfaceContainer,
    isDanger && styles.surfaceContainer,
    disabled && styles.disabled,
    style
  ];

  if (isFilled && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={loading}
        {...props}
        style={[style, shadows.md]} // Apply shadow to wrapper for gradient
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, styles.gradientContainer]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
  },
  gradientContainer: {
    borderRadius: radius.full,
    width: '100%',
  },
  surfaceContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider, // Subtle border mainly
    ...shadows.sm,
  },
  disabled: {
    backgroundColor: colors.disabled,
    ...shadows.none,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    //
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  filledText: {
    color: colors.surface,
  },
  surfaceText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.danger,
  }
});
