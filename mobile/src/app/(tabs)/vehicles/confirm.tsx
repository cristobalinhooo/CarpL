import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { VehicleTechnicalData } from '@/api/vehicles';
import { NetworkError } from '@/api/client';
import { BrandAutocompleteField } from '@/components/brand-autocomplete-field';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import {
  INVALID_BRAND_MESSAGE,
  INVALID_MODEL_MESSAGE,
  INVALID_YEAR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  VEHICLE_SAVE_ERROR_MESSAGE,
} from '@/constants/messages';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

const CURRENT_YEAR = new Date().getFullYear();

function parseRecovered(raw: string | string[] | undefined): VehicleTechnicalData | null {
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as VehicleTechnicalData;
  } catch {
    return null;
  }
}

/**
 * Confirmar datos del vehículo (Technical Spec §12.3/§13.5): "Nueva.
 * Se muestra solo tras una búsqueda por patente exitosa; presenta los
 * campos recuperados, todos editables, antes de guardar." Con el
 * adaptador nulo del backend esta pantalla nunca se alcanza en la
 * práctica hoy (la búsqueda siempre cae a manual) — se construye igual
 * para cuando exista un proveedor real (Fase 3b).
 */
export default function ConfirmVehicleScreen() {
  const router = useRouter();
  const { create } = useVehiclesApi();
  const params = useLocalSearchParams<{ data?: string; plate?: string }>();
  const recovered = parseRecovered(params.data);

  const [brand, setBrand] = useState(recovered?.brand ?? '');
  const [model, setModel] = useState(recovered?.model ?? '');
  const [year, setYear] = useState(recovered ? String(recovered.year) : '');
  const [version, setVersion] = useState(recovered?.version ?? '');
  const [engine, setEngine] = useState(recovered?.engine ?? '');
  const [displacement, setDisplacement] = useState(recovered?.displacement ?? '');
  const [fuelType, setFuelType] = useState(recovered?.fuelType ?? '');
  const [transmission, setTransmission] = useState(recovered?.transmission ?? '');
  const [traction, setTraction] = useState(recovered?.traction ?? '');
  const [vin, setVin] = useState(recovered?.vin ?? '');
  const [plate, setPlate] = useState(
    typeof params.plate === 'string' ? params.plate : '',
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (brand.trim().length === 0) errors.brand = INVALID_BRAND_MESSAGE;
    if (model.trim().length === 0) errors.model = INVALID_MODEL_MESSAGE;

    const yearNumber = Number(year);
    if (!year.trim() || !Number.isInteger(yearNumber)) {
      errors.year = INVALID_YEAR_MESSAGE;
    } else if (yearNumber < 1900 || yearNumber > CURRENT_YEAR + 1) {
      errors.year = `El año debe estar entre 1900 y ${CURRENT_YEAR + 1}.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      await create({
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        version: version.trim() || undefined,
        engine: engine.trim() || undefined,
        displacement: displacement.trim() || undefined,
        fuelType: fuelType.trim() || undefined,
        transmission: transmission.trim() || undefined,
        traction: traction.trim() || undefined,
        vin: vin.trim() || undefined,
        plate: plate.trim() || undefined,
      });
      router.replace('/(tabs)/vehicles');
    } catch (error) {
      if (error instanceof NetworkError) {
        setSubmitError(NETWORK_ERROR_MESSAGE);
      } else {
        setSubmitError(VEHICLE_SAVE_ERROR_MESSAGE);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Confirmar datos' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Confirma los datos</Text>
            <Text style={styles.body}>
              Encontramos esta información para tu vehículo. Revísala y corrige lo que
              necesites antes de guardar.
            </Text>
          </View>

          <View style={styles.section}>
            <BrandAutocompleteField
              value={brand}
              onChangeText={setBrand}
              error={fieldErrors.brand}
              editable={!saving}
            />
            <FormField
              label="Modelo"
              icon="directions-car"
              value={model}
              onChangeText={setModel}
              error={fieldErrors.model}
              editable={!saving}
            />
            <FormField
              label="Año"
              icon="event"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              error={fieldErrors.year}
              editable={!saving}
            />
            <FormField
              label="Versión (opcional)"
              icon="info"
              value={version}
              onChangeText={setVersion}
              editable={!saving}
            />
            <FormField
              label="Motor (opcional)"
              icon="build"
              value={engine}
              onChangeText={setEngine}
              editable={!saving}
            />
            <FormField
              label="Cilindrada (opcional)"
              icon="speed"
              value={displacement}
              onChangeText={setDisplacement}
              editable={!saving}
            />
            <FormField
              label="Combustible (opcional)"
              icon="local-gas-station"
              value={fuelType}
              onChangeText={setFuelType}
              editable={!saving}
            />
            <FormField
              label="Transmisión (opcional)"
              icon="settings"
              value={transmission}
              onChangeText={setTransmission}
              editable={!saving}
            />
            <FormField
              label="Tracción (opcional)"
              icon="all-inclusive"
              value={traction}
              onChangeText={setTraction}
              editable={!saving}
            />
            <FormField
              label="VIN (opcional)"
              icon="confirmation-number"
              value={vin}
              onChangeText={setVin}
              editable={!saving}
            />
            <FormField
              label="Patente (opcional)"
              icon="pin"
              value={plate}
              onChangeText={setPlate}
              autoCapitalize="characters"
              editable={!saving}
            />

            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

            <PrimaryButton
              label="Guardar vehículo"
              onPress={() => void handleSubmit()}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.space24,
    gap: theme.spacing.space24,
  },
  header: {
    gap: theme.spacing.space8,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.8,
  },
  section: {
    gap: theme.spacing.space16,
  },
  submitError: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
});
