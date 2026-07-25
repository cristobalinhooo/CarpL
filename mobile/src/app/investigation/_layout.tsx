import { Stack } from 'expo-router';

import { theme } from '@/theme';

/** Stack de investigación (Technical Spec §12.2/12.4): Nueva
 *  investigación → Chat ↔ Evidencia → Informe. Fuera de las tabs
 *  persistentes — cada pantalla define su propio título vía
 *  `Stack.Screen` embebido, no acá (evita depender de nombres de ruta
 *  anidados bajo `[id]/`). */
export default function InvestigationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: theme.typography.h3,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}
