/**
 * Primitivos y semánticos de color (Design System de CarPlus, PRD v3.1
 * — capítulo transversal, Figura 2 "Color"). Valores tomados
 * directamente de la Figura, no inventados.
 *
 * `palette` = capa Primitivos (Figura 17: `Color.blue.700`, etc.).
 * `colors` = capa Semánticos (`Action.primary`, `Evidence.default`,
 * `Surface.canvas`) — todo lo que consuma color en pantallas debe usar
 * `colors`, nunca `palette` directamente, para que un cambio de
 * significado (qué primitivo respalda "acción primaria") no obligue a
 * tocar cada pantalla.
 */
export const palette = {
  navy900: '#102A43',
  blue700: '#1D4ED8',
  cyan600: '#0891B2',
  teal700: '#0F766E',
  purple700: '#6D28D9',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  surface: '#FFFFFF',
  background: '#F4F7FB',
} as const;

export const colors = {
  /** Marca, texto de alta jerarquía — nunca fondo masivo (Figura 2). */
  textPrimary: palette.navy900,
  /** Acción primaria, foco. */
  actionPrimary: palette.blue700,
  /** Evidencia e información. */
  evidenceDefault: palette.cyan600,
  /** Proceso y progreso. */
  processDefault: palette.teal700,
  /** Hipótesis y razonamiento. */
  hypothesisDefault: palette.purple700,
  /** Completado / disponible. */
  success: palette.success,
  /** Incertidumbre / atención. */
  warning: palette.warning,
  /** Bloqueo / riesgo. */
  danger: palette.danger,
  /** Superficie primaria (cards, inputs). */
  surface: palette.surface,
  /** Lienzo de aplicación — celeste y blanco predominan, navy nunca es
   *  fondo masivo. */
  background: palette.background,
} as const;
