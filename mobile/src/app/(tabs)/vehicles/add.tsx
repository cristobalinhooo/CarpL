import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError, NetworkError } from '@/api/client';
import { BrandAutocompleteField } from '@/components/brand-autocomplete-field';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Agregar vehículo (Figura 5, Technical Spec §12.3/§13.5): dos caminos
 * igualmente accesibles, patente o manual, en la misma pantalla — sin
 * el wizard de 5 pasos del mockup (asume un catálogo de marcas/modelos
 * que no existe, ver hallazgo 1 del plan de esta fase). Con el
 * adaptador nulo del backend, la búsqueda por patente siempre cae a
 * manual; ese fallback se trata acá como un mensaje neutro, nunca
 * como un error bloqueante (instrucción explícita del usuario).
 */
export default function AddVehicleScreen() {
  const router = useRouter();
  const { lookupByPlate, create } = useVehiclesApi();

  const [plate, setPlate] = useState('');
  const [searching, setSearching] = useState(false);
  const [lookupNotice, setLookupNotice] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [mileage, setMileage] = useState('');
  const [manualPlate, setManualPlate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function revealManual(fallbackNotice?: string) {
    if (fallbackNotice) setLookupNotice(fallbackNotice);
    if (plate.trim().length > 0) setManualPlate(plate.trim().toUpperCase());
    setShowManual(true);
  }

  async function handleSearch() {
    if (plate.trim().length === 0) return;
    setLookupNotice(null);
    setSearching(true);
    try {
      const result = await lookupByPlate({
        plate: plate.trim().toUpperCase(),
        countryCode: 'CL',
      });
      if (result.status === 'SUCCESS' && result.data) {
        router.push({
          pathname: '/(tabs)/vehicles/confirm',
          params: { data: JSON.stringify(result.data), plate: plate.trim().toUpperCase() },
        });
        return;
      }
      // NOT_FOUND: sin proveedor real todavía, caída esperada.
      revealManual('No encontramos datos para esa patente. Completá los datos manualmente.');
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) {
        revealManual(
          'No pudimos consultar la patente en este momento. Completá los datos manualmente.',
        );
      }
    } finally {
      setSearching(false);
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (brand.trim().length === 0) errors.brand = 'Ingresá la marca.';
    if (model.trim().length === 0) errors.model = 'Ingresá el modelo.';

    const yearNumber = Number(year);
    if (!year.trim() || !Number.isInteger(yearNumber)) {
      errors.year = 'Ingresá un año válido.';
    } else if (yearNumber < 1900 || yearNumber > CURRENT_YEAR + 1) {
      errors.year = `El año debe estar entre 1900 y ${CURRENT_YEAR + 1}.`;
    }

    if (mileage.trim().length > 0) {
      const mileageNumber = Number(mileage);
      if (!Number.isInteger(mileageNumber) || mileageNumber < 0) {
        errors.mileage = 'Ingresá un kilometraje válido.';
      }
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
        engine: engine.trim() || undefined,
        mileage: mileage.trim() ? Number(mileage) : undefined,
        plate: manualPlate.trim() || undefined,
      });
      router.replace('/(tabs)/vehicles');
    } catch (error) {
      if (error instanceof NetworkError) {
        setSubmitError('Sin conexión a internet. Verificá tu conexión e intentá de nuevo.');
      } else {
        setSubmitError('No pudimos guardar el vehículo. Intentá de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Agregar vehículo' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por patente</Text>
            <Text style={styles.sectionBody}>
              Ingresá la patente y buscamos los datos del vehículo por vos.
            </Text>
            <FormField
              label="Patente"
              icon="pin"
              placeholder="AB1234"
              value={plate}
              onChangeText={setPlate}
              autoCapitalize="characters"
              editable={!searching}
            />
            <PrimaryButton label="Buscar" onPress={() => void handleSearch()} loading={searching} />
            {lookupNotice ? <Text style={styles.notice}>{lookupNotice}</Text> : null}
          </View>

          {!showManual ? (
            <Text style={styles.manualLink} onPress={() => revealManual()}>
              Prefiero completar los datos manualmente
            </Text>
          ) : null}

          {showManual ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Datos del vehículo</Text>
              <BrandAutocompleteField
                value={brand}
                onChangeText={setBrand}
                error={fieldErrors.brand}
                editable={!saving}
              />
              <FormField
                label="Modelo"
                icon="directions-car"
                placeholder="Corolla"
                value={model}
                onChangeText={setModel}
                error={fieldErrors.model}
                editable={!saving}
              />
              <FormField
                label="Año"
                icon="event"
                placeholder="2018"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                error={fieldErrors.year}
                editable={!saving}
              />
              <FormField
                label="Motor (opcional)"
                icon="build"
                placeholder="1.8 Hybrid"
                value={engine}
                onChangeText={setEngine}
                editable={!saving}
              />
              <FormField
                label="Kilometraje (opcional)"
                icon="speed"
                placeholder="82450"
                value={mileage}
                onChangeText={setMileage}
                keyboardType="numeric"
                error={fieldErrors.mileage}
                editable={!saving}
              />
              <FormField
                label="Patente (opcional)"
                icon="pin"
                placeholder="AB1234"
                value={manualPlate}
                onChangeText={setManualPlate}
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
          ) : null}
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
  section: {
    gap: theme.spacing.space16,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  sectionBody: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    opacity: 0.8,
  },
  notice: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  manualLink: {
    ...theme.typography.label,
    color: theme.colors.actionPrimary,
    textAlign: 'center',
  },
  submitError: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
});
