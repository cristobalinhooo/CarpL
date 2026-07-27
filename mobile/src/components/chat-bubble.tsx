import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Message } from '@/api/messages';
import { theme } from '@/theme';

interface ChatBubbleProps {
  message: Message;
  /** Solo se pasa para el último mensaje de la IA en el timeline — una
   * pregunta ya respondida no sigue "abierta" (D-023/quick replies). */
  onQuickReply?: (text: string) => void;
}

/**
 * Un mensaje del chat (Figura 9): burbuja azul a la derecha para el
 * usuario, texto plano a la izquierda para la IA. `isSafetyStop` gana
 * su propio estilo de advertencia (Fase 5: primera pantalla que
 * renderiza esta señal, ya persistida desde la Fase 5 original del
 * backend) — sin bloquear nada más, el backend mismo no define
 * todavía ninguna acción especial ahí. `quickReplies` (D-023) son
 * sugerencia, nunca bloqueante: tocar un chip solo completa el campo
 * de mensaje (`onQuickReply`), nunca envía nada por sí solo — mismo
 * principio que los chips de "problemas comunes" (D-022).
 */
export function ChatBubble({ message, onQuickReply }: ChatBubbleProps) {
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
      {onQuickReply && message.quickReplies.length > 0 ? (
        <View style={styles.quickReplies}>
          {message.quickReplies.map((reply) => (
            <Pressable
              key={reply}
              style={styles.quickReplyChip}
              onPress={() => onQuickReply(reply)}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
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
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.space8,
    marginTop: theme.spacing.space8,
  },
  quickReplyChip: {
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
  },
  quickReplyText: {
    ...theme.typography.label,
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
