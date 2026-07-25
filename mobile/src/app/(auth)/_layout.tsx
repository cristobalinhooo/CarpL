import { Stack } from 'expo-router';

import { theme } from '@/theme';

/** Stack de autenticación (Technical Spec §12.2): Login, Registro,
 *  Recuperación de contraseña — "sin cambios" respecto a v1.2, mapa de
 *  pantallas §12.3. */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: theme.typography.h3,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: 'Recuperar contraseña' }}
      />
    </Stack>
  );
}
