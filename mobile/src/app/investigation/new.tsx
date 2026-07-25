import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function NewInvestigationScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nueva investigación' }} />
      <ScreenPlaceholder
        title="Nueva investigación"
        note="Seleccionar vehículo, título y descripción (Technical Spec §12.3) — pendiente de fase futura."
      />
    </>
  );
}
