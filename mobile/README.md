# Mobile — React Native + Expo

Fase 1 (Esqueleto + Design System) del roadmap de frontend ya está
scaffoldeada. A diferencia del backend, este roadmap de fases no viene
predefinido fase por fase en el Technical Spec — solo el mapa de
pantallas (§12.3) y el flujo principal (§12.4) — se arma junto con el
usuario a medida que avanza.

- **Fase 1**: proyecto Expo inicializado (`create-expo-app`, SDK 57,
  TypeScript), **Expo Router** (ruteo por archivos, no React Navigation
  clásico con navigators escritos a mano — decisión explícita de esta
  fase), esqueleto de navegación sin pantallas reales (cada ruta es un
  placeholder que muestra su nombre y qué fase futura la implementa), y
  los tokens de diseño (`src/theme/`) basados en el Design System de
  CarPlus (PRD v3.1, capítulo transversal — Figuras 2-4 y 17 de
  `../docs/design/mockups/`).

Los módulos restantes (Auth real contra Supabase, cliente de API,
pantallas con contenido y lógica real, evidencia, chat, informe) se
añaden fase a fase — no existen todavía por diseño.

## Estructura

Expo Router: cada archivo dentro de `src/app/` es una ruta; cada
`_layout.tsx` define cómo se relacionan las rutas de su carpeta (stack,
tabs, etc.) — no hay una carpeta `navigation/` separada con navigators
escritos a mano.

```
mobile/
├── src/
│   ├── app/                    # Rutas (Expo Router)
│   │   ├── _layout.tsx         # Root: carga de fuentes (Inter), splash, Stack raíz
│   │   ├── index.tsx           # Splash — hoy siempre redirige a (tabs) (§12.3;
│   │   │                       # sin sesión real todavía, eso llega con Auth)
│   │   ├── (auth)/             # Stack de autenticación (§12.2) — route group,
│   │   │   ├── _layout.tsx     # no aparece en la URL
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── (tabs)/             # Tabs persistentes (§12.2/12.3) — route group
│   │   │   ├── _layout.tsx     # Inicio, Vehículos, Historial, Perfil
│   │   │   ├── index.tsx       # Inicio (Home)
│   │   │   ├── vehicles.tsx
│   │   │   ├── history.tsx
│   │   │   └── profile.tsx
│   │   └── investigation/      # Stack de investigación (§12.2) — carpeta normal,
│   │       ├── _layout.tsx     # no route group: el id sí es información real
│   │       ├── new.tsx         # de navegación (deep-linkeable a futuro)
│   │       └── [id]/
│   │           ├── chat.tsx
│   │           ├── evidence.tsx
│   │           └── report.tsx
│   ├── theme/                  # Tokens de diseño (Primitivos + Semánticos,
│   │   ├── colors.ts           # Figura 17) — objeto estático exportado, sin
│   │   ├── typography.ts       # Context/Provider (no hay dark mode pedido
│   │   ├── spacing.ts          # todavía)
│   │   └── index.ts
│   └── components/             # Compartidos entre pantallas — hoy solo
│       └── screen-placeholder.tsx  # el placeholder de esqueleto
├── assets/                      # Íconos/splash (branding real pendiente)
├── app.json
├── package.json
├── tsconfig.json                # alias `@/*` → `src/*`
└── eslint.config.js
```

`hooks/`, `services/`, `api/`, `types/`, `constants/` (Technical Spec
§17.1) todavía no existen como carpetas — se crean cuando la fase que
los necesite (Auth/cliente de API, típicamente) tenga algo real que
poner ahí, no vacías de antemano.

## Tokens de diseño

Fuente: Design System de CarPlus (PRD v3.1, capítulo transversal),
Figuras 2 (Color), 3 (Tipografía), 4 (Grid y espaciado) y 17 (Tokens y
gobierno) de `../docs/design/mockups/`.

- **Color** (`src/theme/colors.ts`): Navy `#102A43` (marca/texto de
  alta jerarquía — **nunca fondo masivo**), Blue `#1D4ED8` (acción
  primaria), Cyan `#0891B2` (evidencia), Teal `#0F766E` (proceso),
  Purple `#6D28D9` (hipótesis), más semántica de estado (success/
  warning/danger) y `surface`/`background` (`#FFFFFF`/`#F4F7FB` —
  celeste y blanco predominan).
- **Tipografía** (`src/theme/typography.ts`): Inter (`@expo-google-fonts/inter`)
  como implementación real de "CarPlus Sans" del mockup (nombre de
  marca, no una fuente que exista como asset). Escala exacta:
  display/h1/h2/h3/body/label/caption.
  Negrita para jerarquía, nunca para párrafos.
- **Espaciado** (`src/theme/spacing.ts`): base 4px, escala 0-80px.

Capas Componente y Producto de la Figura 17 (p. ej. `Button.primary.bg`,
`Hypothesis.compatibility.high`) todavía no existen — dependen de
componentes/features reales que se agregan en fases futuras.

## Requisitos

- Node.js 22+
- Expo Go (dispositivo) o un emulador/simulador, o navegador para
  `--web`

## Arranque local

```bash
cd mobile
npm install
npx expo start
```

Luego `w` (web), `a` (Android), `i` (iOS) desde la terminal de Expo, o
escanear el QR con Expo Go.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run start` / `npx expo start` | Levanta el bundler de Expo. |
| `npm run web` | Arranca directo en modo web. |
| `npm run android` / `npm run ios` | Arranca directo en el emulador/simulador correspondiente. |
| `npm run lint` (`expo lint`) | ESLint (`eslint-config-expo`). |
| `npx tsc --noEmit` | Chequeo de tipos. |

Mapa de pantallas y flujo principal: Technical Spec §12.3/§12.4.
Mockups de referencia: `../docs/design/mockups/`.
