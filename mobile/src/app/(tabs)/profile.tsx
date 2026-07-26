import { useState } from 'react';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useSession } from '@/hooks/use-session';

/**
 * Fase 2 (Auth): cerrar sesión funciona de verdad acá (confirmado con
 * el usuario) — cierra el ciclo completo de esta fase. El resto de la
 * pantalla (actualizar datos, Technical Spec §12.3) sigue siendo el
 * placeholder de la Fase 1, pendiente de su propia fase.
 */
export default function ProfileScreen() {
  const { logout } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      // El guard de rutas (`_layout.tsx`) redirige a Login al ver
      // `status === 'unauthenticated'` — esta pantalla no navega directo.
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenPlaceholder
      title="Perfil"
      note="Actualizar datos (Technical Spec §12.3) — pendiente de fase futura.">
      <PrimaryButton
        label="Cerrar sesión"
        onPress={() => void handleLogout()}
        loading={loading}
      />
    </ScreenPlaceholder>
  );
}
