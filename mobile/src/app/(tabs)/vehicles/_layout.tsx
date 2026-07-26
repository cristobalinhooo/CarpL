import { Stack } from 'expo-router';

import { theme } from '@/theme';

/**
 * Stack anidado dentro del tab "Vehículos" (Fase 3): la lista ("Mis
 * vehículos", Figura 6) es la pantalla por defecto del tab, y agregar
 * un vehículo (patente/manual, Figura 5) + confirmar datos recuperados
 * son rutas propias dentro del mismo stack — mismo patrón que
 * `investigation/_layout.tsx`, necesario para poder navegar más allá
 * de lo que un tab plano permitiría.
 */
export default function VehiclesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: theme.typography.h3,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
