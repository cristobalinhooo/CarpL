import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { SessionProvider, useSession } from '@/hooks/use-session';
import { theme } from '@/theme';

SplashScreen.preventAutoHideAsync();
void SystemUI.setBackgroundColorAsync(theme.colors.background);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SessionProvider>
  );
}

/**
 * Guard de rutas (Fase 2, Auth): no autenticado dentro de `(tabs)`/
 * `investigation` → Login; autenticado dentro de `(auth)` → tabs. El
 * splash nativo se mantiene visible (`preventAutoHideAsync` arriba)
 * hasta que la sesión termina de resolverse desde el storage, no solo
 * hasta que cargan las fuentes — evita un parpadeo de contenido antes
 * de saber a dónde navegar.
 */
function RootNavigator() {
  const { status } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    void SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [status, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="investigation" />
    </Stack>
  );
}
