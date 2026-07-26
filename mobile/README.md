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
- **Fase 2 (Auth)**: primera vez que el frontend habla contra el
  backend real (`POST /auth/register`, `/login`, `/forgot-password`,
  `/refresh`, `/logout`, Fase 2 del backend) — `src/api/` (cliente
  fetch tipado), sesión guardada de forma segura (`expo-secure-store`
  en iOS/Android, `localStorage` como único fallback en web — sin
  cifrado ahí, no existe un equivalente al keychain nativo en un
  navegador) y un guard de rutas real en `_layout.tsx` (no autenticado
  → Login; autenticado → tabs). Login/Registro/Recuperar contraseña ya
  son formularios funcionales (Figuras 2-4); cerrar sesión funciona
  desde el placeholder de Perfil.
- **Fase 3 (Vehículos)**: Home y Mis Vehículos ya hablan contra
  `vehicles/` (`POST /vehicles`, `GET /vehicles`, `POST
  /vehicles/lookup-by-plate`, Fase 3/3b del backend). Agregar vehículo
  (Figura 5) ofrece patente o manual en una sola pantalla — con el
  adaptador nulo del backend la búsqueda por patente siempre cae a
  manual, tratado como un mensaje neutro, nunca un error. Confirmar
  datos (nueva, solo alcanzable tras una búsqueda exitosa) queda lista
  para cuando exista un proveedor real (Fase 3b). "Vehículo activo" es
  simplemente el primero de `GET /vehicles` (ya ordenado por más
  reciente) — no es un campo del backend. Primeras pantallas de datos
  protegidas más allá de logout: un 401 fuerza cierre de sesión.
- **Fase 4 (Investigaciones)**: Nueva investigación e Historial ya
  hablan contra `investigations/` (`POST /investigations`, `GET
  /investigations`, `POST /investigations/{id}/start`, Fase 4 del
  backend). Nueva investigación no pide un "Título" propio (la Figura
  8 no lo muestra) — se deriva de la descripción en el cliente, ya que
  la regla de validación de §12.3 solo exige vehículo+descripción.
  "Iniciar investigación" crea el caso y lo activa (`start`) en la
  misma acción antes de abrir el Chat (todavía un placeholder).
  Historial sigue exactamente la Figura 17 (fecha/título/vehículo/
  estado) — sin nivel de urgencia ni versión de informe, que
  dependerían de `reports/` (fase futura); el vehículo de cada item se
  cruza en el cliente contra `GET /vehicles` porque `GET
  /investigations` no lo incluye. Sin evidencia inicial (Foto/Vídeo/
  Audio de la Figura 8) todavía — módulo Evidencia, fase futura.

