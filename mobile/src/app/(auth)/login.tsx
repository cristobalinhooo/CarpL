import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError, NetworkError } from '@/api/client';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import {
  INVALID_EMAIL_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  TOO_MANY_ATTEMPTS_MESSAGE,
} from '@/constants/messages';
import { useSession } from '@/hooks/use-session';
import { theme } from '@/theme';

/**
 * Figura 2 (Login): acción primaria única, recuperación visible junto
 * al campo de contraseña, sin los botones "Continuar con Apple/Google"
 * del mockup — el backend no soporta ningún proveedor OAuth todavía
 * (confirmado con el usuario, ver el plan de esta fase).
 */
export default function LoginScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit() {
    setFormError(null);

    if (!isValidEmail(email)) {
      setFormError(INVALID_EMAIL_MESSAGE);
      return;
    }
    if (password.length === 0) {
      setFormError('Ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      // El guard de rutas (`_layout.tsx`) redirige a las tabs al ver
      // `status === 'authenticated'` — esta pantalla no navega directo.
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        setFormError('Credenciales inválidas.');
      } else if (error instanceof ApiError && error.statusCode === 429) {
        setFormError(TOO_MANY_ATTEMPTS_MESSAGE);
      } else if (error instanceof NetworkError) {
        setFormError(NETWORK_ERROR_MESSAGE);
      } else {
        setFormError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Bienvenido a CarPlus</Text>
        <Text style={styles.subtitle}>
          Accede para continuar tus investigaciones y consultar tus informes.
        </Text>

        <View style={styles.form}>
          <FormField
            label="Correo electrónico"
            icon="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!loading}
          />
          <View>
            <FormField
              label="Contraseña"
              icon="lock"
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!loading}
            />
            <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
              ¿Has olvidado tu contraseña?
            </Link>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton
            label="Iniciar sesión"
            onPress={() => void handleSubmit()}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            Crear cuenta
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.space24,
    justifyContent: 'center',
    gap: theme.spacing.space24,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.7,
    marginTop: -theme.spacing.space16,
  },
  form: {
    gap: theme.spacing.space16,
  },
  forgotLink: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
    marginTop: theme.spacing.space8,
    alignSelf: 'flex-end',
  },
  formError: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.space8,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  footerLink: {
    ...theme.typography.body,
    fontFamily: theme.typography.label.fontFamily,
    color: theme.colors.actionPrimary,
  },
});
