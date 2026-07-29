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
import { TypingIndicator } from '@/components/typing-indicator';
import { NETWORK_ERROR_MESSAGE } from '@/constants/messages';
import { useEvidenceApi } from '@/hooks/use-evidence-api';
import { useInvestigationsApi } from '@/hooks/use-investigations-api';
import { useMessagesApi } from '@/hooks/use-messages-api';
import { useReportsApi } from '@/hooks/use-reports-api';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

const MAX_MESSAGE_LENGTH = 4000;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 10;
// Ventana propia para el polling del análisis — nunca reutilizar la de
// evidencia (Claude Vision, mucho más rápido). generateReport() corre
// ahora con AI_REPORT_SEARCH_TIMEOUT_MS (35s, búsqueda web de
// costo/tiempo — subido de 20s tras timeouts reales en pruebas en vivo,
// ver Decisions Log) + AI_REPORT_TIMEOUT_MS (60s) ≈ 95s de peor caso
// secuencial en el backend (más reintentos propios del SDK, no
// cubiertos acá) — 50 intentos × 3s = 150s le da un margen real de
// ~58% sobre ese peor caso (latencia de encolado del `JobsWorker`
// incluida), conservando una holgura similar a la que tenía la
// ventana original de 90s sobre los 60s de antes de agregar la
// búsqueda web. Este polling consulta `GET /investigations/{id}` (no
// un jobId) — ver el comentario sobre `ensureAnalysisPolling` más
// abajo para el porqué.
const REPORT_POLL_INTERVAL_MS = 3000;
const REPORT_MAX_POLL_ATTEMPTS = 50;

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

  const [state, setState] = useState<ScreenState>('loading');
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Solo cubre la espera de la llamada inicial `POST .../report` (un
  // par de cientos de ms) — nunca el análisis en sí. "Está analizando"
  // ya no es una bandera local separada: se deriva directamente de
  // `investigation.currentStatus === 'ANALYZING'` (ver el render más
  // abajo), la misma fuente que ya usa el badge — no pueden
  // desincronizarse porque son literalmente el mismo dato.
  const [requestingAnalysis, setRequestingAnalysis] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // `true` mientras haya un ciclo de `pollAnalysisStatus` corriendo.
  // Se consulta desde `load()` (que ya corre en cada foco de pantalla)
  // para retomar el polling solo si hace falta — nunca se asume que
  // sigue corriendo solo porque `handleAnalyze` lo arrancó una vez.
  const analysisPollActiveRef = useRef(false);
  // Se pre-completa `draft` con la descripción inicial una sola vez (si
  // todavía no hay ningún mensaje) — nunca de nuevo en refocos/polls
  // posteriores, para no pisar lo que el usuario ya haya escrito o
  // borrado (hallazgo 5, D-022).
  const prefillDoneRef = useRef(false);

  const refreshInvestigation = useCallback(async (): Promise<Investigation | null> => {
    try {
      const updated = await findOne(id);
      setInvestigation(updated);
      return updated;
    } catch {
      // El estado local queda como estaba; no es crítico si esta
      // actualización puntual falla.
      return null;
    }
  }, [id, findOne]);

  // A diferencia del polling anterior (atado a un jobId vivo solo en
  // esta closure), este consulta la fuente de verdad real —
  // `investigation.currentStatus`, vía `refreshInvestigation()` — así
  // que no importa si el ciclo se interrumpió y se retomó desde cero
  // en `load()`: el resultado es el mismo. D-015 garantiza que
  // `ANALYZING` solo sale hacia `REPORT_GENERATED` (éxito) o
  // `READY_TO_ANALYZE` (falla, recuperación RC-006) — no hace falta
  // ningún jobId para distinguir el desenlace.
  const pollAnalysisStatus = useCallback(
    (attempt = 0) => {
      // `analysisPollActiveRef` es la señal autoritativa de "seguir o
      // no" — se revisa en cada paso (no solo al arrancar) porque el
      // cleanup de `useFocusEffect` la apaga ante cualquier blur; sin
      // este chequeo, un ciclo ya en vuelo seguiría reprogramándose
      // solo, ignorando el blur, y además chocaría con un segundo
      // ciclo que `load()` arranque al recuperar el foco.
      if (!analysisPollActiveRef.current) return;
      if (attempt >= REPORT_MAX_POLL_ATTEMPTS) {
        analysisPollActiveRef.current = false;
        setSubmitError(
          'Esto está tardando más de lo esperado. Vas a ver el resultado la próxima vez que abras esta pantalla.',
        );
        return;
      }
      analysisPollTimeoutRef.current = setTimeout(() => {
        void (async () => {
          if (!analysisPollActiveRef.current) return;
          const updated = await refreshInvestigation();
          if (!analysisPollActiveRef.current) return;
          if (updated && updated.currentStatus !== 'ANALYZING') {
            analysisPollActiveRef.current = false;
            if (updated.currentStatus === 'REPORT_GENERATED') {
              router.push(`/investigation/${id}/report`);
            } else {
              setSubmitError('No pudimos generar el informe. Intenta de nuevo.');
            }
            return;
          }
          pollAnalysisStatus(attempt + 1);
        })();
      }, REPORT_POLL_INTERVAL_MS);
    },
    [refreshInvestigation, id, router],
  );

  // Único punto de entrada para arrancar el polling — tanto
  // `handleAnalyze` como `load()` pasan por acá, así que nunca hay dos
  // ciclos corriendo en paralelo (`analysisPollActiveRef`).
  const ensureAnalysisPolling = useCallback(() => {
    if (analysisPollActiveRef.current) return;
    analysisPollActiveRef.current = true;
    pollAnalysisStatus();
  }, [pollAnalysisStatus]);

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
      // Bug real encontrado en vivo: el polling anterior vivía en una
      // variable de closure (jobId) atada a un solo `setTimeout` — el
      // cleanup de `useFocusEffect` lo cancelaba ante cualquier blur de
      // pantalla (bloqueo, cambiar de app, otra pantalla) y nada lo
      // retomaba nunca. Acá, cada vez que la pantalla recupera el foco
      // y `load()` corre, se re-deriva la verdad desde el servidor: si
      // sigue `ANALYZING`, se asegura que haya un poll corriendo.
      if (investigationResult.currentStatus === 'ANALYZING') {
        ensureAnalysisPolling();
      }
      setState('ready');
    } catch {
      setState('error');
    }
  }, [id, findOne, findAllMessages, findAllEvidence, findAllVehicles, ensureAnalysisPolling]);

  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        if (analysisPollTimeoutRef.current) clearTimeout(analysisPollTimeoutRef.current);
        // Se apaga incondicionalmente (no solo si había un timeout
        // pendiente) — un paso del poll puede estar a mitad de un
        // `await refreshInvestigation()` en este momento exacto, sin
        // ningún timeout vivo que cancelar; el chequeo de esta bandera
        // dentro de `pollAnalysisStatus` es lo que realmente lo detiene.
        analysisPollActiveRef.current = false;
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
  }, [timeline.length, sending]);

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

  async function handleAnalyze() {
    setSubmitError(null);
    setRequestingAnalysis(true);
    try {
      await requestAnalysis(id);
      await refreshInvestigation();
      ensureAnalysisPolling();
    } catch (error) {
      if (error instanceof NetworkError) {
        setSubmitError(NETWORK_ERROR_MESSAGE);
      } else {
        setSubmitError('No pudimos iniciar el análisis. Intenta de nuevo.');
      }
    } finally {
      setRequestingAnalysis(false);
    }
  }

  async function handleSend() {
    setSubmitError(null);
    const text = draft.trim();
    if (text.length === 0) return;

    // Se muestra el mensaje del usuario de inmediato (optimista) en vez
    // de esperar la respuesta completa del backend — hasta ahora la
    // pantalla se quedaba sin ningún cambio visual hasta que userMessage
    // + aiMessage llegaban juntos. El `TypingIndicator` cubre la espera
    // de la respuesta de la IA; nunca streaming real (D-023).
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      investigationId: id,
      sender: 'USER',
      message: text,
      isSafetyStop: false,
      safetyMessage: null,
      quickReplies: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft('');
    setSending(true);
    try {
      const result = await send(id, text);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        result.userMessage,
        result.aiMessage,
      ]);
      await refreshInvestigation();
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
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
  // Mismo dato que ya lee `badge` — nunca puede desincronizarse del
  // header porque es literalmente la misma fuente.
  const isAnalyzing = investigation.currentStatus === 'ANALYZING';
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
          {sending ? <TypingIndicator /> : null}
        </ScrollView>

        <View style={styles.composerContainer}>
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          {blockedReason ? (
            <View style={styles.blockedRow}>
              {isAnalyzing ? (
                <ActivityIndicator size="small" color={theme.colors.actionPrimary} />
              ) : null}
              <Text style={styles.blockedText}>{blockedReason}</Text>
            </View>
          ) : investigation.currentStatus === 'READY_TO_ANALYZE' ? (
            <PrimaryButton
              label="Analizar ahora"
              onPress={() => void handleAnalyze()}
              loading={requestingAnalysis}
              disabled={requestingAnalysis}
            />
          ) : null}
          <View style={styles.composerRow}>
            <AttachmentMenu disabled={!canAttach} onPicked={handleAttachmentPicked} />
            <TextInput
              style={styles.input}
              placeholder="Escribe una respuesta..."
              placeholderTextColor={`${theme.colors.textPrimary}80`}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={MAX_MESSAGE_LENGTH}
              editable={!blockedReason && !sending}
            />
            <PrimaryButton
              label="Enviar"
              onPress={() => void handleSend()}
              loading={sending}
              disabled={!!blockedReason}
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
  blockedRow: {
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
