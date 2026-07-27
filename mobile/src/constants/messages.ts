/**
 * Mensajes de error/estado repetidos textualmente en varias pantallas
 * (fix de dialecto post-D-022 — ese solo cubrió el prompt de la IA, no
 * el texto fijo de la UI, escrito fase a fase en voseo rioplatense sin
 * que nadie hubiera definido el dialecto para acá todavía). Un solo
 * lugar para corregir si el dialecto vuelve a necesitar un ajuste, en
 * vez de N lugares — ver `mobile/AGENTS.md` para la convención.
 */
export const NETWORK_ERROR_MESSAGE =
  'Sin conexión a internet. Verifica tu conexión e intenta de nuevo.';

export const INVALID_EMAIL_MESSAGE = 'Ingresa un correo electrónico válido.';

export const TOO_MANY_ATTEMPTS_MESSAGE =
  'Demasiados intentos. Espera un momento e intenta de nuevo.';

export const NO_VEHICLES_TITLE = 'Aún no tienes vehículos';

export const INVALID_BRAND_MESSAGE = 'Ingresa la marca.';
export const INVALID_MODEL_MESSAGE = 'Ingresa el modelo.';
export const INVALID_YEAR_MESSAGE = 'Ingresa un año válido.';

export const VEHICLE_SAVE_ERROR_MESSAGE =
  'No pudimos guardar el vehículo. Intenta de nuevo.';
