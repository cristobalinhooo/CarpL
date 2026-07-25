import { Redirect } from 'expo-router';

/**
 * Splash (Technical Spec §12.3): "Inicializar configuración y resolver
 * sesión. Autenticado → Home; no autenticado → Login." Fase 1 no tiene
 * todavía cliente de API ni sesión real — redirige siempre a las tabs
 * principales. La resolución de sesión real llega en la fase de Auth.
 */
export default function Splash() {
  return <Redirect href="/(tabs)" />;
}
