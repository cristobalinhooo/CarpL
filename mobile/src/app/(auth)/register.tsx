import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as authApi from '@/api/auth';
import { ApiError, NetworkError } from '@/api/client';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { theme } from '@/theme';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Figura 3 (Registro): consentimiento separado de la acción principal,
 * requisitos de contraseña explicados mientras se escribe (acá, un
 * texto de ayuda estático — el backend no calcula ningún puntaje de
 * fortaleza, así que no se inventa un `StrengthMeter` visual).
 *
 * Hallazgo del plan de esta fase: el mockup asume que tras "Crear
 * cuenta" se pasa directo a Agregar vehículo, pero Supabase en este
 * proyecto exige confirmar el email antes de poder loguearse
 * (verificado en vivo en la Fase 2 del backend) — nunca se intenta un
 * login automático acá.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit() {
    setFormError(null);

    if (fullName.trim().length === 0) {
      setFormError('Ingresá tu nombre.');
      return;
    }
    if (!isValidEmail(email)) {
      setFormError('Ingresá un correo electrónico válido.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (!consentGiven) {
      setFormError('Aceptá los términos y la política de privacidad para continuar.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      setRegistered(true);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 429) {
        setFormError('Demasiados intentos. Esperá un momento e intentá de nuevo.');
      } else if (error instanceof ApiError) {
        setFormError('No pudimos crear tu cuenta. Revisá los datos e intentá de nuevo.');
      } else if (error instanceof NetworkError) {
        setFormError('Sin conexión a internet. Verificá tu conexión e intentá de nuevo.');
      } else {
        setFormError('No pudimos crear tu cuenta. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <View style={styles.confirmationContainer}>
        <MaterialIcons name="mark-email-read" size={48} color={theme.colors.actionPrimary} />
        <Text style={styles.confirmationTitle}>Revisá tu email</Text>
        <Text style={styles.confirmationBody}>
          Te enviamos instrucciones para confirmar tu cuenta a {email.trim()}.
          Confirmala antes de iniciar sesión.
        </Text>
        <PrimaryButton
          label="Ir a iniciar sesión"
          onPress={() => router.replace('/(auth)/login')}
        />
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
        <Text style={styles.subtitle}>
          Guardá tus vehículos, investigaciones e informes técnicos.
        </Text>

        <View style={styles.form}>
          <FormField
            label="Nombre"
            placeholder="Cristóbal Alonso"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            editable={!loading}
          />
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
          <View>
            <FormField
              label="Contraseña"
              icon="lock"
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!loading}
            />
            <Text style={styles.passwordHint}>
              Mínimo {MIN_PASSWORD_LENGTH} caracteres.
            </Text>
          </View>

          <Pressable
            style={styles.consentRow}
            onPress={() => setConsentGiven((prev) => !prev)}
            disabled={loading}>
            <MaterialIcons
              name={consentGiven ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={consentGiven ? theme.colors.actionPrimary : theme.colors.textPrimary}
            />
            <Text style={styles.consentText}>
              Acepto los términos y la política de privacidad.
            </Text>
          </Pressable>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton
            label="Crear cuenta"
            onPress={() => void handleSubmit()}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tenés una cuenta?</Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Iniciar sesión
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
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  form: {
    gap: theme.spacing.space16,
  },
  passwordHint: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
    marginTop: theme.spacing.space4,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space8,
  },
  consentText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
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
  confirmationContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.space24,
    gap: theme.spacing.space16,
  },
  confirmationTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  confirmationBody: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    opacity: 0.8,
  },
});
