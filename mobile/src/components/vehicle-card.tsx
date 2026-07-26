import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

export interface VehicleCardData {
  brand: string;
  model: string;
  year: number;
  engine?: string | null;
  mileage?: number | null;
}

interface VehicleCardProps {
  vehicle: VehicleCardData;
  /** Cada pantalla envuelve esto con su propio contenedor/acciones
   *  (card oscura en Home, card clara + badge/botón en Mis
   *  Vehículos) — este componente solo resuelve la presentación
   *  compartida del vehículo en sí. */
  iconColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

function subtitle(vehicle: VehicleCardData): string | null {
  const parts: string[] = [];
  if (vehicle.engine) parts.push(vehicle.engine);
  if (vehicle.mileage != null) parts.push(`${vehicle.mileage.toLocaleString('es-CL')} km`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function VehicleCard({
  vehicle,
  iconColor = theme.colors.actionPrimary,
  titleColor = theme.colors.textPrimary,
  subtitleColor = theme.colors.textPrimary,
}: VehicleCardProps) {
  const subtitleText = subtitle(vehicle);

  return (
    <View style={styles.row}>
      <MaterialIcons name="directions-car" size={28} color={iconColor} />
      <View style={styles.texts}>
        <Text style={[styles.title, { color: titleColor }]}>
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </Text>
        {subtitleText ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitleText}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space12,
  },
  texts: {
    flex: 1,
    gap: theme.spacing.space4,
  },
  title: {
    ...theme.typography.h3,
  },
  subtitle: {
    ...theme.typography.caption,
    opacity: 0.7,
  },
});
