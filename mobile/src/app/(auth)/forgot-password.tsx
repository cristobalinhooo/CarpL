import { MaterialIcons } from '@expo/vector-icons';
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

import * as authApi from '@/api/auth';
import { NetworkError } from '@/api/client';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { theme } from '@/theme';

/**
 * Figura 4 (Recuperar contraseña): explica el proceso antes de pedir
 * el dato, y al enviar sustituye el formulario por una confirmación en
 * el mismo lugar (no navega) — el backend siempre responde
 * `{sent: true}` sin importar si el correo existe (privacidad), así
 * que no hay ninguna rama de "email no encontrado" que mostrar.
 */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit() {
    setFormError(null);

    if (!isValidEmail(email)) {
      setFormError('Ingresá un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (error) {
      if (error instanceof NetworkError) {
        setFormError('Sin conexión a internet. Verificá tu conexión e intentá de nuevo.');
      } else {
        setFormError('No pudimos procesar la solicitud. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="mark-email-read" size={48} color={theme.colors.actionPrimary} />
        <Text style={styles.title}>Revisá tu correo</Text>
        <Text style={styles.body}>
          Si existe una cuenta asociada a {email.trim()}, te enviamos
          instrucciones para restablecer tu acceso.
        </Text>
        <Link href="/(auth)/login" style={styles.backLink}>
          Volver al inicio de sesión
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <MaterialIcons name="mail" size={48} color={theme.colors.actionPrimary} />
          <Text style={styles.title}>Restablece tu acceso</Text>
          <Text style={styles.body}>
            Introducí el correo de tu cuenta. Te enviaremos instrucciones si
            existe una cuenta asociada.
          </Text>
        </View>

        <View style={styles.form}>
          <FormField
            label="Correo electrónico"
            icon="email"
            placeholder="cristobal@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!loading}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton
            label="Enviar instrucciones"
            onPress={() => void handleSubmit()}
            loading={loading}
          />

          <Link href="/(auth)/login" style={styles.backLink}>
            Volver al inicio de sesión
          </Link>
        </View>

        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            Por seguridad, mostramos la misma confirmación aunque el correo no
            esté registrado.
          </Text>
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
  header: {
    alignItems: 'center',
    gap: theme.spacing.space8,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.8,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.space16,
  },
  formError: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  backLink: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
    textAlign: 'center',
  },
  privacyNotice: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
  },
  privacyText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.space24,
    gap: theme.spacing.space16,
  },
});
