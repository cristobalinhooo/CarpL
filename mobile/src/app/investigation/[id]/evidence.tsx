import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function EvidenceScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Evidencia' }} />
      <ScreenPlaceholder
        title="Evidencia"
        note="Capturar/subir y listar archivos, progreso y reintento (Technical Spec §12.3) — pendiente de fase futura."
      />
    </>
  );
}
