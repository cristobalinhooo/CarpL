import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VEHICLE_BRANDS } from '@/constants/vehicle-brands';
import { theme } from '@/theme';

import { FormField } from './form-field';

interface BrandAutocompleteFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  editable?: boolean;
}

const MAX_SUGGESTIONS = 6;

/**
 * Marca no tiene ningún catálogo real detrás (`brand` es texto libre
 * en `CreateVehicleDto`) — esto es solo una sugerencia no vinculante.
 * Tocar una sugerencia completa el campo; el usuario puede seguir
 * escribiendo cualquier texto y nunca aparece un error de "marca no
 * reconocida" (decisión explícita del usuario, Fase 3).
 */
export function BrandAutocompleteField({
  value,
  onChangeText,
  error,
  editable = true,
}: BrandAutocompleteFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (query.length === 0) return [];
    return VEHICLE_BRANDS.filter((brand) =>
      brand.toLowerCase().includes(query),
    ).slice(0, MAX_SUGGESTIONS);
  }, [value]);

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <View style={styles.container}>
      <FormField
        label="Marca"
        icon="directions-car"
        placeholder="Toyota"
        value={value}
        onChangeText={onChangeText}
        error={error}
        editable={editable}
        autoCapitalize="words"
        onFocus={() => setIsFocused(true)}
        // Delay para que el `onPress` de una sugerencia alcance a
        // dispararse antes de que el blur la oculte.
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
      />
      {showSuggestions ? (
        <View style={styles.suggestions}>
          {suggestions.map((brand) => (
            <Pressable
              key={brand}
              style={styles.suggestionRow}
              onPress={() => {
                onChangeText(brand);
                setIsFocused(false);
              }}>
              <Text style={styles.suggestionText}>{brand}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: theme.spacing.space4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space12,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}1A`,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.textPrimary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 2,
  },
  suggestionRow: {
    paddingVertical: theme.spacing.space12,
    paddingHorizontal: theme.spacing.space16,
  },
  suggestionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
});
