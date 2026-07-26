import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { SessionResponse } from '@/api/auth';

const SESSION_KEY = 'carplus.session';

/**
 * `expo-secure-store` no tiene una implementación real en web (su
 * `.web.js` es un stub vacío — llamarlo ahí lanza en tiempo de
 * ejecución) — en web no existe un almacén cifrado equivalente al
 * keychain/keystore nativo. Se usa `localStorage` como fallback
 * exclusivo de web (aceptado, no cifrado — mismo tradeoff que
 * cualquier app web con sesión) y SecureStore en iOS/Android.
 */
async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveSession(session: SessionResponse): Promise<void> {
  await setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<SessionResponse | null> {
  const raw = await getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionResponse;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await deleteItem(SESSION_KEY);
}
