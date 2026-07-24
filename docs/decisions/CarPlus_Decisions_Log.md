# CarPlus — Log de Decisiones del Proyecto

Este documento registra decisiones tomadas en el proceso de trabajo diario que
complementan al **PRD v3.2** (fuente de verdad funcional) y al **Technical
Specification v2.1** (fuente de verdad de implementación, Architecture
Frozen). No reemplaza a ninguno de los dos. Sirve como puente ligero hasta
que cada decisión se formalice como ADR en `/docs/adr` (Technical Spec §17.10).

Convención: cada entrada tiene fecha, contexto, decisión y consecuencias.

---

## D-001 — Confianza: niveles cualitativos, nunca porcentaje

**Fecha:** 2026-07-23
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Existía una instrucción de trabajo previa (fuera del PRD) que
pedía mostrar confianza como porcentaje y gravedad con 3 niveles + emoji.
Esto contradice directamente PRD v3.2 §39 y RI-004 ("nunca deberán mostrarse
porcentajes de confianza").

**Decisión:** Prevalece el PRD v3.2. El informe usa niveles cualitativos de
compatibilidad (Muy Compatible / Compatible / Parcialmente Compatible / Poco
Compatible / Sin Evidencia Suficiente, §39) y 4 niveles de urgencia sin emoji
(Bajo / Moderado / Alto / Crítico, §37). `Hypotheses.confidence` se conserva
como decimal en el modelo de datos para uso interno (orden de hipótesis,
arnés de evaluación de consistencia §15.5), pero nunca se serializa hacia el
usuario en `report_json` ni en ninguna respuesta de API pública.

**Consecuencias:** Ver `report-json.schema.ts` (campo `EvidenceCompatibility`,
sin campo numérico expuesto). Pendiente: ADR-006 del Technical Spec
("umbrales de traducción de confianza numérica a niveles cualitativos") queda
resuelto en este sentido cuando se redacte formalmente.

---

## D-002 — Máquina de estados: se restaura "Ready to Analyze"

**Fecha:** 2026-07-23
**Estado:** Resuelto — vigente para el MVP
**Referencia futura:** ADR-000b (Technical Spec §17.10, sección de ADR pendientes)

**Contexto:** El PRD v3.2 (Fase 6, tabla oficial de transiciones, §29) define
7 estados en alcance MVP para `Investigations`, incluyendo **Listo para
Analizar** — un estado intermedio donde el Motor de Decisión ya determinó que
existe evidencia suficiente, pero la decisión de analizar sigue siendo del
usuario. El Technical Spec v2.1 (§9.10) simplificó esto a 6 estados,
fusionando "Listo para Analizar" dentro de "Active" sin documentar la
fusión como decisión, y la auditoría de consistencia del propio documento
(§18) no detectó la discrepancia. Evidencia adicional de que fue un
descuido: §10.6b del propio Technical Spec ya usa
`DECISION_ENGINE_SUFFICIENT_EVIDENCE` como ejemplo de evento de auditoría,
sin que exista un estado de destino formal para ese evento en la versión de
6 estados.

**Decisión:** Se restaura el estado como `READY_TO_ANALYZE`, quedando la
máquina de estados de `Investigations` en 7 estados:

```
Draft
  → Active
Active
  → Waiting Evidence
  → Ready to Analyze      (Motor de Decisión detecta evidencia suficiente)
Waiting Evidence
  → Active
Ready to Analyze
  → Analyzing              (usuario elige "Analizar ahora")
  → Active                 (usuario prefiere seguir investigando)
Analyzing
  → Report Generated
  → Ready to Analyze       (error durante el análisis, RC-006)
Report Generated
  → Active                 (continuar el mismo caso, RI-009)
  → Closed
Closed
  → (ninguna)
```

`Esperando Respuesta` y `Procesando Evidencia` (PRD, Estados 3 y 4) **no**
se restauran como estados propios de `Investigations` — se mantienen
resueltos a nivel de turno conversacional y de estado interno del `Job`
(`PENDING/RUNNING/DONE/FAILED`, Technical Spec §9.12) respectivamente. A
diferencia de "Listo para Analizar", esta simplificación no cambia ninguna
regla de negocio ni de autorización, por lo que se mantiene como decisión
deliberada y documentada aquí, no como un vacío.

**Consecuencias — secciones del Technical Spec a actualizar cuando se
redacte formalmente el ADR-000b:**
- §9.10 (tabla de estados y transiciones)
- §10.6b (ejemplo de `triggering_event`, ya consistente con esta decisión)
- §11.3 (sin cambios de endpoints, pero `POST .../report` debe validar
  `Ready to Analyze`, no `Active`, antes de encolar `GENERATE_REPORT`)
- §13.7 (Flujo Asíncrono de Generación de Informe, paso 1: la transición a
  `Analyzing` parte de `Ready to Analyze`, no de `Active/Waiting Evidence`)
- §12.3/12.5 (frontend: el botón "Analizar ahora" solo debe habilitarse
  cuando el caso está en `Ready to Analyze`; en `Active` se sigue
  conversando)

---

## D-003 — Indicador estadístico futuro (frecuencia real, no confianza de IA)

**Fecha:** 2026-07-23
**Estado:** Nota de roadmap — fuera del MVP, no se implementa aún

**Contexto:** Se propuso mostrar un porcentaje una vez que existan
suficientes casos históricos por tipo de vehículo/síntoma. La distinción
importante: esto no sería "qué tan segura está la IA" (lo que RI-004
prohíbe, ver D-001), sino una frecuencia estadística real calculada sobre
casos confirmados — un dato de naturaleza distinta, verificable y honesto.

**Por qué no se implementa en el MVP:**
1. El PRD ya diseñó exactamente este concepto para el futuro: es la **Base
   de Conocimiento** (Fase 10) alimentada por el **Sistema de Aprendizaje**
   (Estados 8-9 "Esperando Confirmación"/"Caso Confirmado", Fase 6), ambos
   explícitamente fuera de alcance del MVP (Technical Spec, Sección 8).
2. El día del lanzamiento la Base de Conocimiento está vacía para todos los
   vehículos por igual — no hay un subconjunto de autos con "harta info" y
   otro sin ella; el corte es temporal (nadie vs. todos, no unos vs. otros),
   por lo que la función no tendría dónde activarse hasta bastante después
   del lanzamiento.
3. RI-004 está escrito sin condicionarlo al MVP; reintroducir un porcentaje
   más adelante —aunque sea de origen estadístico real y no generado por la
   IA— es un cambio de producto que debe quedar escrito formalmente en el
   PRD (mismo tratamiento que tuvo RI-009 entre v3.1 y v3.2), no una
   extensión silenciosa del informe.

**Decisión:** Queda anotado como candidato de producto para cuando la Base
de Conocimiento tenga volumen suficiente de casos confirmados. No se
diseña ni se construye ahora. Antes de implementarlo se requiere: (a)
actualización formal del PRD que module o reemplace RI-004 para este caso
específico, y (b) definición de un umbral mínimo de casos confirmados por
segmento (vehículo + síntoma) para que el número no vuelva a caer en el
mismo problema de "precisión injustificada" con muestras chicas.

---

## D-004 — Fase 2 (Identidad): backend como proxy de Supabase Auth, nunca dueño de credenciales

**Fecha:** 2026-07-23
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Instrucción explícita del producto para la Fase 2: Supabase
Auth es el único dueño de credenciales, sesiones y tokens; el backend
nunca implementa su propio sistema de login ni guarda contraseñas. Esto
parecía tensionar con el Technical Spec v2.1 §11.3, que ya congela 4
endpoints en el backend (`POST /auth/register|login|logout|forgot-password`).
Se resolvió que no hay contradicción real: esos 4 endpoints son y deben
seguir siendo un **proxy delgado** hacia Supabase Auth — nunca hashean,
comparan ni almacenan contraseñas, y nunca emiten tokens de sesión
propios. El móvil solo conoce la API de CarPlus, nunca `SUPABASE_URL`/
`SUPABASE_ANON_KEY` directamente (§9.4: "Backend API... única interfaz
pública del cliente").

**Decisión:**

1. Los 4 endpoints `/auth/*` de §11.3 son proxy puro a Supabase Auth
   (`@supabase/supabase-js`, único módulo — `auth/` — que sabe que ese SDK
   existe, §13.3). `register` además crea el perfil local en `Users`
   (Technical Spec §10.3) tras el `signUp` exitoso.
2. La verificación de sesión en rutas protegidas es un **mecanismo
   aparte**: un guard global (`SupabaseJwtGuard`, `APP_GUARD`) que valida
   el JWT contra el JWKS de Supabase (`jose`, `createRemoteJWKSet`), sin
   pasar por ninguno de los 4 endpoints anteriores. Rutas se excluyen
   explícitamente con `@Public()` — `register`, `login`, `forgot-password`
   y `refresh` lo son; `logout` no (ver punto 5), igual que `health`.
3. **`POST /auth/refresh` se añade a la API** — no estaba en la tabla
   original de §11.3. Proxy a `supabase.auth.refreshSession()`. Necesario
   porque el JWT de Supabase expira rápido (~1h por defecto) y el móvil no
   debe (ni puede, sin romper el punto anterior) renovarlo hablando
   directo con Supabase.
4. **El proyecto Supabase debe usar JWT Signing Keys (asimétrico), no el
   sistema legacy de secreto compartido.** Es un requisito operativo para
   que `SupabaseJwtGuard` funcione: en el sistema legacy,
   `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` devuelve `{"keys": []}`
   y ninguna verificación puede tener éxito. Se valida explícitamente
   (`keys` no vacío) antes de dar por buena la Fase 2 en un proyecto real.
5. **Hallazgo durante la implementación — no estaba en el plan aprobado
   ni fue pedido por el usuario; lo decidió el asistente al escribir el
   código, y se reporta aquí después del hecho:** `logout` no usa
   `supabase.auth.signOut()` del SDK, y no quedó como ruta `@Public()`
   como los otros 3 endpoints de auth. Motivo: `signOut()` depende de una
   sesión "recordada" por el cliente (`setSession`), y el `SupabaseClient`
   del backend es una instancia única y sin estado compartida entre
   requests de usuarios distintos — usarlo así arriesgaría filtrar estado
   de sesión de un usuario a otro. En su lugar, `logout` queda como ruta
   **protegida** por el guard (exige el access token vigente, igual que
   cualquier otra ruta protegida) y llama directo al endpoint REST de
   GoTrue (`POST /auth/v1/logout`) con ese token, sin tocar ningún estado
   compartido del cliente.

   A diferencia de los puntos 3 y 4 de esta misma decisión (agregar
   `/auth/refresh` y exigir JWT Signing Keys), que sí fueron indicados
   explícitamente por el usuario en plan mode antes de escribir código,
   este cambio de contrato de una ruta (pública → protegida, respecto de
   lo descrito en el plan aprobado) se aplicó directamente durante la
   implementación sin pausar a confirmarlo primero. La decisión en sí se
   sostiene, pero queda anotado como precedente de proceso: cambios de
   este tipo — contrato de ruta, alcance distinto al plan aprobado — se
   confirman con el usuario *antes* de aplicarse, no se reportan después.
6. `jose` se fija en la serie 5.x (`^5.10.0`), no 6.x: la v6 es ESM-puro
   sin condición `require` en su `package.json` (`exports["."]` solo
   define `default`), lo que rompe a Jest (que no soporta `require(esm)`
   de forma transparente) aunque Node 22+ sí puede cargarlo de forma
   nativa. La v5 mantiene exports duales `require`/`import`.

**Consecuencias:** Ver `backend/src/auth/` (módulo completo) y
`backend/src/users/`. El guard exige "algún usuario autenticado" en toda
ruta no marcada `@Public()`, incluyendo `GET /api/v1/jobs/:id` (antes
abierta) — no verifica pertenencia todavía porque `Job` no tiene relación
con un usuario hasta que Evidence/Reports (Fases 6/7) la introduzcan.

---

## D-005 — Modelo de monetización preferido: freemium (informes pagos tras un límite gratuito)

**Fecha:** 2026-07-23
**Estado:** Nota de roadmap — preferencia de producto, sin detalle final;
fuera del MVP, no se implementa aún

**Contexto:** El Technical Spec v2.1 §8 ("Fuera del Alcance") ya excluye
explícitamente "Créditos, suscripciones, pagos y facturación" del MVP. El
usuario adelanta, para cuando se diseñe esa parte del producto, cuál es
el modelo de monetización preferido — todavía sin definir en detalle,
pero con la forma general ya clara: **freemium**. Cada cuenta tiene 1-2
diagnósticos gratuitos; a partir de ahí, generar un informe tiene costo.

**Decisión:**

1. Modelo preferido: freemium por cuenta, no por vehículo ni por
   investigación — el límite de diagnósticos gratuitos se cuenta a nivel
   `Users`.
2. La unidad que se cobra es **generar un informe** (`POST
   .../report`, Fase 7), no crear una investigación ni conversar con la
   IA — consistente con que el valor entregado es el informe, no el
   proceso de investigación en sí.
3. El mecanismo de cobro en sí (proveedor de pagos, planes, facturación)
   se define y construye más adelante — no ahora. Lo que sí queda
   contemplado desde ya es que el **diseño** del flujo de generación de
   informe en Fase 7 debe dejar un punto de extensión para esta
   validación, para no requerir un refactor estructural cuando el cobro
   se implemente (mismo criterio que el Technical Spec ya aplica al
   Vehicle Data Provider y al RAG: la interfaz/punto de extensión existe
   desde el diseño, la implementación completa puede ser posterior).
4. No se modela nada en el schema de datos todavía (no hay
   `credits`/`entitlements`/campos de conteo en `Users` ni en
   `Investigations`). Se define recién cuando se diseñe Fase 7 en detalle.

**Consecuencias — a tener en cuenta cuando se diseñe la Fase 7
(Informes):**
- El flujo `POST /investigations/{id}/report` (§11.3) va a necesitar, antes
  de encolar el job `GENERATE_REPORT`, una validación de si la cuenta
  tiene diagnósticos gratuitos disponibles o corresponde cobrar — el punto
  exacto de esa validación (en `Reports` module vs. un módulo de
  facturación separado) se decide al diseñar esa fase, no ahora.
- Esta nota **no** autoriza todavía ningún cambio de schema, endpoint de
  pagos, ni lógica de cobro — es solo la preferencia de producto a
  considerar cuando corresponda.
- Antes de implementar, falta definir (fuera del alcance de esta entrada):
  cuántos diagnósticos gratis exactos (1 o 2), qué pasa con investigaciones
  ya iniciadas cuando se agota el límite, proveedor de pagos, y si el
  límite se resetea alguna vez (mensual, nunca, etc.).

---

## D-006 — Fase 4 (Investigaciones): "Eliminar caso" en Draft y transición dedicada `/start`

**Fecha:** 2026-07-23
**Estado:** Resuelto — vigente para el MVP (puntos 1-2); punto 3 queda
anotado, sin resolver

**Contexto:** Al planificar la Fase 4 se leyó directamente el PRD v3.2
Fase 6 (§27-32) en vez de apoyarse solo en el resumen del Technical Spec
— la máquina de estados de `Investigations` ya tiene un antecedente de
bug documentado (D-002, que restauró `READY_TO_ANALYZE`). Esa lectura
encontró dos discrepancias adicionales entre PRD y Technical Spec.

**Decisión:**

1. **`DELETE /investigations/{id}` se agrega a la API**, aunque el
   Technical Spec §11.3 no lo lista. El PRD Estado 1 ("Caso Creado", §28)
   permite explícitamente la acción "Eliminar caso"; el Technical Spec
   solo define `POST .../close`, y ese endpoint —con la máquina de
   estados corregida en D-002— solo es válido desde `Report Generated`,
   dejando sin cobertura la acción que el PRD sí exige para casos en
   Draft. El nuevo endpoint hace soft-delete (`deleted_at`) y **solo**
   funciona con `current_status = DRAFT` (409 en cualquier otro estado).
   Mismo tratamiento que `/auth/refresh` en D-004: adición documentada,
   no una desviación silenciosa del contrato congelado.
2. **La transición `Draft → Active` ("iniciar investigación") se expone
   como `POST /investigations/{id}/start`**, un endpoint dedicado, en vez
   de sobrecargar `PATCH /investigations/{id}` con semántica de cambio de
   estado — mismo patrón que `POST .../close` ya establece para la otra
   transición nombrada explícitamente en el roadmap (§16.1: "estados
   (incl. transición Report Generated → Active)").
3. **Nota sin resolver, no bloqueante:** el PRD §30 ("Eventos que
   Producen Cambios de Estado") lista "Cancelar investigación" (evento de
   usuario) y "Archivar caso" (evento de sistema) como válidos, pero
   ninguno de los dos tiene una fila correspondiente en la tabla oficial
   de transiciones (§29 — que el propio PRD describe como "la referencia
   oficial... ninguna transición no listada aquí está permitida"). Es
   decir, hoy no existe ninguna forma documentada de cancelar una
   investigación ya en curso (`Active` en adelante) — solo de descartar
   una que todavía está en `Draft` (punto 1 de esta decisión). No se
   resuelve acá: no bloquea el alcance mínimo de la Fase 4, y requiere una
   decisión de producto (¿se agrega una transición nueva a `Archived`
   desde varios estados? ¿"cancelar" es distinto de "archivar"?) que
   corresponde tomar cuando el caso de uso de abandono real se vuelva
   relevante (probablemente alrededor de la Fase 5, cuando existan
   conversaciones activas que un usuario pueda querer abandonar).

**Consecuencias:** Ver `backend/src/investigations/`. La tabla de
transiciones completa vive en `investigation-state-machine.ts`
(`canTransition`), fuente única de verdad, sin duplicarse. Cuando se
retome el punto 3, revisar también si `Vehicle`/`User` necesitan el mismo
patrón de "soft-delete restringido a un estado específico" en algún otro
lugar del dominio, para mantener consistencia.

---

## D-007 — Estrategia de lanzamiento: beta privada antes del lanzamiento público

**Fecha:** 2026-07-23
**Estado:** Nota de roadmap — preferencia de producto; aplica al diseño de
la Fase 8 (Beta), no bloquea ninguna fase actual

**Contexto:** El usuario define la estrategia de salida al mercado:
primero una beta privada con conocidos/familiares, iterar según el
feedback recibido, y solo después el lanzamiento oficial público. Esto es
consistente con lo que el Technical Spec §8 ("Fuera del Alcance") ya
excluye del MVP — "Microservicios, Kubernetes y orquestación avanzada" —
por lo que no introduce ninguna tensión nueva con lo ya congelado, solo
lo confirma con un criterio de producto explícito.

**Decisión:**

1. El lanzamiento ocurre en dos etapas: **beta privada** primero (grupo
   chico de conocidos/familiares), iteración según feedback real, y
   **lanzamiento público** recién después.
2. La Fase 8 (Beta) del roadmap debe diseñarse para ese grupo chico, no
   para infraestructura de escala completa desde el día uno:
   - Backend: un servicio de hosting económico tipo Railway o Render, no
     infraestructura propia ni orquestación avanzada.
   - Distribución de la app móvil: Expo internal distribution / TestFlight
     (iOS), no publicación en las stores públicas todavía.
3. No se elige proveedor específico ni se diseña la infraestructura ahora
   — eso corresponde a cuando se llegue a diseñar la Fase 8 en detalle.
   Esta entrada solo fija el criterio ("simple y barato para pocos
   testers, no escala completa") para cuando corresponda.

**Consecuencias — a tener en cuenta cuando se diseñe la Fase 8 (Beta):**
- No sobre-diseñar infraestructura (IaC completo, CDN, balanceo de carga,
  alta disponibilidad multi-región) para el primer despliegue — se
  reevalúa si el producto efectivamente escala más allá de la beta
  privada, no antes.
- La elección concreta de proveedor de hosting (Railway/Render u otro) y
  la configuración de Expo internal distribution/TestFlight se deciden
  al diseñar esa fase, no ahora.
- No afecta el desarrollo de las Fases 5-7 (AI Chat, RAG, Evidencia,
  Informes) en curso — el backend sigue desarrollándose igual
  independientemente de dónde se despliegue después.

---

## D-008 — Fase 5 (AI Chat): `recommendedState` sin `ANALYZING`, y atomicidad del turno de mensaje

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Al planificar la Fase 5 se leyó directamente el PRD v3.2
(Fase 3 — Sistema de Inteligencia; Fase 8 — Sistema Conversacional, §49-64;
Fase 12 — Especificación del Sistema de IA, §113-130; Fase 17 —
Implementación del Sistema de IA, §221-241) en vez de apoyarse solo en el
resumen del Technical Spec — mismo criterio que encontró los huecos de
D-006. Esa lectura encontró una discrepancia del mismo tipo que D-002/D-006.

**Decisión:**

1. **`recommendedState` nunca puede ser `ANALYZING`.** El Technical Spec
   §14.10 define `recommendedState: ACTIVE | WAITING_EVIDENCE | ANALYZING`
   como salida posible de la IA, pero eso contradice tanto la tabla de
   transiciones ya corregida en D-002 (`Active` nunca transiciona directo a
   `Analyzing`, solo vía `Ready to Analyze`) como el principio inmutable
   §130 del PRD ("el usuario mantiene el control sobre el momento del
   análisis"). Se corrige a `ACTIVE | WAITING_EVIDENCE | READY_TO_ANALYZE`
   — la IA nunca recomienda analizar directamente, solo puede señalar que
   hay evidencia suficiente (`READY_TO_ANALYZE`); analizar sigue siendo una
   acción exclusiva del usuario. Ver `ai-provider.interface.ts`
   (`AiRecommendedState`) y `dto/ai-structured-response.dto.ts`
   (`RECOMMENDED_STATES`).
2. **El turno de mensaje es atómico end-to-end.** El diseño ingenuo
   ("persistir el mensaje del usuario, después llamar a la IA") se
   descartó: si la salida de la IA falla la validación de schema (§13.8),
   ni el mensaje del usuario que originó la llamada ni ningún cambio de
   estado/hipótesis puede quedar aplicado a medias. En su lugar, el mensaje
   del usuario se mantiene solo en memoria hasta que la respuesta de la IA
   valida correctamente; recién entonces se abre una única transacción
   (`MessagesService.sendMessage`) que persiste el mensaje del usuario, el
   mensaje de la IA, las actualizaciones de hipótesis con su
   `HypothesisRevision`, y — si corresponde — la transición de estado (vía
   `InvestigationsService.transition(..., tx)`, extendido para aceptar un
   cliente de transacción ya abierto). Si la IA falla, no se escribe nada
   en la base de datos: el cliente reintenta el mismo `POST` limpio, sin
   ningún estado intermedio que limpiar.
3. **La señal de seguridad de la IA (`safety.stop`/`safety.message`,
   §124/§237) se persiste en campos propios y consultables** de `Message`
   (`isSafetyStop`, `safetyMessage`), no solo como texto libre enterrado
   dentro de `message` — pedido explícito del usuario al revisar el plan,
   dado que seguridad es prioridad explícita del PRD. Sin funcionalidad
   nueva alrededor todavía en esta fase (por ejemplo, ninguna acción
   automática cuando `isSafetyStop = true`) — solo que el dato quede
   guardado y no se pierda.

**Consecuencias:** Ver `backend/src/ai/` (interfaz, DTO validador,
`ClaudeAiProvider`, prompts) y `backend/src/messages/`
(`MessagesService.sendMessage`). Cuando se redacte formalmente el ADR-000b
mencionado en D-002, agregar también la corrección de §14.10 a la lista de
secciones del Technical Spec a actualizar.

---
