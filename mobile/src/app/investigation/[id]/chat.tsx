import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ChatScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Chat de investigación' }} />
      <ScreenPlaceholder
        title="Chat de investigación"
        note="Conversación, progreso, estado y adjuntos (Technical Spec §12.3) — pendiente de fase futura."
      />
    </>
  );
}
