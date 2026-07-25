import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ReportScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Informe' }} />
      <ScreenPlaceholder
        title="Informe final"
        note="Renderiza report_json vigente: hipótesis, evidencia, recomendaciones (Technical Spec §12.3) — pendiente de fase futura."
      />
    </>
  );
}
