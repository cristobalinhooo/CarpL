import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NetworkError } from '@/api/client';
import type { Evidence, EvidenceType } from '@/api/evidence';
import type { Investigation, InvestigationStatus } from '@/api/investigations';
import type { Message } from '@/api/messages';
import type { Vehicle } from '@/api/vehicles';
import { AttachmentMenu } from '@/components/attachment-menu';
import { ChatBubble } from '@/components/chat-bubble';
import { EvidenceCard } from '@/components/evidence-card';
import { HeaderBackButton } from '@/components/header-back-button';
import { PrimaryButton } from '@/components/primary-button';
import { NETWORK_ERROR_MESSAGE } from '@/constants/messages';
import { useEvidenceApi } from '@/hooks/use-evidence-api';
import { useInvestigationsApi } from '@/hooks/use-investigations-api';
import { useJobsApi } from '@/hooks/use-jobs-api';
import { useMessagesApi } from '@/hooks/use-messages-api';
import { useReportsApi } from '@/hooks/use-reports-api';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

const MAX_MESSAGE_LENGTH = 4000;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 10;
// Ventana propia para el polling del informe — nunca reutilizar la de
// evidencia (Claude Vision, mucho más rápido). generateReport() corre
// con AI_REPORT_TIMEOUT_MS = 60s en el backend (más reintentos propios
// del SDK, no cubiertos acá) — 30 intentos × 3s = 90s le da un margen
// real de +50% sobre esos 60s (latencia de encolado del `JobsWorker`
// incluida), en vez de apenas empatarlo.
const REPORT_POLL_INTERVAL_MS = 3000;
const REPORT_MAX_POLL_ATTEMPTS = 30;

// Réplica exacta de MessagesService.sendMessage/EvidenceService.uploadEvidence
// (hallazgo 5 del plan de esta fase) — WAITING_EVIDENCE bloquea mensajes
// pero no adjuntar, precisamente porque ese estado existe para exigir
// evidencia, no conversación.
const MESSAGE_ALLOWED_STATUSES: InvestigationStatus[] = [
  'ACTIVE',
  'READY_TO_ANALYZE',
  'REPORT_GENERATED',
];
const EVIDENCE_ALLOWED_STATUSES: InvestigationStatus[] = [
  'ACTIVE',
  'WAITING_EVIDENCE',
  'READY_TO_ANALYZE',
  'REPORT_GENERATED',
];

function statusBadge(status: InvestigationStatus): { label: string; color: string } {
  if (status === 'REPORT_GENERATED') {
    return { label: 'Informe disponible', color: theme.colors.success };
  }
  if (status === 'READY_TO_ANALYZE') {
    return { label: 'Listo para analizar', color: theme.colors.success };
  }
  if (status === 'ANALYZING') {
    return { label: 'Generando informe', color: theme.colors.warning };
  }
  if (status === 'CLOSED') {
    return { label: 'Archivado', color: theme.colors.textPrimary };
  }
  return { label: 'Investigando', color: theme.colors.warning };
}

function messageBlockedReason(status: InvestigationStatus): string | null {
  if (MESSAGE_ALLOWED_STATUSES.includes(status)) return null;
  switch (status) {
    case 'WAITING_EVIDENCE':
      return 'Este caso está esperando evidencia adicional — no se pueden enviar mensajes hasta entonces.';
    case 'ANALYZING':
      return 'Estamos generando el informe de este caso.';
    case 'CLOSED':
      return 'Este caso está cerrado.';
    default:
      return 'No se pueden enviar mensajes en este estado.';
  }
}

type TimelineItem =
  | { kind: 'message'; id: string; timestamp: string; message: Message }
  | { kind: 'evidence'; id: string; timestamp: string; evidence: Evidence };

type ScreenState = 'loading' | 'error' | 'ready';

