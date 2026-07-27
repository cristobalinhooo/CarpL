import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/api/vehicles';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { VehicleCard } from '@/components/vehicle-card';
import { NO_VEHICLES_TITLE } from '@/constants/messages';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

type ScreenState = 'loading' | 'error' | 'empty' | 'ready';

/**
 * Mis Vehículos (Figura 6): lista + entrada a "Agregar vehículo".
 * `vehicles[0]` es el activo (mismo criterio que Home, Figura 6 lo
 * explica: "el vehículo recién guardado aparece primero"). El menú
 * "..." (editar/archivar/eliminar) y el badge "Sin investigaciones" del
 * mockup quedan fuera de esta fase — dependen de datos/acciones que no
 * están en el alcance nombrado (ver plan de esta fase).
 */
export default function VehiclesScreen() {
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
        title={NO_VEHICLES_TITLE}
        description="Agrega tu primer vehículo por patente o de forma manual."
        actionLabel="Agregar vehículo"
        onAction={() => router.push('/(tabs)/vehicles/add')}
        note="Tus vehículos aparecerán acá cuando los agregues."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Mis vehículos</Text>
        <Pressable onPress={() => router.push('/(tabs)/vehicles/add')}>
          <Text style={styles.addLink}>+ Agregar</Text>
        </Pressable>
      </View>

      {vehicles.map((vehicle, index) => (
        <View key={vehicle.id} style={styles.card}>
          <VehicleCard vehicle={vehicle} />
          {index === 0 ? (
            <>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Vehículo activo</Text>
              </View>
              <PrimaryButton
                label="Nueva investigación"
                onPress={() => router.push('/investigation/new')}
              />
            </>
          ) : null}
        </View>
      ))}

      <Pressable
        style={styles.addCard}
        onPress={() => router.push('/(tabs)/vehicles/add')}>
        <MaterialIcons name="add-circle-outline" size={24} color={theme.colors.actionPrimary} />
        <Text style={styles.addCardText}>Agregar otro vehículo</Text>
      </Pressable>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  addLink: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
  },
  card: {
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.success,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: `${theme.colors.actionPrimary}66`,
    borderRadius: theme.spacing.space16,
    padding: theme.spacing.space20,
  },
  addCardText: {
    ...theme.typography.body,
    color: theme.colors.actionPrimary,
  },
});
