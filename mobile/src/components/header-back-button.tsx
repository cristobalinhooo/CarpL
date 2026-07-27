import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { theme } from '@/theme';

/**
 * `headerLeft` explícito para pantallas bajo `investigation/[id]/`. Se
 * entra a ellas siempre desde un Stack hermano ((tabs)/history o
 * investigation/new), así que el Stack anidado se monta con
 * profundidad 1 y React Navigation nunca dibuja el chevron automático
 * (su `canGoBack` de header es local al navigator anidado, no ve el
 * historial del padre) — aunque `goBack()` sí sube al navigator padre
 * cuando el anidado no tiene historial propio. El fallback a Home es
 * solo para el caso límite de un deep link directo sin historial en
 * ningún nivel.
 */
export function HeaderBackButton() {
  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }}
      hitSlop={12}
      style={styles.button}>
      <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: theme.spacing.space8,
    paddingVertical: theme.spacing.space8,
  },
});
