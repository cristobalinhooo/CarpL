import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

interface ScreenPlaceholderProps {
  title: string;
  note: string;
  /** Contenido real y funcional dentro de una pantalla por lo demás
   *  placeholder (p. ej. el botón de cerrar sesión en Perfil, Fase 2)
   *  — el resto de la pantalla sigue siendo esqueleto de fases
   *  futuras, esto no. */
  children?: ReactNode;
}

/**
 * Esqueleto de navegación (Fase 1, mobile): cada pantalla del mapa de
 * pantallas (Technical Spec §12.3) existe como ruta navegable, pero
 * sin contenido ni lógica real todavía — eso llega fase a fase, mismo
 * criterio que el backend fue ganando módulos. Usa los tokens de
 * `theme` para que el esqueleto ya se vea consistente con las Figuras
 * 2-4 del Design System, no un placeholder gris genérico.
 */
export function ScreenPlaceholder({ title, note, children }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.note}>{note}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.space24,
    gap: theme.spacing.space8,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    opacity: 0.7,
  },
});
