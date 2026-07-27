import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/api/vehicles';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { VehicleCard } from '@/components/vehicle-card';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

type ScreenState = 'loading' | 'error' | 'empty' | 'ready';

/**
 * Home (Technical Spec §12.3, Figura 7 "Dashboard"): esta fase solo
 * hace real la sección "Tu vehículo" + CTA de nueva investigación — el
 * dashboard completo del mockup también muestra "Investigación en
 * curso"/"Informe reciente", datos de `investigations`/`reports` fuera
 * del alcance nombrado de esta fase (solo `vehicles/`), diferidos a la
 * fase de Investigaciones del frontend (ver plan de esta fase).
 *
 * "Vehículo activo" no es un campo del backend: `GET /vehicles` ya
 * ordena por `createdAt desc` (Figura 6: "el vehículo recién guardado
 * aparece primero y se marca como activo"), así que `vehicles[0]` es
 * el vehículo activo por construcción, sin lógica nueva que inventar.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { findAll } = useVehiclesApi();
  const [state, setState] = useState<ScreenState>('loading');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const result = await findAll();
      setVehicles(result);
      setState(result.length > 0 ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, [findAll]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
        <Text style={styles.errorText}>No pudimos cargar tus vehículos.</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="Reintentar" onPress={() => void load()} />
        </View>
      </View>
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        icon="directions-car"
        title="Aún no tenés vehículos"
        description="Agregá tu vehículo para empezar a investigar un problema."
        actionLabel="Agregar vehículo"
        onAction={() => router.push('/(tabs)/vehicles/add')}
        note="Tu vehículo y tus investigaciones aparecerán acá cuando los agregues."
      />
    );
  }

  const activeVehicle = vehicles[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Tu vehículo</Text>
      <Pressable
        style={styles.activeCard}
        onPress={() => router.push('/(tabs)/vehicles')}>
        <VehicleCard
          vehicle={activeVehicle}
          iconColor={theme.colors.surface}
          titleColor={theme.colors.surface}
          subtitleColor={theme.colors.surface}
        />
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Vehículo activo</Text>
        </View>
      </Pressable>
      <PrimaryButton
        label="Nueva investigación"
        onPress={() => router.push('/investigation/new')}
      />
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
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  activeCard: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.spacing.space16,
    padding: theme.spacing.space20,
    gap: theme.spacing.space12,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.success}33`,
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space12,
    paddingVertical: theme.spacing.space4,
  },
  activeBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
  },
});
