import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Investigation, InvestigationStatus } from '@/api/investigations';
import type { Vehicle } from '@/api/vehicles';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { useInvestigationsApi } from '@/hooks/use-investigations-api';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

type ScreenState = 'loading' | 'error' | 'empty' | 'ready';
type FilterChip = 'ALL' | 'REPORTED' | 'IN_PROGRESS';

const IN_PROGRESS_STATUSES: InvestigationStatus[] = [
  'DRAFT',
  'ACTIVE',
  'WAITING_EVIDENCE',
  'READY_TO_ANALYZE',
  'ANALYZING',
];

/** Figura 17: solo 3 etiquetas de estado, sin distinguir entre los 5
 *  estados "en curso" — ese detalle vive en el Chat/Informe, no acá. */
function statusBadge(status: InvestigationStatus): { label: string; color: string } {
  if (status === 'REPORT_GENERATED') {
    return { label: 'Informe disponible', color: theme.colors.success };
  }
  if (status === 'CLOSED') {
    return { label: 'Archivado', color: theme.colors.textPrimary };
  }
  return { label: 'Investigando', color: theme.colors.warning };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Historial (Figura 17, Technical Spec §12.3): lista cronológica,
 * buscable y filtrable. Sigue exactamente el mockup real (fecha +
 * título + vehículo + etiqueta de estado) — sin nivel de urgencia ni
 * versión del informe, que dependerían de `reports/` (hallazgo 4 del
 * plan de esta fase). `GET /investigations` no incluye el vehículo
 * relacionado (hallazgo 7): se cruza por `vehicleId` contra `GET
 * /vehicles`, ya construido en Fase 3.
 */
export default function HistoryScreen() {
  const router = useRouter();
  const { findAll: findAllInvestigations } = useInvestigationsApi();
  const { findAll: findAllVehicles } = useVehiclesApi();

  const [state, setState] = useState<ScreenState>('loading');
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [vehiclesById, setVehiclesById] = useState<Map<string, Vehicle>>(new Map());
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState<FilterChip>('ALL');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [investigationsResult, vehiclesResult] = await Promise.all([
        findAllInvestigations(),
        findAllVehicles(),
      ]);
      setInvestigations(investigationsResult);
      setVehiclesById(new Map(vehiclesResult.map((vehicle) => [vehicle.id, vehicle])));
      setState(investigationsResult.length > 0 ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, [findAllInvestigations, findAllVehicles]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return investigations.filter((investigation) => {
      if (activeChip === 'REPORTED' && investigation.currentStatus !== 'REPORT_GENERATED') {
        return false;
      }
      if (
        activeChip === 'IN_PROGRESS' &&
        !IN_PROGRESS_STATUSES.includes(investigation.currentStatus)
      ) {
        return false;
      }
      if (query.length > 0 && !investigation.title.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [investigations, activeChip, search]);

  function handlePress(investigation: Investigation) {
    const isReported =
      investigation.currentStatus === 'REPORT_GENERATED' ||
      investigation.currentStatus === 'CLOSED';
    router.push(
      isReported
        ? `/investigation/${investigation.id}/report`
        : `/investigation/${investigation.id}/chat`,
    );
  }

  if (state === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No pudimos cargar tu historial.</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="Reintentar" onPress={() => void load()} />
        </View>
      </View>
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        icon="history"
        title="Aún no tienes investigaciones"
        description="Cuando notes un comportamiento inusual, inicia una investigación."
        actionLabel="Nueva investigación"
        onAction={() => router.push('/investigation/new')}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Historial</Text>

      <TextInput
        style={styles.search}
        placeholder="Buscar investigación"
        placeholderTextColor={`${theme.colors.textPrimary}80`}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.chips}>
        {(
          [
            { key: 'ALL', label: 'Todos' },
            { key: 'REPORTED', label: 'Con informe' },
            { key: 'IN_PROGRESS', label: 'En curso' },
          ] as const
        ).map((chip) => (
          <Pressable
            key={chip.key}
            style={[styles.chip, activeChip === chip.key && styles.chipActive]}
            onPress={() => setActiveChip(chip.key)}>
            <Text
              style={[styles.chipText, activeChip === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.noResults}>Sin coincidencias.</Text>
      ) : (
        filtered.map((investigation) => {
          const vehicle = vehiclesById.get(investigation.vehicleId);
          const badge = statusBadge(investigation.currentStatus);
          return (
            <Pressable
              key={investigation.id}
              style={styles.card}
              onPress={() => handlePress(investigation)}>
              <Text style={styles.date}>{formatDate(investigation.createdAt)}</Text>
              <Text style={styles.itemTitle}>{investigation.title}</Text>
              {vehicle ? (
                <Text style={styles.vehicle}>
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </Text>
              ) : null}
              <View style={[styles.badge, { backgroundColor: `${badge.color}33` }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
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
    padding: theme.spacing.space24,
    gap: theme.spacing.space16,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  search: {
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
    borderRadius: theme.spacing.space12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space12,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    gap: theme.spacing.space8,
  },
  chip: {
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space8,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.actionPrimary,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  chipTextActive: {
    color: theme.colors.surface,
  },
  noResults: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.7,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space16,
    padding: theme.spacing.space20,
    gap: theme.spacing.space4,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.6,
  },
  itemTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  vehicle: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space12,
    paddingVertical: theme.spacing.space4,
    marginTop: theme.spacing.space8,
  },
  badgeText: {
    ...theme.typography.caption,
  },
});