Los módulos restantes (pantallas con contenido y lógica real más allá
de Auth/Vehículos/Investigaciones: evidencia, chat, informe) se
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
│   │   ├── _layout.tsx         # Root: fuentes, splash, SessionProvider, guard de rutas
│   │   ├── index.tsx           # Splash — loading mientras se resuelve la sesión
│   │   │                       # guardada; el guard de _layout.tsx decide destino (§12.3)
│   │   ├── (auth)/             # Stack de autenticación (§12.2) — route group,
│   │   │   ├── _layout.tsx     # no aparece en la URL
│   │   │   ├── login.tsx       # Formulario real (Fase 2) — Figura 2
│   │   │   ├── register.tsx    # Formulario real (Fase 2) — Figura 3
│   │   │   └── forgot-password.tsx  # Formulario real (Fase 2) — Figura 4
│   │   ├── (tabs)/             # Tabs persistentes (§12.2/12.3) — route group
│   │   │   ├── _layout.tsx     # Inicio, Vehículos, Historial, Perfil
│   │   │   ├── index.tsx       # Inicio (Home) — real (Fase 3), Figura 7 acotada
│   │   │   ├── vehicles/        # Mis Vehículos — carpeta (Fase 3, stack anidado
│   │   │   │   ├── _layout.tsx # en el tab, no un archivo plano como antes)
│   │   │   │   ├── index.tsx   # Mis Vehículos — real (Fase 3), Figura 6
│   │   │   │   ├── add.tsx     # Agregar vehículo — real (Fase 3), Figura 5
│   │   │   │   └── confirm.tsx # Confirmar datos — real (Fase 3), tras lookup exitoso
│   │   │   ├── history.tsx     # Historial — real (Fase 4), Figura 17
│   │   │   └── profile.tsx     # placeholder + cerrar sesión real (Fase 2)
│   │   └── investigation/      # Stack de investigación (§12.2) — carpeta normal,
│   │       ├── _layout.tsx     # no route group: el id sí es información real
│   │       ├── new.tsx         # Nueva investigación — real (Fase 4), Figura 8
│   │       └── [id]/
│   │           ├── chat.tsx    # placeholder (destino real desde Fase 4, contenido futuro)
│   │           ├── evidence.tsx
│   │           └── report.tsx  # placeholder (destino real desde Fase 4, contenido futuro)
│   ├── theme/                  # Tokens de diseño (Primitivos + Semánticos,
│   │   ├── colors.ts           # Figura 17) — objeto estático exportado, sin
│   │   ├── typography.ts       # Context/Provider (no hay dark mode pedido
│   │   ├── spacing.ts          # todavía)
│   │   └── index.ts
│   ├── api/                    # Cliente HTTP contra el backend (Fase 2/3/4)
│   │   ├── client.ts           # apiFetch<T> genérico + ApiError/NetworkError
│   │   ├── auth.ts             # register/login/forgotPassword/refresh/logout
│   │   ├── vehicles.ts         # create/findAll/lookupByPlate (Fase 3)
│   │   └── investigations.ts   # create/findAll/start (Fase 4)
│   ├── services/                # Acceso a APIs del dispositivo (Fase 2)
│   │   └── session-storage.ts  # SecureStore (nativo) / localStorage (web)
│   ├── hooks/                   # Estado compartido (Fase 2/3/4)
│   │   ├── use-session.tsx     # SessionProvider + useSession()
│   │   ├── use-vehicles-api.ts # wrapper de api/vehicles.ts + logout automático en 401
│   │   └── use-investigations-api.ts  # ídem para api/investigations.ts
│   ├── constants/                # Datos estáticos sin backend real detrás (Fase 3)
│   │   └── vehicle-brands.ts   # marcas para el autocompletado de "Marca", no un catálogo
│   └── components/              # Compartidos entre pantallas
│       ├── screen-placeholder.tsx  # placeholder de esqueleto (Fase 1)
│       ├── form-field.tsx      # campo de formulario (Fase 2, Figuras 2-4)
│       ├── primary-button.tsx  # botón primario con loading (Fase 2)
│       ├── brand-autocomplete-field.tsx  # Marca con sugerencias no bloqueantes (Fase 3)
│       ├── empty-state.tsx     # patrón Figura 23, reutilizable (Fase 3)
│       ├── vehicle-card.tsx    # presentación compartida de un vehículo (Fase 3)
│       └── vehicle-selector.tsx  # dropdown de vehículo real (Fase 4, Figura 8)
├── assets/                      # Íconos/splash (branding real pendiente)
├── app.json
├── package.json
├── tsconfig.json                # alias `@/*` → `src/*`
├── eslint.config.js
├── .env.example                 # variables `EXPO_PUBLIC_*` (ver abajo)
└── .env                         # real, ignorado por git
```

`types/` (Technical Spec §17.1) todavía no existe como carpeta — se
crea cuando una fase futura tenga algo real que poner ahí, no vacía de
antemano.

## Configuración de entorno

`mobile/.env` (no versionado — copiar desde `.env.example`):

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

`EXPO_PUBLIC_*` es el mecanismo estándar de Expo para variables leídas
en el cliente. El backend ya permite `http://localhost:8081`
(`CORS_ORIGINS`, `backend/.env.example`) — el puerto por defecto de
`expo start --web` — no hace falta tocar el backend para probar contra
la web. Para **emulador Android**, reemplazar `localhost` por
`10.0.2.2` (alias especial al host); en **simulador iOS**, `localhost`
funciona igual que en web. El backend debe estar corriendo
(`backend/`, ver `backend/README.md`) para que Auth (o cualquier
pantalla futura que hable con la API) funcione.

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
- El backend corriendo localmente (`backend/`, Docker Postgres + Fase
  2 en adelante) — desde Fase 2, Auth ya no funciona contra nada
  simulado.

## Arranque local

```bash
cd mobile
cp .env.example .env
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
