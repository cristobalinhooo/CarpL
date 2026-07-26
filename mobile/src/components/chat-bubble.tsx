import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Message } from '@/api/messages';
import { theme } from '@/theme';

interface ChatBubbleProps {
  message: Message;
}

/**
 * Un mensaje del chat (Figura 9): burbuja azul a la derecha para el
 * usuario, texto plano a la izquierda para la IA. `isSafetyStop` gana
 * su propio estilo de advertencia (Fase 5: primera pantalla que
 * renderiza esta señal, ya persistida desde la Fase 5 original del
 * backend) — sin bloquear nada más, el backend mismo no define
 * todavía ninguna acción especial ahí.
 */
export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.isSafetyStop) {
    return (
      <View style={styles.safetyContainer}>
        <View style={styles.safetyHeader}>
          <MaterialIcons name="warning" size={18} color={theme.colors.danger} />
          <Text style={styles.safetyTitle}>Aviso de seguridad</Text>
        </View>
        <Text style={styles.safetyText}>{message.safetyMessage ?? message.message}</Text>
      </View>
    );
  }

  if (message.sender === 'USER') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiRow}>
      <Text style={styles.aiText}>{message.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: theme.colors.actionPrimary,
    borderRadius: theme.spacing.space16,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space12,
  },
  userText: {
    ...theme.typography.body,
    color: theme.colors.surface,
  },
  aiRow: {
    alignItems: 'flex-start',
    maxWidth: '90%',
  },
  aiText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  safetyContainer: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: `${theme.colors.danger}14`,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
    gap: theme.spacing.space4,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space8,
  },
  safetyTitle: {
    ...theme.typography.label,
    color: theme.colors.danger,
  },
  safetyText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
});
