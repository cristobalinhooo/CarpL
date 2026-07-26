import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import type { Evidence } from '@/api/evidence';
import { theme } from '@/theme';

interface EvidenceCardProps {
  evidence: Evidence;
}

const TYPE_ICON: Record<Evidence['evidenceType'], keyof typeof MaterialIcons.glyphMap> = {
  IMAGE: 'photo-camera',
  VIDEO: 'videocam',
  AUDIO: 'mic',
};

const TYPE_LABEL: Record<Evidence['evidenceType'], string> = {
  IMAGE: 'Foto',
  VIDEO: 'Video',
  AUDIO: 'Audio',
};

/**
 * Una evidencia en la línea de tiempo del chat (Fase 5): miniatura
 * real para `IMAGE` (vía `signedUrl`, ya firmada por el backend), o
 * ícono+etiqueta para `VIDEO`/`AUDIO`. El análisis de Claude Vision
 * corre asíncrono — mientras el job esté `PENDING`/`RUNNING` se
 * muestra un indicador; `VIDEO`/`AUDIO` nunca produce un resumen
 * (D-011 del backend, Claude solo analiza imágenes), así que ahí solo
 * se confirma la subida.
 */
export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const attachment = evidence.attachments[0];
  const isAnalyzing =
    evidence.job?.status === 'PENDING' || evidence.job?.status === 'RUNNING';
  const summary = evidence.analysisJson?.summary ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name={TYPE_ICON[evidence.evidenceType]}
          size={20}
          color={theme.colors.evidenceDefault}
        />
        <Text style={styles.label}>{TYPE_LABEL[evidence.evidenceType]} adjuntada</Text>
      </View>

      {evidence.evidenceType === 'IMAGE' && attachment ? (
        <Image source={{ uri: attachment.signedUrl }} style={styles.thumbnail} />
      ) : null}

      {isAnalyzing ? (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={theme.colors.evidenceDefault} />
          <Text style={styles.statusText}>Analizando…</Text>
        </View>
      ) : null}

      {!isAnalyzing && summary ? <Text style={styles.summary}>{summary}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
    gap: theme.spacing.space8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space8,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: theme.spacing.space8,
    backgroundColor: theme.colors.background,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space8,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  summary: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.85,
  },
});
