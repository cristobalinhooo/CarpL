import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Investigation } from '@/api/investigations';
import type {
  CostEstimate,
  EvidenceCompatibility,
  Report,
  RepairTimeEstimate,
  ReportHypothesis,
  UrgencyLevel,
} from '@/api/reports';
import type { Vehicle } from '@/api/vehicles';
import { HeaderBackButton } from '@/components/header-back-button';
import { PrimaryButton } from '@/components/primary-button';
import { useInvestigationsApi } from '@/hooks/use-investigations-api';
import { useReportsApi } from '@/hooks/use-reports-api';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

type ScreenState = 'loading' | 'error' | 'ready';

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  LOW: 'Baja',
  MODERATE: 'Moderada',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

// El theme solo tiene 3 colores semánticos de estado (success/warning/
// danger) para 4 niveles de urgencia — HIGH y CRITICAL comparten
// `danger`; CRITICAL se distingue con el banner de `safetyWarning`.
const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  LOW: theme.colors.success,
  MODERATE: theme.colors.warning,
  HIGH: theme.colors.danger,
  CRITICAL: theme.colors.danger,
};

const COMPATIBILITY_LABEL: Record<EvidenceCompatibility, string> = {
  VERY_COMPATIBLE: 'Muy compatible',
  COMPATIBLE: 'Compatible',
  PARTIALLY_COMPATIBLE: 'Parcialmente compatible',
  LOW_COMPATIBILITY: 'Poco compatible',
  INSUFFICIENT_EVIDENCE: 'Sin evidencia suficiente',
};

const COMPATIBILITY_COLOR: Record<EvidenceCompatibility, string> = {
  VERY_COMPATIBLE: theme.colors.hypothesisDefault,
  COMPATIBLE: theme.colors.hypothesisDefault,
  PARTIALLY_COMPATIBLE: theme.colors.warning,
  LOW_COMPATIBILITY: theme.colors.warning,
  INSUFFICIENT_EVIDENCE: theme.colors.textPrimary,
};

const RELATIVE_LEVEL_LABEL: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
};

function formatCost(cost: CostEstimate): string {
  if (!cost.available) {
    return 'No hay información suficiente todavía para estimar un costo.';
  }
  const parts: string[] = [];
  if (cost.approximateRange) {
    const { min, max, currency } = cost.approximateRange;
    parts.push(`${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`);
  } else if (cost.relativeLevel) {
    parts.push(RELATIVE_LEVEL_LABEL[cost.relativeLevel]);
  }
  if (cost.disclaimer) parts.push(cost.disclaimer);
  return parts.join(' — ');
}

function formatRepairTime(repair: RepairTimeEstimate): string {
  if (!repair.available) {
    return 'No hay información suficiente todavía para estimar un tiempo de reparación.';
  }
  const parts: string[] = [];
  if (repair.approximateRange) {
    const { min, max } = repair.approximateRange;
    parts.push(`${min} - ${max} horas`);
  } else if (repair.relativeLevel) {
    parts.push(RELATIVE_LEVEL_LABEL[repair.relativeLevel]);
  }
  if (repair.disclaimer) parts.push(repair.disclaimer);
  return parts.join(' — ');
}

/**
 * Detalle de una hipótesis (Figura 16), como acordeón dentro de la
 * MISMA pantalla — §12.3 solo lista una fila ("Informe final"), no una
 * segunda pantalla de detalle. Solo muestra lo que le pertenece según
 * el schema real (`report-json.schema.ts`): "Qué revisar primero",
 * costo y limitaciones son campos del INFORME completo, no de cada
 * hipótesis (a diferencia de lo que sugiere la Figura 16) — se
 * muestran una sola vez, más abajo en la pantalla.
 */
