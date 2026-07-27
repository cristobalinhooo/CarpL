import { Stack } from 'expo-router';

import { HeaderBackButton } from '@/components/header-back-button';
import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ReportScreen() {
  return (
    <>
      <Stack.Screen
        options={{ title: 'Informe', headerLeft: () => <HeaderBackButton /> }}
      />
      <ScreenPlaceholder
        title="Informe final"
        note="Renderiza report_json vigente: hipótesis, evidencia, recomendaciones (Technical Spec §12.3) — pendiente de fase futura."
      />
    </>
  );
}
