import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/api/vehicles';
import { theme } from '@/theme';

import { VehicleCard } from './vehicle-card';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedId: string;
  onSelect: (vehicleId: string) => void;
}

/**
 * Selector de vehículo (Figura 8, "Nueva investigación"): muestra el
 * vehículo elegido con un chevron; tocarlo despliega la lista completa
 * de vehículos reales del usuario. Mismo patrón visual de lista
 * desplegable que `BrandAutocompleteField` (Fase 3), pero de
 * selección única sobre objetos `Vehicle` reales, no texto libre.
 */
export function VehicleSelector({ vehicles, selectedId, onSelect }: VehicleSelectorProps) {
  const [expanded, setExpanded] = useState(false);
  const selected = vehicles.find((vehicle) => vehicle.id === selectedId) ?? vehicles[0];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vehículo</Text>
      <Pressable style={styles.selected} onPress={() => setExpanded((value) => !value)}>
        <View style={styles.selectedContent}>
          <VehicleCard vehicle={selected} />
        </View>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={theme.colors.textPrimary}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.list}>
          {vehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              style={styles.listRow}
              onPress={() => {
                onSelect(vehicle.id);
                setExpanded(false);
              }}>
              <VehicleCard vehicle={vehicle} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.space8,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
    borderRadius: theme.spacing.space12,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.space12,
    paddingHorizontal: theme.spacing.space16,
  },
  selectedContent: {
    flex: 1,
  },
  list: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}1A`,
    overflow: 'hidden',
  },
  listRow: {
    paddingVertical: theme.spacing.space12,
    paddingHorizontal: theme.spacing.space16,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.textPrimary}0D`,
  },
});