function HypothesisCard({
  index,
  hypothesis,
}: {
  index: number;
  hypothesis: ReportHypothesis;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = COMPATIBILITY_COLOR[hypothesis.compatibility];

  return (
    <Pressable style={styles.hypothesisCard} onPress={() => setExpanded((v) => !v)}>
      <View style={styles.hypothesisHeader}>
        <View style={[styles.compatibilityBadge, { backgroundColor: `${color}33` }]}>
          <Text style={[styles.compatibilityBadgeText, { color }]}>
            {COMPATIBILITY_LABEL[hypothesis.compatibility]}
          </Text>
        </View>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={22}
          color={theme.colors.textPrimary}
        />
      </View>
      <Text style={styles.hypothesisName}>
        Posible causa {index}: {hypothesis.name}
      </Text>

      {expanded ? (
        <View style={styles.hypothesisDetail}>
          <Text style={styles.detailLabel}>Qué es</Text>
          <Text style={styles.bodyText}>{hypothesis.whatIsIt}</Text>

          <Text style={styles.detailLabel}>Por qué podría estar ocurriendo</Text>
          <Text style={styles.bodyText}>{hypothesis.whyItMightBeHappening}</Text>

          {hypothesis.supportingEvidence.length > 0 ? (
            <>
              <Text style={styles.detailLabel}>Evidencia que respalda</Text>
              {hypothesis.supportingEvidence.map((e, i) => (
                <Text key={i} style={styles.bodyText}>
                  • {e.description}
                </Text>
              ))}
            </>
          ) : null}

          {hypothesis.contradictingEvidence.length > 0 ? (
            <>
              <Text style={styles.detailLabel}>Evidencia que contradice</Text>
              {hypothesis.contradictingEvidence.map((e, i) => (
                <Text key={i} style={styles.bodyText}>
                  • {e.description}
                </Text>
              ))}
            </>
          ) : null}

          {hypothesis.missingInformation.length > 0 ? (
            <>
              <Text style={styles.detailLabel}>Qué información falta</Text>
              {hypothesis.missingInformation.map((m, i) => (
                <Text key={i} style={styles.bodyText}>
                  • {m}
                </Text>
              ))}
            </>
          ) : null}

          {hypothesis.likelyPartsInvolved.length > 0 ? (
            <>
              <Text style={styles.detailLabel}>Piezas probablemente involucradas</Text>
              <Text style={styles.bodyText}>{hypothesis.likelyPartsInvolved.join(', ')}</Text>
            </>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { findOne } = useInvestigationsApi();
  const { findAll: findAllVehicles } = useVehiclesApi();
  const { getLatest } = useReportsApi();

  const [state, setState] = useState<ScreenState>('loading');
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [showSimplified, setShowSimplified] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [investigationResult, vehiclesResult, reportResult] = await Promise.all([
        findOne(id),
        findAllVehicles(),
        getLatest(id),
      ]);
      setInvestigation(investigationResult);
      setVehicle(vehiclesResult.find((v) => v.id === investigationResult.vehicleId) ?? null);
      setReport(reportResult);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [id, findOne, findAllVehicles, getLatest]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (state === 'loading') {
    return (
      <>
        <Stack.Screen options={{ title: 'Informe', headerLeft: () => <HeaderBackButton /> }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
        </View>
      </>
    );
  }

  if (state === 'error' || !investigation || !report) {
    return (
      <>
        <Stack.Screen options={{ title: 'Informe', headerLeft: () => <HeaderBackButton /> }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No pudimos cargar el informe.</Text>
          <View style={styles.retryButton}>
            <PrimaryButton label="Reintentar" onPress={() => void load()} />
          </View>
        </View>
      </>
    );
  }

  const data = report.reportJson;
  const urgencyColor = URGENCY_COLOR[data.urgency.level];
  const hasFlags =
    data.flags.insufficientEvidence ||
    data.flags.contradictoryEvidence ||
    data.flags.multipleIndependentProblems;

  return (
    <>
      <Stack.Screen options={{ title: 'Informe', headerLeft: () => <HeaderBackButton /> }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.versionBadge}>
          <Text style={styles.versionBadgeText}>Informe · Versión {report.reportVersion}</Text>
        </View>
        <Text style={styles.title}>{investigation.title}</Text>
        {vehicle ? (
          <Text style={styles.subtitle}>
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </Text>
        ) : null}

        {data.urgency.level === 'CRITICAL' && data.urgency.safetyWarning ? (
          <View style={styles.safetyBanner}>
            <MaterialIcons name="warning" size={20} color={theme.colors.surface} />
            <Text style={styles.safetyBannerText}>{data.urgency.safetyWarning}</Text>
          </View>
        ) : null}

        {hasFlags ? (
          <View style={styles.flagsCard}>
            {data.flags.insufficientEvidence ? (
              <Text style={styles.flagText}>
                La evidencia recopilada todavía es insuficiente para conclusiones más firmes.
              </Text>
            ) : null}
            {data.flags.contradictoryEvidence ? (
              <Text style={styles.flagText}>Hay evidencia contradictoria en este caso.</Text>
            ) : null}
            {data.flags.multipleIndependentProblems ? (
              <Text style={styles.flagText}>
                Podrían ser varios problemas independientes entre sí.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.urgencyCard, { borderColor: urgencyColor }]}>
          <Text style={[styles.urgencyLabel, { color: urgencyColor }]}>Nivel de urgencia</Text>
          <Text style={styles.urgencyLevel}>{URGENCY_LABEL[data.urgency.level]}</Text>
          <Text style={styles.bodyText}>{data.urgency.explanation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Resumen general</Text>
          <Text style={styles.bodyText}>{data.summary}</Text>
        </View>

        <View style={styles.hypothesesSection}>
          <Text style={styles.sectionLabel}>Posibles causas</Text>
          {data.hypotheses.map((hypothesis, index) => (
            <HypothesisCard key={hypothesis.hypothesisId} index={index + 1} hypothesis={hypothesis} />
          ))}
        </View>

        {data.whatToCheckFirst.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Qué revisar primero</Text>
            {data.whatToCheckFirst.map((item, i) => (
              <Text key={i} style={styles.bodyText}>
                • {item}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Costo aproximado</Text>
          <Text style={styles.bodyText}>{formatCost(data.costEstimate)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Tiempo estimado de reparación</Text>
          <Text style={styles.bodyText}>{formatRepairTime(data.estimatedRepairTime)}</Text>
        </View>

        {data.limitations.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Limitaciones</Text>
            {data.limitations.map((item, i) => (
              <Text key={i} style={styles.bodyText}>
                • {item}
              </Text>
            ))}
          </View>
        ) : null}

        {data.referencedDocuments.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Documentación de referencia</Text>
            {data.referencedDocuments.map((doc) => (
              <Text key={doc.chunkId} style={styles.bodyText}>
                {doc.title} ({doc.sourceType}) — {doc.citedIn}
              </Text>
            ))}
          </View>
        ) : null}

        <Pressable
          style={styles.simplifyButton}
          onPress={() => setShowSimplified((v) => !v)}>
          <Text style={styles.simplifyButtonText}>
            {showSimplified ? 'Ocultar explicación fácil' : 'Explícamelo fácil'}
          </Text>
        </Pressable>
        {showSimplified ? (
          <View style={styles.card}>
            <Text style={styles.bodyText}>{data.simplifiedExplanation}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Seguir investigando"
            onPress={() => router.push(`/investigation/${id}/chat`)}
          />
          <Pressable
            style={styles.secondaryAction}
            onPress={() => router.push('/investigation/new')}>
            <Text style={styles.secondaryActionText}>Iniciar investigación nueva</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
  content: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.space16,
    gap: theme.spacing.space12,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.actionPrimary}1A`,
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space12,
    paddingVertical: theme.spacing.space4,
  },
  versionBadgeText: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space8,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
  },
  safetyBannerText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    flex: 1,
  },
  flagsCard: {
    backgroundColor: `${theme.colors.warning}14`,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
    gap: theme.spacing.space4,
  },
  flagText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
  },
  urgencyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    borderWidth: 1,
    padding: theme.spacing.space16,
    gap: theme.spacing.space4,
  },
  urgencyLabel: {
    ...theme.typography.label,
  },
  urgencyLevel: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
    gap: theme.spacing.space8,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  hypothesesSection: {
    gap: theme.spacing.space8,
  },
  hypothesisCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    padding: theme.spacing.space16,
    gap: theme.spacing.space8,
  },
  hypothesisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compatibilityBadge: {
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space12,
    paddingVertical: theme.spacing.space4,
  },
  compatibilityBadgeText: {
    ...theme.typography.label,
  },
  hypothesisName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  hypothesisDetail: {
    gap: theme.spacing.space4,
    paddingTop: theme.spacing.space8,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.textPrimary}1A`,
  },
  detailLabel: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    opacity: 0.7,
    marginTop: theme.spacing.space8,
  },
  simplifyButton: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
    borderRadius: theme.spacing.space12,
    paddingVertical: theme.spacing.space16,
    alignItems: 'center',
  },
  simplifyButtonText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  actions: {
    gap: theme.spacing.space12,
    marginTop: theme.spacing.space12,
  },
  secondaryAction: {
    alignItems: 'center',
    paddingVertical: theme.spacing.space12,
  },
  secondaryActionText: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
  },
});