/**
 * Chat de investigación (Figura 9, Technical Spec §12.3): conversación
 * + evidencia en una sola línea de tiempo cronológica. Sin "Ver caso"
 * (fase futura). "Analizar ahora" (Fase 7 frontend) aparece junto al
 * composer cuando `currentStatus === 'READY_TO_ANALYZE'` — no lo
 * reemplaza, porque ese estado sigue permitiendo seguir conversando
 * (D-012); "Ver informe" aparece en el header cuando ya existe uno
 * (`REPORT_GENERATED`). La descripción inicial (Fase 4) pre-completa
 * el campo de mensaje (una sola vez, si todavía no hay mensajes) en
 * vez de mostrarse duplicada como tarjeta fija (D-022) — sigue siendo
 * editable y nunca se envía sola: el usuario tiene que tocar "Enviar"
 * igual que con cualquier otro mensaje, nunca como mensaje de IA
 * fantasma (hallazgo 1) — ningún mensaje con costo se envía sin que el
 * usuario lo confirme.
 */
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // `behavior="padding"` por sí solo no compensa el header nativo del
  // Stack (expo-router usa @react-navigation/native-stack: el header
  // vive fuera del árbol de vistas de JS, así que KeyboardAvoidingView
  // mide su propio frame sin saber cuánto ocupa) — en iOS esto dejaba
  // el teclado tapando el input entero, no solo desplazado. Se corrige
  // con keyboardVerticalOffset={headerHeight}, patrón recomendado por
  // la doc de react-navigation para esta combinación exacta.
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { findOne } = useInvestigationsApi();
  const { findAll: findAllMessages, send } = useMessagesApi();
  const { findAll: findAllEvidence, upload } = useEvidenceApi();
  const { findAll: findAllVehicles } = useVehiclesApi();
  const { requestAnalysis } = useReportsApi();
  const { getStatus: getJobStatus } = useJobsApi();

  const [state, setState] = useState<ScreenState>('loading');
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Se pre-completa `draft` con la descripción inicial una sola vez (si
  // todavía no hay ningún mensaje) — nunca de nuevo en refocos/polls
  // posteriores, para no pisar lo que el usuario ya haya escrito o
  // borrado (hallazgo 5, D-022).
  const prefillDoneRef = useRef(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [investigationResult, messagesResult, evidenceResult, vehiclesResult] =
        await Promise.all([
          findOne(id),
          findAllMessages(id),
          findAllEvidence(id),
          findAllVehicles(),
        ]);
      setInvestigation(investigationResult);
      setMessages(messagesResult);
      setEvidenceList(evidenceResult);
      setVehicle(vehiclesResult.find((v) => v.id === investigationResult.vehicleId) ?? null);
      if (!prefillDoneRef.current) {
        prefillDoneRef.current = true;
        if (messagesResult.length === 0) {
          setDraft(investigationResult.description);
        }
      }
      setState('ready');
    } catch {
      setState('error');
    }
  }, [id, findOne, findAllMessages, findAllEvidence, findAllVehicles]);

  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        if (reportPollTimeoutRef.current) clearTimeout(reportPollTimeoutRef.current);
      };
    }, [load]),
  );

  const timeline: TimelineItem[] = [
    ...messages.map((message) => ({
      kind: 'message' as const,
      id: message.id,
      timestamp: message.createdAt,
      message,
    })),
    ...evidenceList.map((evidence) => ({
      kind: 'evidence' as const,
      id: evidence.id,
      timestamp: evidence.uploadedAt,
      evidence,
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [timeline.length]);

  async function refreshInvestigation() {
    try {
      const updated = await findOne(id);
      setInvestigation(updated);
    } catch {
      // El estado local queda como estaba; no es crítico si esta
      // actualización puntual falla.
    }
  }

  function pollEvidenceUntilDone(attempt = 0) {
    if (attempt >= MAX_POLL_ATTEMPTS) return;
    pollTimeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          const updated = await findAllEvidence(id);
          setEvidenceList(updated);
          const stillProcessing = updated.some(
            (e) => e.job?.status === 'PENDING' || e.job?.status === 'RUNNING',
          );
          if (stillProcessing) pollEvidenceUntilDone(attempt + 1);
        } catch {
          // Se deja de reintentar silenciosamente; el próximo enfoque
          // de la pantalla vuelve a traer el estado real.
        }
      })();
    }, POLL_INTERVAL_MS);
  }

  // Mismo patrón recursivo que `pollEvidenceUntilDone`. En `FAILED`, el
  // backend ya devolvió la investigación a `READY_TO_ANALYZE` (D-015
  // punto 2) — pero eso recién se reflejaría en un reload; acá se
  // refleja al toque bajando `analyzing` a `false` (nunca se tocó
  // `investigation.currentStatus`, así que el botón "Analizar ahora"
  // reaparece de inmediato en la misma pantalla).
  function pollReportJob(jobId: string, attempt = 0) {
    if (attempt >= REPORT_MAX_POLL_ATTEMPTS) {
      setAnalyzing(false);
      setSubmitError('El análisis está tardando más de lo esperado. Intenta de nuevo en un momento.');
      return;
    }
    reportPollTimeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          const job = await getJobStatus(jobId);
          if (job.status === 'DONE') {
            setAnalyzing(false);
            router.push(`/investigation/${id}/report`);
          } else if (job.status === 'FAILED') {
            setAnalyzing(false);
            setSubmitError('No pudimos generar el informe. Intenta de nuevo.');
          } else {
            pollReportJob(jobId, attempt + 1);
          }
        } catch {
          pollReportJob(jobId, attempt + 1);
        }
      })();
    }, REPORT_POLL_INTERVAL_MS);
  }

  async function handleAnalyze() {
    setSubmitError(null);
    setAnalyzing(true);
    try {
      const { jobId } = await requestAnalysis(id);
      pollReportJob(jobId);
    } catch (error) {
      setAnalyzing(false);
      if (error instanceof NetworkError) {
        setSubmitError(NETWORK_ERROR_MESSAGE);
      } else {
        setSubmitError('No pudimos iniciar el análisis. Intenta de nuevo.');
      }
    }
  }

  async function handleSend() {
    setSubmitError(null);
    if (draft.trim().length === 0) return;

    setSending(true);
    try {
      const result = await send(id, draft.trim());
      setMessages((prev) => [...prev, result.userMessage, result.aiMessage]);
      setDraft('');
      await refreshInvestigation();
    } catch (error) {
      if (error instanceof NetworkError) {
        setSubmitError(NETWORK_ERROR_MESSAGE);
      } else {
        setSubmitError('No pudimos enviar el mensaje. Intenta de nuevo.');
      }
    } finally {
      setSending(false);
    }
  }

  async function handleAttachmentPicked(
    evidenceType: EvidenceType,
    file: { uri: string; mimeType: string; fileName: string },
  ) {
    setSubmitError(null);
    try {
      await upload(id, { evidenceType, file });
      const updated = await findAllEvidence(id);
      setEvidenceList(updated);
      await refreshInvestigation();
      pollEvidenceUntilDone();
    } catch (error) {
      if (error instanceof NetworkError) {
        setSubmitError(NETWORK_ERROR_MESSAGE);
      } else {
        setSubmitError('No pudimos subir la evidencia. Intenta de nuevo.');
      }
    }
  }

  const title = investigation?.title ?? 'Investigación';

  if (state === 'loading') {
    return (
      <>
        <Stack.Screen options={{ title, headerLeft: () => <HeaderBackButton /> }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
        </View>
      </>
    );
  }

  if (state === 'error' || !investigation) {
    return (
      <>
        <Stack.Screen options={{ title, headerLeft: () => <HeaderBackButton /> }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No pudimos cargar esta investigación.</Text>
          <View style={styles.retryButton}>
            <PrimaryButton label="Reintentar" onPress={() => void load()} />
          </View>
        </View>
      </>
    );
  }

  const badge = statusBadge(investigation.currentStatus);
  const blockedReason = messageBlockedReason(investigation.currentStatus);
  const canAttach = EVIDENCE_ALLOWED_STATUSES.includes(investigation.currentStatus);
  // Los quick replies solo tienen sentido en la última pregunta todavía
  // "abierta" — un mensaje de la IA más antiguo ya quedó respondido.
  const lastAiMessageId = [...messages].reverse().find((m) => m.sender === 'AI')?.id;

  return (
    <>
      <Stack.Screen options={{ title, headerLeft: () => <HeaderBackButton /> }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: `${badge.color}33` }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          {vehicle ? (
            <Text style={styles.vehicleText}>
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </Text>
          ) : null}
          {investigation.currentStatus === 'REPORT_GENERATED' ? (
            <Pressable
              style={styles.viewReportLink}
              onPress={() => router.push(`/investigation/${id}/report`)}>
              <Text style={styles.viewReportLinkText}>Ver informe</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
          {timeline.length === 0 ? (
            <Text style={styles.hintText}>
              Escribe tu primer mensaje para que la IA empiece a investigar.
            </Text>
          ) : (
            timeline.map((item) =>
              item.kind === 'message' ? (
                <ChatBubble
                  key={item.id}
                  message={item.message}
                  onQuickReply={
                    !blockedReason && item.message.id === lastAiMessageId
                      ? setDraft
                      : undefined
                  }
                />
              ) : (
                <EvidenceCard key={item.id} evidence={item.evidence} />
              ),
            )
          )}
        </ScrollView>

        <View style={styles.composerContainer}>
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          {blockedReason ? <Text style={styles.blockedText}>{blockedReason}</Text> : null}
          {analyzing ? (
            <View style={styles.analyzingRow}>
              <ActivityIndicator color={theme.colors.actionPrimary} />
              <Text style={styles.blockedText}>Estamos generando el informe de este caso.</Text>
            </View>
          ) : investigation.currentStatus === 'READY_TO_ANALYZE' ? (
            <PrimaryButton label="Analizar ahora" onPress={() => void handleAnalyze()} />
          ) : null}
          <View style={styles.composerRow}>
            <AttachmentMenu disabled={!canAttach || analyzing} onPicked={handleAttachmentPicked} />
            <TextInput
              style={styles.input}
              placeholder="Escribe una respuesta..."
              placeholderTextColor={`${theme.colors.textPrimary}80`}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={MAX_MESSAGE_LENGTH}
              editable={!blockedReason && !sending && !analyzing}
            />
            <PrimaryButton
              label="Enviar"
              onPress={() => void handleSend()}
              loading={sending}
              disabled={!!blockedReason || analyzing}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.space24,
    gap: theme.spacing.space16,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space12,
    padding: theme.spacing.space16,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.textPrimary}1A`,
  },
  badge: {
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space12,
    paddingVertical: theme.spacing.space4,
  },
  badgeText: {
    ...theme.typography.caption,
  },
  vehicleText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  viewReportLink: {
    marginLeft: 'auto',
  },
  viewReportLinkText: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.space16,
    gap: theme.spacing.space12,
  },
  hintText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.6,
    textAlign: 'center',
    paddingVertical: theme.spacing.space24,
  },
  composerContainer: {
    padding: theme.spacing.space16,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.textPrimary}1A`,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.space8,
  },
  submitError: {
    ...theme.typography.caption,
    color: theme.colors.danger,
  },
  blockedText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space8,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.space8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
    borderRadius: theme.spacing.space12,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space12,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
});
