import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import type { Vehicle } from '@/api/vehicles';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { VehicleSelector } from '@/components/vehicle-selector';
import { COMMON_PROBLEMS } from '@/constants/common-problems';
import { useInvestigationsApi } from '@/hooks/use-investigations-api';
import { useVehiclesApi } from '@/hooks/use-vehicles-api';
import { theme } from '@/theme';

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_TITLE_LENGTH = 60;

/**
 * Deriva un título corto a partir de la descripción (hallazgo 3 del
 * plan de esta fase): la Figura 8 no muestra un campo "Título" propio,
 * y la regla de validación de §12.3 solo exige vehículo+descripción
 * válidos — `CreateInvestigationDto.title` sigue siendo obligatorio en
 * el backend, así que se satisface sin pedirle este dato al usuario.
 */
function deriveTitle(description: string): string {
  const trimmed = description.trim();
  const firstSentence = trimmed.split(/[.!?]/)[0].trim();
  const candidate = firstSentence.length > 0 ? firstSentence : trimmed;
  return candidate.length > MAX_TITLE_LENGTH
    ? `${candidate.slice(0, MAX_TITLE_LENGTH).trim()}…`
    : candidate;
}

type ScreenState = 'loading' | 'error' | 'empty' | 'ready';

/**
 * Nueva investigación (Figura 8, Technical Spec §12.3): selecciona
 * vehículo (preseleccionado en el activo, Fase 3) y describe el
 * comportamiento observado. Sin botones de evidencia inicial
 * (hallazgo 1 del plan — módulo Evidencia, fase futura). Al enviar,
 * crea el caso y lo activa en la misma acción (hallazgo 2) antes de
 * abrir el Chat (todavía un placeholder).
 */
export default function NewInvestigationScreen() {
  const router = useRouter();
  // Mismo fix que investigation/[id]/chat.tsx: sin keyboardVerticalOffset,
  // KeyboardAvoidingView no compensa el header nativo del Stack (vive
  // fuera del árbol de vistas de JS bajo native-stack) y en iOS el
  // teclado termina tapando el campo entero.
  const headerHeight = useHeaderHeight();
  const { findAll: findAllVehicles } = useVehiclesApi();
  const { create, start } = useInvestigationsApi();

  const [state, setState] = useState<ScreenState>('loading');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const result = await findAllVehicles();
      setVehicles(result);
      setSelectedVehicleId(result[0]?.id ?? null);
      setState(result.length > 0 ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, [findAllVehicles]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleSubmit() {
    setSubmitError(null);
    setDescriptionError(null);

    if (!selectedVehicleId) return;
    if (description.trim().length === 0) {
      setDescriptionError('Describí lo que está ocurriendo.');
      return;
    }

    setSaving(true);
    try {
      const investigation = await create({
        vehicleId: selectedVehicleId,
        title: deriveTitle(description),
        description: description.trim(),
      });
      await start(investigation.id);
      router.replace(`/investigation/${investigation.id}/chat`);
    } catch (error) {
      if (error instanceof NetworkError) {
        setSubmitError('Sin conexión a internet. Verificá tu conexión e intentá de nuevo.');
      } else {
        setSubmitError('No pudimos iniciar la investigación. Intentá de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (state === 'loading') {
    return (
      <>
        <Stack.Screen options={{ title: 'Nueva investigación' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
        </View>
      </>
    );
  }

  if (state === 'error') {
    return (
      <>
        <Stack.Screen options={{ title: 'Nueva investigación' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No pudimos cargar tus vehículos.</Text>
          <View style={styles.retryButton}>
            <PrimaryButton label="Reintentar" onPress={() => void load()} />
          </View>
        </View>
      </>
    );
  }

  if (state === 'empty') {
    return (
      <>
        <Stack.Screen options={{ title: 'Nueva investigación' }} />
        <EmptyState
          icon="directions-car"
          title="Agregá un vehículo primero"
          description="Necesitás un vehículo registrado para iniciar una investigación."
          actionLabel="Agregar vehículo"
          onAction={() => router.push('/(tabs)/vehicles/add')}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nueva investigación' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>¿Qué está ocurriendo?</Text>
            <Text style={styles.body}>
              Describí el comportamiento con tus propias palabras.
            </Text>
          </View>

          <VehicleSelector
            vehicles={vehicles}
            selectedId={selectedVehicleId ?? vehicles[0].id}
            onSelect={setSelectedVehicleId}
          />

          <View style={styles.descriptionField}>
            <Text style={styles.label}>Descripción</Text>
            <View style={styles.problemChips}>
              {COMMON_PROBLEMS.map((problem) => (
                <Pressable
                  key={problem}
                  style={styles.problemChip}
                  onPress={() => setDescription(problem)}
                  disabled={saving}>
                  <Text style={styles.problemChipText}>{problem}</Text>
                </Pressable>
              ))}
            </View>
            <View
              style={[
                styles.textAreaWrapper,
                descriptionError ? styles.textAreaWrapperError : null,
              ]}>
              <TextInput
                style={styles.textArea}
                placeholder="El vehículo vibra cuando acelero..."
                placeholderTextColor={`${theme.colors.textPrimary}80`}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={MAX_DESCRIPTION_LENGTH}
                editable={!saving}
              />
            </View>
            <Text style={styles.charCount}>
              {description.length} / {MAX_DESCRIPTION_LENGTH}
            </Text>
            {descriptionError ? (
              <Text style={styles.submitError}>{descriptionError}</Text>
            ) : null}
          </View>

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <PrimaryButton
            label="Iniciar investigación"
            onPress={() => void handleSubmit()}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
  descriptionField: {
    gap: theme.spacing.space8,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  problemChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.space8,
  },
  problemChip: {
    borderRadius: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
  },
  problemChipText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}33`,
    borderRadius: theme.spacing.space12,
    backgroundColor: theme.colors.surface,
  },
  textAreaWrapperError: {
    borderColor: theme.colors.danger,
  },
  textArea: {
    minHeight: 120,
    padding: theme.spacing.space16,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.6,
    textAlign: 'right',
  },
  submitError: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
});
