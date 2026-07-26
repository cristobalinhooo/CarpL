/**
 * Cliente de API mínimo (Fase 2, Auth — primera vez que el frontend
 * habla contra el backend real). `ApiError` refleja 1:1 la forma de
 * error del backend (`AllExceptionsFilter`:
 * `{statusCode, message, correlationId?, timestamp, path}`) — un fallo
 * de red (sin respuesta HTTP en absoluto) se distingue explícitamente
 * como `NetworkError`, nunca se confunde con un error de la API.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('No se pudo conectar con el servidor');
    this.name = 'NetworkError';
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Un `FormData` se manda tal cual (Fase 5, subida de evidencia):
   *  sin serializar y sin fijar `Content-Type`, para que `fetch` arme
   *  el boundary multipart correcto solo. Cualquier otro valor sigue
   *  el camino JSON de siempre. */
  body?: unknown;
  /** Presente solo en rutas protegidas (p. ej. `/auth/logout`). */
  accessToken?: string;
}

interface BackendErrorBody {
  statusCode: number;
  message: string;
}

function isBackendErrorBody(value: unknown): value is BackendErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_URL no está configurada (ver mobile/.env.example)',
    );
  }

  const isFormData = options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.accessToken
          ? { Authorization: `Bearer ${options.accessToken}` }
          : {}),
      },
      body: isFormData
        ? (options.body as FormData)
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  const text = await response.text();
  const data: unknown = text.length > 0 ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = isBackendErrorBody(data) ? data.message : 'Error inesperado';
    throw new ApiError(response.status, message);
  }

  return data as T;
}
