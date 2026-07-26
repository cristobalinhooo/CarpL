import { MaterialIcons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Texto de error (Figuras 2-4: estados "credenciales inválidas",
   *  "email no válido", etc.) — no hay un token de "borde neutro"
   *  propio en el Design System, así que los bordes derivan de
   *  `textPrimary`/`actionPrimary`/`danger` ya existentes en distintas
   *  opacidades, en vez de introducir un color nuevo fuera de la
   *  paleta. */
  error?: string;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
  function FormField({ label, icon, error, style, onFocus, onBlur, ...inputProps }, ref) {
    const [isFocused, setIsFocused] = useState(false);

    const borderColor = error
      ? theme.colors.danger
      : isFocused
        ? theme.colors.actionPrimary
        : `${theme.colors.textPrimary}33`;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrapper, { borderColor }]}>
          {icon ? (
            <MaterialIcons
              name={icon}
              size={20}
              color={theme.colors.textPrimary}
              style={styles.icon}
            />
          ) : null}
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={`${theme.colors.textPrimary}80`}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            {...inputProps}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.space8,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.spacing.space12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.space16,
  },
  icon: {
    marginRight: theme.spacing.space8,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.space12,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.danger,
  },
});
