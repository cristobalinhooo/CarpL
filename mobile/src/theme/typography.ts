/**
 * Escala tipográfica (Design System de CarPlus, Figura 3 "Tipografía").
 * El mockup usa "CarPlus Sans" como nombre de marca con la aclaración
 * explícita de que es una "implementación recomendada con una sans
 * moderna de alta legibilidad" — no existe como fuente real. Se
 * implementa con Inter (`@expo-google-fonts/inter`): sans moderna, alta
 * legibilidad, buen soporte de acentos en español, gratuita.
 *
 * Con fuentes cargadas vía `expo-font`, React Native usa `fontFamily`
 * (un nombre por peso), no `fontWeight`, para renderizar el peso
 * correcto — de ahí que cada variante fije su propia `fontFamily`.
 */
// Los tres nombres deben coincidir exactamente con los que carga
// `useFonts` en el layout raíz (`app/_layout.tsx`, vía los exports
// homónimos de `@expo-google-fonts/inter`) — es la misma cadena la que
// React Native usa para resolver `fontFamily` en tiempo de render.
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
} as const;

interface TypographyVariant {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

// Negrita para jerarquía (Display-H3), nunca para párrafos (Body/
// Caption) — regla explícita de la Figura 3. Label usa Medium: es
// control/metadato, no párrafo, pero tampoco encabezado.
export const typography: Record<
  'display' | 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption',
  TypographyVariant
> = {
  display: { fontFamily: fontFamily.bold, fontSize: 48, lineHeight: 56 },
  h1: { fontFamily: fontFamily.bold, fontSize: 36, lineHeight: 44 },
  h2: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 36 },
  h3: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 30 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 16 },
};
