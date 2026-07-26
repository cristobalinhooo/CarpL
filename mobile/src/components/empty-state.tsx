import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

import { PrimaryButton } from './primary-button';

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  note?: string;
}

/**
 * Patrón de Figura 23 ("Estado vacío"): ilustración/ícono, título,
 * texto de apoyo, botón primario y una nota inferior — reutilizable
 * para cualquier lista vacía (vehículos en Fase 3, luego Historial/
 * Investigaciones), no solo para el caso que lo introdujo.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  note,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={40} color={theme.colors.actionPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.action}>
        <PrimaryButton label={actionLabel} onPress={onAction} />
      </View>
      {note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.space24,
    gap: theme.spacing.space16,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${theme.colors.actionPrimary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.space8,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.8,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.space8,
  },
  noteBox: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
    marginTop: theme.spacing.space8,
  },
  noteText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
    textAlign: 'center',
  },
});
