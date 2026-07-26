import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { fontFamily, theme } from '@/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  /** Figura 2: "Iniciar sesión valida y muestra loading dentro del
   *  botón" — el spinner reemplaza la etiqueta, no se agrega al lado. */
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme.colors.surface} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.actionPrimary,
    borderRadius: theme.spacing.space12,
    paddingVertical: theme.spacing.space16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.surface,
  },
});
