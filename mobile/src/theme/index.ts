/**
 * Punto único de acceso a los tokens de diseño de CarPlus. Capas
 * Primitivos + Semánticos de la Figura 17 (Tokens y gobierno) — las
 * capas Componente y Producto se agregan cuando existan componentes/
 * features reales que las necesiten (botones, hipótesis, urgencia),
 * no antes.
 *
 * Objeto estático exportado, sin Context/Provider: no hay theming
 * dinámico (dark mode, etc.) pedido todavía — agregar esa indirección
 * ahora sería una abstracción sin necesidad real.
 */
import { colors, palette } from './colors';
import { fontFamily, typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
} as const;

export { colors, palette, fontFamily, typography, spacing };
