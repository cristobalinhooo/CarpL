import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

/**
 * Splash (Technical Spec §12.3): "Inicializar configuración y resolver
 * sesión. Autenticado → Home; no autenticado → Login." La resolución
 * real y la navegación viven en el guard de `_layout.tsx`
 * (`RootNavigator`) — esta pantalla solo se ve brevemente mientras
 * `status === 'loading'` (lectura de la sesión guardada).
 */
export default function Splash() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
