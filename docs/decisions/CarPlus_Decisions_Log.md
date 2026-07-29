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

## D-009 — Fase 5b (RAG técnico): campo `referencedChunkIds` en `RAGRetrievalLog`

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Al planificar la Fase 5b se leyó directamente el PRD v3.2
(capítulo "Actualización Oficial — PRD v3.1", punto 5 — único párrafo
sustantivo sobre RAG) y la Fase 10 completa (§80-94, Base de Conocimiento)
para no confundir ambas: RAG es contexto efímero recuperado en tiempo de
consulta, la Base de Conocimiento es aprendizaje persistente y está
confirmada fuera del MVP (Technical Spec §8). El detalle de implementación
de RAG vive en el Technical Spec (§9.8, §10.7, §14.4/14.5/14.10). Esa
lectura encontró una discrepancia interna del propio Technical Spec.

Además, el pedido inicial de esta fase asumía que
`AiConversationContext`/`referencedDocuments` ya existían desde la Fase
5. No era así: `ai-provider.interface.ts` documentaba explícitamente que
ambos quedaban pendientes para la Fase 5b — omisión deliberada de la
Fase 5, no un olvido. Se corrigió antes de planificar, sin impacto en el
diseño (los campos se agregan ahora, como estaba previsto).

**Decisión:**

1. **`RAGRetrievalLog` gana un segundo campo, `referencedChunkIds`.** El
   §10.7 define el modelo con un único campo `chunk_ids` = "IDs de
   `DocumentChunk` recuperados" (lo que se **ofreció** al modelo como
   contexto). Pero el §14.10 dice que el nuevo campo de salida
   `referencedDocuments` de la IA (los chunks que el modelo **citó**
   realmente en `assistantMessage`) sirve "para poblar `RAGRetrievalLog`
   con la relación real de uso (no solo de recuperación)" — dos señales
   distintas (ofrecido vs. citado) que el modelo de datos tal como está
   solo puede guardar una. Mismo criterio que D-008 con
   `Message.isSafetyStop`: se agrega `referencedChunkIds` (JSON,
   nullable) en vez de perder la señal o forzarla dentro de `chunkIds`.
2. Con el corpus vacío de esta fase (sin documentos reales cargados
   todavía), ambos campos quedan casi siempre `[]`/`null` en la práctica
   — la corrección es sobre el esquema, no sobre el comportamiento
   observable hoy. Queda listo para cuando haya documentos reales.

**Consecuencias:** Ver `backend/prisma/schema.prisma`
(`RagRetrievalLog`), `backend/src/rag/` (`DocumentRetrievalService`,
`DocumentIngestionService`) y `backend/src/messages/messages.service.ts`
(persiste ambos campos dentro de la misma transacción atómica del turno,
mismo patrón de D-008).

---

## D-010 — Nombre del producto: "Carrum" reemplaza a "CarPlus"

**Fecha:** 2026-07-24
**Estado:** Resuelto — decisión de producto; ejecución diferida, no
bloquea ninguna fase actual

**Contexto:** El usuario elige el nombre definitivo del producto:
**Carrum** (del latín, raíz de "carro"/"car"), en reemplazo de "CarPlus"
(nombre de trabajo usado hasta ahora en todo el código, la documentación
y el repositorio).

**Decisión:**

1. El nombre del producto es **Carrum**. "CarPlus" queda como nombre de
   trabajo histórico, documentado acá para trazabilidad, no como el
   nombre vigente.
2. Es una decisión de producto/branding, no de arquitectura — **no
   requiere ningún cambio de código, esquema, ni documento ahora mismo**.
3. El renombrado (repositorio `CarpL` en GitHub, `package.json` del
   backend, nombre visible de la app móvil, toda la documentación en
   `docs/` incl. PRD/Technical Spec/este mismo log, variables de entorno
   o config que referencien el nombre) se ejecuta **en un solo paso**,
   no de forma incremental fase a fase — evita dejar el proyecto en un
   estado híbrido con unas partes diciendo "CarPlus" y otras "Carrum".
4. Momento de ejecución: más cerca de la Fase 8 (Beta,
   [[carplus_launch_strategy]]) o cuando el usuario lo decida
   explícitamente — no antes. Ninguna fase actual (5b en adelante) debe
   iniciar el renombrado por su cuenta.

**Consecuencias:** No hay cambios inmediatos. Cuando se ejecute el
renombrado: revisar `backend/package.json` (`name`), el repositorio
GitHub (nombre `CarpL` y posiblemente la URL), todos los documentos en
`docs/prd/`, `docs/technical-spec/` y este Decisions Log, cualquier
string visible al usuario en la futura app móvil, y el nombre del
proyecto Supabase si se considera parte del rebranding. Hasta entonces,
seguir usando "CarPlus"/"CarpL" en código y commits sin mencionar
"Carrum" para no crear inconsistencia a medio camino.

---

## D-011 — Fase 6 (Evidencia): sin endpoint DELETE, análisis automático solo para IMAGE

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP (punto 1); nota abierta sin
resolver (punto 2)

**Contexto:** Al planificar la Fase 6 se leyó directamente el PRD v3.2
Fase 9 (§65-79, Sistema de Evidencia) y Fase 6 (§26-28, Estados del
Sistema) en vez de apoyarse solo en el resumen del Technical Spec —
mismo criterio que encontró los huecos de D-002/D-006/D-008/D-009. Esa
lectura encontró una discrepancia del mismo tipo, y confirmó una
limitación real de la IA elegida (Claude) frente a lo que pide §13.6.

**Decisión:**

1. **Sin `DELETE .../evidence/{evidenceId}`.** RSE-008 del PRD dice
   explícitamente "La eliminación de evidencia por parte del sistema no
   estará permitida" — sin excepción por estado, a diferencia de
   `Investigations` (D-006, DELETE acotado a Draft). §77 exige además
   "impedir modificaciones posteriores al registro" y "permitir su
   consulta durante toda la vida del caso"; la Figura 10 (UX de la
   pantalla de evidencia) tampoco describe ninguna acción de eliminar.
   El Technical Spec (§11.3) igual lista ese endpoint — se resuelve a
   favor del PRD, no se implementa.
   **Nota abierta, sin resolver:** qué hacer si un usuario sube evidencia
   por error (una foto no relacionada, o sensible). No se resuelve en
   esta fase — queda anotado como consideración de producto para cuando
   se diseñe la experiencia de frontend de carga de evidencia (posible
   mecanismo de "ocultar de la vista" que no borre el registro
   subyacente, en vez de eliminación real).
2. **Análisis automático real solo para `IMAGE`.** El flujo asíncrono
   (§13.6) dice que `AI` analiza el archivo (imagen/video/audio) para
   extraer variables, pero Claude —único `AiProvider` real— no procesa
   video ni audio nativamente, solo visión de imágenes. Se sigue
   permitiendo subir evidencia de los 3 tipos (el PRD, Estado 2, lista
   "Adjuntar imágenes/videos/audios" como acción permitida), pero el job
   `ANALYZE_EVIDENCE` solo llama de verdad a la IA para `IMAGE`; para
   `VIDEO`/`AUDIO` el job igual se marca `DONE`, pero `Evidence.analysisJson`
   queda `null` — limitación documentada, no un bloqueo, mismo patrón que
   el adaptador nulo de Vehicle Data Provider/RAG: infraestructura real,
   capacidad diferida hasta que exista un proveedor que soporte esos
   formatos.

**Consecuencias:** Ver `backend/prisma/schema.prisma` (`Evidence` sin
`deletedAt`), `backend/src/evidence/` (`EvidenceController` sin ruta
DELETE, `EvidenceAnalysisJobHandler` con early-return para VIDEO/AUDIO) y
`backend/src/ai/adapters/claude-ai-provider.ts` (`analyzeEvidence` solo
acepta `evidenceType: 'IMAGE'` en su tipo de entrada).

---

## D-012 — Fase 6: se implementa la transición `READY_TO_ANALYZE → ACTIVE` (D-002, nunca disparada hasta ahora)

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP

**Contexto:** El usuario detectó, revisando el plan de la Fase 6, que
D-002 (Fase 4) había restaurado la transición `Ready to Analyze →
Active` ("usuario prefiere seguir investigando") en la máquina de
estados, pero ningún código la disparaba nunca: `MessagesService` (Fase
5) solo aceptaba `currentStatus === 'ACTIVE'`, y el `EvidenceService`
recién diseñado para esta fase tampoco la contemplaba. Un caso que
llegaba a `READY_TO_ANALYZE` quedaba sin forma de volver a `ACTIVE` hasta
que existiera "Analizar ahora" (Fase 7).

**Decisión:**

1. Se corrige ahora, no se difiere a la Fase 7 — ambos puntos de entrada
   ya se estaban tocando en esta misma fase (Messages para D-011/RAG,
   Evidence recién construido), y dejar la asimetría un ciclo más (una
   vía de "seguir investigando" resuelta, la otra no) generaría más
   confusión que la corrección misma.
2. **`MessagesService.sendMessage`** acepta `currentStatus ∈ {ACTIVE,
   READY_TO_ANALYZE}` (`WAITING_EVIDENCE` sigue bloqueando mensajes: ese
   estado exige evidencia, no conversación). Si el estado original era
   `READY_TO_ANALYZE`, la misma transacción del turno transiciona primero
   a `ACTIVE` (`'USER_CONTINUED_INVESTIGATION'`, `'FRONTEND'`) antes de
   evaluar `aiResponse.recommendedState`. Detalle de implementación
   importante, encontrado durante el diseño: esa comparación debe
   hacerse contra el estado **ya actualizado** (`effectiveStatus`), no
   contra el valor pre-turno — comparar contra `'READY_TO_ANALYZE'`
   intentaría una segunda transición `ACTIVE → ACTIVE`, que
   `canTransition` rechaza (no existe en la tabla), haciendo fallar toda
   la transacción.
3. **`EvidenceService.uploadEvidence`** acepta también `READY_TO_ANALYZE`
   (además de `ACTIVE`/`WAITING_EVIDENCE`), con el mismo
   `'USER_SUBMITTED_EVIDENCE'` que ya se usaba para el caso
   `WAITING_EVIDENCE` — "seguir investigando" también puede manifestarse
   como adjuntar más evidencia, no solo mandar un mensaje.

**Consecuencias:** Ver `backend/src/messages/messages.service.ts`
(`effectiveStatus`) y `backend/src/evidence/evidence.service.ts`
(`STATUSES_THAT_RETURN_TO_ACTIVE`). Ambos casos cubiertos por tests
unitarios y e2e dedicados (turno de mensaje y subida de evidencia desde
`READY_TO_ANALYZE`).

---

## D-013 — Nota de roadmap para Fase 7 (Informes): piezas probablemente involucradas y tiempo estimado de reparación

**Fecha:** 2026-07-24
**Estado:** Resuelto — implementado en la Fase 7

**Contexto:** El usuario adelanta dos campos que deberá incluir
`report_json` cuando se diseñe la Fase 7, con el mismo criterio de
certeza que el PRD v3.2 §43 ("Costos Aproximados") ya exige para el
costo estimado: nunca inventar un valor si no hay información
suficiente, y siempre acompañar cualquier estimación con la advertencia
de que depende de variables externas (taller, región, disponibilidad de
repuestos).

**Decisión:**

1. **Piezas probablemente involucradas por hipótesis**: una lista de
   piezas/componentes técnicos asociados a cada hipótesis del informe —
   información técnica (qué pieza), no un precio — al mismo nivel de
   certeza que las causas probables ya definidas (nunca una lista
   cerrada/definitiva, sino "probablemente involucradas").
2. **`estimatedRepairTime`**: mismo campo estructural que
   `costEstimate` (§43: `available`, `approximateRange`, `disclaimer`)
   pero en horas de mano de obra en vez de dinero. Mismas reglas exactas
   de §43: si no hay información suficiente, el informe no inventa un
   rango; si la hay, se muestra un rango aproximado con advertencia
   explícita de que depende del taller y la disponibilidad de repuestos
   — nunca un compromiso de tiempo firme.
3. Ninguno de los dos se implementa ahora. La Fase 6 (Evidencia, en
   curso) no los toca. Quedan anotados para el diseño detallado de la
   Fase 7.

**Consecuencias:** Cuando se diseñe `report_json` en la Fase 7, incluir
`estimatedRepairTime` junto a `costEstimate` con la misma estructura
(`available`/`approximateRange`/`disclaimer`), y una lista de piezas
probablemente involucradas por hipótesis — ambos sujetos a la misma
regla de "nunca inventar sin evidencia suficiente" que ya rige el resto
del informe (D-001, PRD §43).

**Resolución (Fase 7):** `ReportHypothesis.likelyPartsInvolved: string[]`
y `ReportJson.estimatedRepairTime` (mismo shape que `CostEstimate`, en
horas) agregados a
`docs/technical-spec/contracts/report-json.schema.ts`
(`REPORT_SCHEMA_VERSION` → `1.1.0`), y reflejados en
`AiReportContent`/`AiReportContentDto` (`backend/src/ai/`) y en el
`report_json` que persiste `ReportGenerationJobHandler`. Ambos sujetos a
la misma regla de honestidad que el resto del informe: si no hay
evidencia suficiente, `available: false` y ningún rango inventado
(codificado explícitamente en `report-generation-prompt.ts`).

---

## D-014 — Fase 7 (Informes): exportación/descarga de PDF diferida, no se implementa en el MVP

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Al planificar la Fase 7, la lectura directa del PRD v3.2
§34-48 encontró una discrepancia grande y repetida con el Technical
Spec. El PRD marca la exportación en PDF como fuera del alcance del MVP
en dos lugares independientes y consistentes entre sí:
- §48 ("Evolución del Informe"), que lista explícitamente
  "Exportación en PDF" y "Compartir el informe mediante un enlace"
  entre las funcionalidades futuras, cerrando con: "Estas
  funcionalidades no forman parte del alcance del MVP."
- El Estado 7 ("Informe Generado", acciones permitidas por estado),
  cuya propia lista marca "Compartir informe (futuro)" y "Descargar
  informe (futuro)".

El Technical Spec v2.1, en cambio, insiste en "PDF bajo demanda" como
entregable MVP de la Fase 7 en más de 10 lugares distintos: tabla de
arquitectura (línea 68), roadmap (línea 102), tabla de API —
`GET /api/v1/investigations/{id}/report.pdf` (línea 580), objetivo de
performance (línea 602), responsabilidad del módulo Reports (línea
685), backlog de roadmap (línea 915), prioridad P1 (línea 925), y
Definition of Done (líneas 938 y 958).

**Decisión:** Se resuelve a favor del PRD — mismo criterio que
D-002/D-006/D-011 (el PRD prevalece en decisiones de alcance/producto,
el Technical Spec en detalles de implementación; acá la pregunta es "
¿existe esta funcionalidad en el MVP?", inequívocamente de alcance).
Confirmado explícitamente con el usuario antes de implementar.

1. Esta fase construye `report_json` completo, versionado
   (`report_version`/`is_latest`) y consultable por API
   (`GET .../report`, `GET .../reports`, `GET .../reports/{version}`).
2. **No** se implementa ningún endpoint `.pdf` ni se agrega ninguna
   dependencia de generación de PDF en esta fase.
3. El Technical Spec queda con una discrepancia de alcance no corregida
   en su propio texto (mismo tratamiento que otras veces: esta bitácora
   es la fuente de verdad de la resolución real, no se edita el
   Technical Spec en este proyecto).

**Consecuencias:** `backend/src/reports/reports.controller.ts` no
expone `.pdf`. Si más adelante se decide construir la exportación (post-
MVP), es una fase/decisión nueva, no una corrección de esta.

---

## D-015 — Fase 7 (Informes): "Analizar ahora" solo es legal desde `READY_TO_ANALYZE`; cierre del ciclo `REPORT_GENERATED → ACTIVE`

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP

**Contexto:** El Technical Spec v2.1 §13.7 describe el flujo de
`POST .../report` con este texto literal: "`Reports` valida que el caso
esté en `Analyzing` (o dispara la transición `Active/Waiting Evidence →
Analyzing` si el usuario solicitó 'Analizar ahora')". Esto sugeriría que
"Analizar ahora" podría disparar la transición directamente desde
`ACTIVE`/`WAITING_EVIDENCE`, sin pasar por `READY_TO_ANALYZE`.

Al leer directamente la tabla oficial de transiciones del PRD (§29 —
"ninguna transición no listada aquí está permitida") se confirmó que
esto es un artefacto desactualizado: la única fila que lleva a
`Analizando` es `Listo para Analizar → Analizando` ("El usuario
selecciona 'Analizar ahora'"). No existe ninguna fila
`Investigando/Esperando Respuesta → Analizando`. Esto coincide
exactamente con `investigation-state-machine.ts`, ya construido y
probado desde D-002 (`ACTIVE: ['WAITING_EVIDENCE', 'READY_TO_ANALYZE']`
— sin `ANALYZING` en esa lista). El texto de §13.7 es anterior a la
restauración de la tabla de 7 estados en D-002 y quedó sin corregir,
mismo tipo de artefacto que D-002 mismo corrigió en su momento.

La misma tabla oficial (§29) también confirma la recuperación de error
ya prevista en el código: `Analizando → Listo para Analizar` ocurre "si
hubo un error durante el análisis (RC-006)".

Por separado, el Estado 7 del PRD ("Informe Generado") permite
explícitamente "continuar investigando el mismo problema dentro del
mismo caso (retorna al estado Investigando; ver RI-009, Fase 7).
Incluye responder nuevas preguntas, adjuntar nueva evidencia o describir
nuevos síntomas" — la misma tabla §29 lista `Informe Generado →
Investigando`.

**Decisión:**

1. `POST /investigations/{id}/report` exige `currentStatus ===
   'READY_TO_ANALYZE'` (409 en cualquier otro estado), sin excepción —
   no se implementa el atajo que sugiere el Technical Spec §13.7.
2. `ReportGenerationJobHandler`, si la llamada a la IA falla, transiciona
   la investigación `ANALYZING → READY_TO_ANALYZE`
   (`'REPORT_GENERATION_FAILED'`, `'BACKEND'`) antes de relanzar el error
   — implementa la recuperación de error de RC-006/§29, evita que un caso
   quede encallado en `ANALYZING` sin salida.
3. **`MessagesService.sendMessage`** y **`EvidenceService.uploadEvidence`**
   (D-012) se extienden una vez más: `REPORT_GENERATED` se agrega como
   estado de origen válido, transicionando primero a `ACTIVE`
   (mismo `'USER_CONTINUED_INVESTIGATION'` que ya se usa para
   `READY_TO_ANALYZE`) — implementa RI-009 ("continuar investigando" tras
   un informe genera una nueva versión en el próximo "Analizar ahora", no
   reemplaza la anterior).

**Consecuencias:** Ver `backend/src/reports/reports.service.ts`
(`requestAnalysis`), `backend/src/reports/report-generation.job-handler.ts`
(manejo de error), `backend/src/messages/messages.service.ts` y
`backend/src/evidence/evidence.service.ts` (estado de origen
`REPORT_GENERATED`). El Technical Spec §13.7 queda con esta discrepancia
sin corregir en su propio texto — esta bitácora es la fuente de verdad.

---

## D-016 — Fase 8 (Beta): alcance acotado a endurecimiento backend, sin resolver proveedores pendientes ni desplegar

**Fecha:** 2026-07-24
**Estado:** Resuelto — vigente para el MVP

**Contexto:** El Technical Spec v2.1 marca como P1 ("necesario para beta
utilizable") la integración real de Vehicle Data Provider, un corpus
RAG inicial, y PDF — los tres con alcance mínimo por decisiones de
negocio/proveedor no resueltas (Fase 3b, Fase 5b, D-014). El Technical
Spec §12/§20 y D-007 (beta privada vía Expo/TestFlight) además asumen
una app móvil existente y un despliegue real a un hosting, ninguno de
los dos construido todavía (`mobile/` sigue vacío; el proyecto nunca se
desplegó fuera de Docker local). Se confirmó con el usuario, antes de
planificar, cómo encarar estas tres tensiones en vez de forzar una
resolución dentro de esta fase.

**Decisión:**

1. **Vehicle Data Provider / RAG / PDF**: se mantiene el alcance mínimo
   ya vigente (adaptador nulo de VDP, corpus RAG vacío, sin PDF, D-014).
   Fase 8 endurece y prueba lo que ya existe, sin resolver esos
   proveedores/decisiones de negocio pendientes.
2. **Alcance móvil**: Fase 8 es **backend-only**. La verificación E2E es
   vía API directa (supertest/e2e-spec), no a través de una app real. El
   frontend (`mobile/`) queda para una fase futura separada, no incluida
   en el roadmap de esta fase.
3. **Despliegue real**: se **prepara, no se despliega**. El backend
   queda listo para desplegar (`backend/DEPLOYMENT.md`: checklist de
   variables de entorno, migraciones, healthchecks, forma recomendada
   de hosting per D-007) pero no se aprovisiona ningún hosting real ni
   se ejecuta un despliegue — decisión de infraestructura que puede
   tomarse en un paso aparte, más corto, una vez que el código esté
   listo.
4. **RSEC-006 (PRD Fase 19, auditoría de "toda acción relevante")** se
   satisface vía logs JSON estructurados enriquecidos (`userId`
   pseudonimizado + `investigationId` en cada línea, más eventos
   explícitos `USER_LOGIN`/`USER_LOGOUT`/`USER_REGISTERED`/
   `CASE_SOFT_DELETED`) — no se crea una tabla de auditoría nueva. Los
   logs estructurados ya son, por definición propia del Technical Spec
   (§13.10), la señal mínima exigida.

**Consecuencias:** "Beta" para este proyecto se acota a seguridad
(rate limiting, `helmet`, logs enriquecidos), rendimiento (prueba de
concurrencia §15.4 — ver también la corrección de
`InvestigationsService.transition` a `SELECT ... FOR UPDATE`,
descubierta al escribir esa prueba), observabilidad (`/health/ready`
extendido con `pgvector`/worker de `jobs`), el arnés de evaluación del
AI Engine (§15.5, `test/ai-eval/`), y la formalización de los ADR
pendientes asociados a fases ya cerradas (`docs/adr/`) — todo
verificable localmente y en CI, sin infraestructura nueva ni un segundo
proveedor de IA/VDP/RAG. ADR-010 (Vehicle Data Provider) queda
explícitamente diferido, no cerrado, hasta que se tome esa decisión de
negocio.

---

## D-017 — Email transaccional: dominio propio (carrum.app) + Resend como SMTP custom de Supabase

**Fecha:** 2026-07-25
**Estado:** Resuelto — SMTP custom conectado y verificado en vivo

**Contexto:** Durante la verificación en vivo de la Fase 2 del frontend
(Auth) se confirmó que el mailer por defecto de Supabase tiene un límite
de envío de emails muy bajo (`over_email_send_rate_limit`, HTTP 429 en
`/auth/v1/recover`) — se agotó con apenas un par de registros de prueba
en la misma sesión. Esto afecta tanto a la confirmación de registro
como a recuperar contraseña, y sería inviable para uso real más allá de
pruebas puntuales.

**Decisión:** Reemplazar el mailer por defecto por un proveedor SMTP
propio. Se compró el dominio **carrum.app** (alineado con D-010,
nombre final del producto), se configuró **Resend**, se agregaron los 4
registros DNS que pide (DKIM, MX, TXT de SPF, DMARC) en Namecheap, y una
vez verificado el dominio se conectó Resend como **SMTP custom** dentro
de Supabase (Authentication → Email → SMTP custom).

**Consecuencias:** Confirmado en vivo tras conectar el SMTP custom:
`POST /auth/forgot-password` contra un email real responde `200
{sent:true}` (antes: 503/429 por el límite del mailer por defecto), y
la misma llamada contra un email inexistente responde idéntico
`200 {sent:true}` — confirma que el mensaje neutro de la pantalla
"Recuperar contraseña" (Fase 2 del frontend) es honesto en ambos casos,
no solo por diseño del código sino verificado contra el proveedor real.
Como se prevé, no hizo falta ningún cambio de código: el backend ya
llamaba a `resetPasswordForEmail`/el flujo de confirmación de Supabase
sin asumir un proveedor de email específico.

---

## D-018 — Frontend Fase 3 (Vehículos): bug de guard corregido en vivo, y gap de `registration_method`/`data_source` documentado

**Fecha:** 2026-07-26
**Estado:** Punto 1 resuelto; punto 2 nota abierta, no bloqueante

**Contexto:** Durante la verificación en vivo de la Fase 3 del frontend
(Vehículos: Home, Agregar vehículo, Confirmar datos) aparecieron dos
hallazgos — uno un bug real ya corregido, el otro un gap del backend
documentado y diferido (ambos confirmados con el usuario antes de
proceder).

**Decisión:**

1. **Bug corregido: el guard de rutas (`src/app/_layout.tsx`, Fase 2)
   dejaba a un usuario ya autenticado trabado en el Splash para
   siempre.** La condición original solo cubría "autenticado dentro de
   `(auth)` → tabs"; un usuario ya logueado (sesión persistida) que
   aterriza directo en la ruta raíz `index` (ni `(auth)` ni `(tabs)` —
   el caso real de reabrir la app, o refrescar el navegador, ya
   logueado) no disparaba ninguna rama del guard, y `index.tsx` no
   tiene redirección propia desde Fase 2. Se corrigió comparando contra
   los grupos protegidos (`(tabs)`/`investigation`) en vez de solo
   contra `(auth)`: `status === 'authenticated' && !inProtectedGroup`
   → redirige a `(tabs)`. Confirmado en vivo: un reload completo con
   sesión guardada ahora carga Home correctamente. Encontrado y
   corregido dentro de esta fase aunque el archivo pertenece a la Fase
   2, con aprobación explícita del usuario antes de tocarlo.
2. **Gap sin resolver, no bloqueante:** el Technical Spec §13.5 punto 6
   dice que al confirmar un vehículo desde patente, `Vehicles` debe
   persistir el registro con `registration_method`/`data_source`/
   `data_synced_at` reales. Pero ni `CreateVehicleDto` ni
   `VehiclesService.create()` los aceptan o setean — todo vehículo
   creado (manual o vía "Confirmar datos") queda con
   `registrationMethod: MANUAL` (default de Prisma) y
   `dataSource`/`dataSyncedAt` siempre `null`, sin importar el origen
   real. Hoy es inobservable: el adaptador nulo de `vehicle-data-provider`
   nunca produce un `SUCCESS` real que confirmar, así que el camino de
   "Confirmar datos" (`(tabs)/vehicles/confirm.tsx`) nunca se alcanza en
   la práctica. No se resuelve en esta fase (frontend-only) — queda
   para cuando se implemente un proveedor real de datos vehiculares
   (Fase 3b) y haya que extender `CreateVehicleDto`/`VehiclesService`
   del backend para aceptar y persistir esos tres campos.

**Consecuencias:** Ver `mobile/src/app/_layout.tsx` (guard corregido).
Cuando se resuelva la Fase 3b (proveedor real de VDP), extender
`backend/src/vehicles/dto/create-vehicle.dto.ts` y
`VehiclesService.create()` para aceptar `registrationMethod`/
`dataSource`/`dataSyncedAt` desde el flujo de confirmación — sin eso,
ningún vehículo registrado por patente quedará marcado como tal en la
base de datos, aunque la UI de "Confirmar datos" ya esté lista desde
esta fase.

---

## D-019 — Frontend Fase 4 (Investigaciones): título derivado de la descripción, e Historial sigue la Figura 17 real

**Fecha:** 2026-07-26
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Al planificar la Fase 4 (Nueva investigación, Historial)
se leyeron directamente Technical Spec §12.3 y §11.3, y se revisaron
las Figuras 8 y 17 de `docs/design/mockups/` como referencia visual
real — mismo criterio que fases anteriores. Esa revisión encontró dos
discrepancias entre el texto del Technical Spec/PRD y los mockups
reales, confirmadas con el usuario antes de implementar.

**Decisión:**

1. **"Nueva investigación" no tiene un campo "Título" propio — se
   deriva de la descripción en el cliente.** La Figura 8 solo muestra
   un campo (Descripción); el título como entrada separada solo
   aparece en el texto de §12.3 ("Seleccionar vehículo, título y
   descripción"). La propia regla de validación de esa misma fila
   dice "no iniciar sin **vehículo ni descripción** válida" — omite
   título de lo que debe validarse, lo que respalda que no es una
   entrada propia del usuario. `CreateInvestigationDto.title` sigue
   siendo obligatorio en el backend (1-200 caracteres): se deriva
   automáticamente tomando la primera oración de la descripción (o
   los primeros 60 caracteres con "…" si no hay una oración corta),
   sin pedírselo al usuario. Ver `deriveTitle()` en
   `mobile/src/app/investigation/new.tsx`.
2. **Historial sigue exactamente la Figura 17, no el texto de §12.3/
   PRD §207.** El mockup real muestra solo fecha + título + vehículo +
   una etiqueta de estado (Investigando/Informe disponible/Archivado)
   — sin "nivel de urgencia" ni "versión del informe", que
   requerirían `reports/` (no nombrado en esta fase) y que además
   chocarían con D-001 (nunca mostrar confianza cruda). Se construyó
   exactamente lo que el mockup muestra.
3. **Bug propio de esta fase, encontrado y corregido durante la
   verificación en vivo:** en `investigation/new.tsx`, las ramas
   `loading`/`error`/`empty` no renderizaban `<Stack.Screen
   options={{title: 'Nueva investigación'}}>` — ese componente solo
   estaba en el `return` final (la rama con el formulario), así que el
   header mostraba el nombre crudo del segmento de ruta ("new") en vez
   del título real mientras la pantalla cargaba, fallaba, o mostraba
   el estado vacío. Corregido envolviendo cada rama temprana en su
   propio `<Stack.Screen>` (mismo título repetido), y reverificado en
   vivo tras el fix.
4. **"Iniciar investigación" encadena `create` + `start`** en una sola
   acción (coincide con el propio texto de "Flujo" de la Figura 8:
   "al iniciar, se crea el caso... y se abre el Chat") — confirmado en
   vivo que la investigación queda `ACTIVE`, no `DRAFT`, antes de
   navegar.
5. **`GET /investigations` no incluye el vehículo relacionado** — el
   Historial cruza por `vehicleId` contra `GET /vehicles` (Fase 3) en
   el cliente, sin pedir un `include` nuevo al backend ni una llamada
   por item.

**Consecuencias:** Ver `mobile/src/app/investigation/new.tsx`
(`deriveTitle`) y `mobile/src/app/(tabs)/history.tsx` (cruce de
vehículos, `statusBadge`). Cuando `reports/` se conecte al frontend
(fase futura), evaluar si Historial debe ampliarse con nivel de
urgencia/versión de informe — hoy queda deliberadamente fuera. Sin
paginación real (`GET /investigations` no acepta parámetros de
paginación todavía) — Historial trae la lista completa en una sola
llamada.

---

## D-020 — Frontend Fase 5 (Chat): evidencia incluida completa (corrección de alcance), apertura sin IA fantasma, y bug real de subida corregido en vivo

**Fecha:** 2026-07-26
**Estado:** Resuelto — vigente para el MVP

**Contexto:** El plan inicial de esta fase excluía adjuntar evidencia
(Foto/Video/Audio), tratándolo como una fase futura por el mismo
criterio que VDP/RAG (adaptador nulo, proveedor externo pendiente). El
usuario corrigió esto antes de implementar: a diferencia de VDP/RAG,
`evidence/` ya es un módulo real del backend, construido y probado
desde su propia Fase 6 — no hay ninguna razón de peso para diferirlo.
Se corrigió el plan e incluyó completo.

**Decisión:**

1. **Evidencia (Foto/Video/Audio) se construye completa esta fase**,
   conectando contra `POST`/`GET /investigations/{id}/evidence`
   además de `messages/`. Solo "Analizar ahora" queda fuera (depende
   de `reports/` y de una pantalla de Informe que no existe todavía).
2. **La Figura 9 muestra a la IA hablando primero, pero el backend no
   puede originar un mensaje sin uno previo del usuario** — la
   descripción inicial (Fase 4) se muestra como una tarjeta fija
   arriba de la conversación, nunca como un mensaje de chat. Ningún
   mensaje con costo real se envía sin que el usuario escriba y
   confirme el suyo primero.
3. **Sin botones de respuesta rápida ni "Por qué preguntamos esto"** —
   el schema de salida de la IA (§14.10) no tiene ningún campo que los
   respalde, solo `assistantMessage`/`question` de texto libre.
4. **`isSafetyStop`/`safetyMessage` se renderizan por primera vez**
   (persistidos desde la Fase 5 original del backend, sin ninguna UI
   hasta ahora) — estilo de advertencia, sin bloquear más mensajes: el
   backend mismo no define ninguna acción especial ahí todavía.
5. **Reglas de bloqueo distintas para mensajes y evidencia**, réplica
   exacta de `MessagesService`/`EvidenceService`: `WAITING_EVIDENCE`
   bloquea mensajes pero no adjuntar (confirmado en vivo).
6. **`expo-av` está deprecado en Expo SDK 57** — la grabación de audio
   usa `expo-audio` (`useAudioRecorder`), confirmado contra la
   documentación versionada real (`docs.expo.dev/versions/v57.0.0`)
   antes de escribir el código, por instrucción de `mobile/AGENTS.md`.
7. **Bug real encontrado y corregido durante la verificación en
   vivo:** la primera subida de evidencia a través de la UI real
   fallaba silenciosamente (el backend nunca recibía el archivo). La
   causa: `src/api/evidence.ts` armaba el `FormData` con el patrón
   `{uri, type, name}` — un atajo que solo entiende el `FormData`
   nativo de React Native (iOS/Android); en web (`react-native-web`),
   `FormData` es la implementación real del DOM y lo ignora,
   produciendo un multipart sin archivo. Confirmado con un `fetch()`
   directo (que sí funcionó, usando un `File` real) antes de
   diagnosticar la causa exacta en el código propio. Corregido
   convirtiendo la URI a un `Blob` real (`fetch(uri).then(r =>
   r.blob())`) antes de adjuntarlo — funciona igual en ambas
   plataformas, ya que Expo también resuelve URIs `file://` locales
   con `fetch`. Reverificado en vivo tras el fix (una foto real,
   analizada correctamente por Claude Vision).
8. **Hallazgo aparte, no de esta fase — anotado para más adelante:**
   `EvidenceService.findByInvestigation` (backend) falla con 500
   entero (`No se pudo generar la URL firmada: Object not found`) si
   **cualquier** `Attachment` de la investigación referencia un
   objeto que ya no existe en Supabase Storage — un solo adjunto
   corrupto tira abajo la lista completa de evidencia, en vez de
   omitir u omitir con una señal solo ese item. Descubierto al insertar
   una fila de prueba vía Prisma sin su objeto real en Storage
   (limpiada después) — no es un escenario alcanzable por el flujo real
   de subida actual (Storage se sube antes que la fila de DB), pero
   vale la pena una revisión de robustez futura del backend.

**Consecuencias:** Ver `mobile/src/api/evidence.ts` (`upload`,
corregido), `mobile/src/app/investigation/[id]/chat.tsx` (línea de
tiempo combinada, reglas de bloqueo), `mobile/src/components/
chat-bubble.tsx` (`isSafetyStop`), `mobile/src/components/
attachment-menu.tsx` (`expo-image-picker`/`expo-audio`). El hallazgo 8
queda como nota de robustez para `backend/src/evidence/
evidence.service.ts`, no bloqueante, no resuelto en esta fase
(frontend-only).

---

## D-021 — Fase 5 (AI Chat): timeout y reintentos propios para `generateResponse()`, bug real diagnosticado en vivo

**Fecha:** 2026-07-26
**Estado:** Resuelto

**Contexto:** Reporte real desde el celular ("No pudimos enviar el
mensaje", ~04:14 hora local) en medio de una conversación larga real
con la IA. El diagnóstico (logs del backend, pino, cruzados contra
`Message`/`Investigation` en Prisma por timestamp) encontró la causa
exacta:

1. `ClaudeAiProvider.generateResponse()` (`backend/src/ai/adapters/
   claude-ai-provider.ts`) no pasaba ningún `timeout` propio a
   `client.messages.create(...)` — a diferencia de `generateReport()`,
   que sí lo hace (`{ timeout: reportTimeoutMs }`). Sin override,
   hereda el timeout global del cliente Anthropic
   (`AI_TIMEOUT_MS=15000`, construido en
   `anthropic-client.provider.ts`).
2. El tiempo de respuesta por turno crece con el largo acumulado de la
   conversación — evidencia real de la misma conversación fallida:
   10.4s → 11.4s → 13.8s en tres turnos consecutivos (turnos 7-9) —
   acercándose cada vez más al techo de 15s.
3. Al cruzar ese techo, el SDK de Anthropic reintenta automáticamente
   (`maxRetries` por defecto del SDK es 2, confirmado en
   `node_modules/@anthropic-ai/sdk/client.d.ts`), sin que el usuario
   vea ninguna señal intermedia — el request final tarda ~3× el
   timeout nominal (~46s reales en los logs) antes de fallar.

**Decisión:**

1. `generateResponse()` recibe su propio timeout, vía nueva variable
   `AI_CONVERSATION_TIMEOUT_MS` (default 30000ms) —
   `src/config/configuration.ts`, `src/config/env.validation.ts`,
   `.env`/`.env.example`. Más generoso que `AI_TIMEOUT_MS` (15s, que
   sigue existiendo como default de construcción del cliente, ya sin
   ningún call site real que lo herede) pero más corto que
   `AI_REPORT_TIMEOUT_MS` (60s): a diferencia de `generateReport()`
   (asíncrono vía `jobs`), esta llamada es síncrona, con el usuario
   esperando en vivo.
2. `maxRetries: 0` para esta llamada específica — mejor fallar rápido
   y con un error claro que reintentar en silencio y demorar 3× el
   timeout sin que el usuario sepa qué está pasando. `generateReport()`
   no se toca en este momento (sigue heredando el `maxRetries` por
   defecto del SDK; no tiene la misma presión de espera en vivo) — ver
   punto 4, extensión posterior que revierte esta parte.
3. La nota "Mejora propuesta — Política de resumen" ya existente en el
   Technical Spec §14.4 (resumen estructurado del contexto
   conversacional cuando excede un umbral de tokens, preservando
   hechos/contradicciones/hipótesis/evidencia, solo en el prompt
   enviado al proveedor, nunca en `Messages`) deja de ser una mejora
   hipotética: el punto 2 de este contexto es evidencia real de que el
   costo por turno crece con el largo de la conversación y en algún
   momento vuelve a chocar contra cualquier timeout, por más generoso
   que sea — el fix de este mismo D-021 alivia el síntoma, no la causa.
   Sigue sin implementarse ahora; sube de prioridad para cuando se
   planifique una fase de pulido (mismo tratamiento que D-014/D-016:
   esta bitácora es la fuente de verdad de la resolución/prioridad
   real, no se edita el texto del Technical Spec).
4. **Extensión (2026-07-27):** `generateReport()` también pasa a
   `maxRetries: 0`, mismo criterio exacto que el punto 2 — el frontend
   ya tiene su propia ventana de polling con margen real sobre
   `AI_REPORT_TIMEOUT_MS` (D-025), así que dejar que el SDK reintente en
   silencio ya no aporta nada: solo demora 3× la respuesta sin que el
   usuario vea ninguna señal intermedia, igual que el problema original
   de este mismo D-021. No es una decisión nueva — es la misma decisión
   aplicada al segundo call site que originalmente había quedado afuera
   (punto 2 de arriba) por no tener, en ese momento, la misma presión de
   espera en vivo; con la ventana de polling del frontend ya cubriendo
   ese margen, la razón para dejarlo afuera dejó de aplicar.

**Consecuencias:** `backend/src/ai/adapters/claude-ai-provider.ts`
(`generateResponse` y, desde el punto 4, también `generateReport`),
`backend/src/config/configuration.ts`,
`backend/src/config/env.validation.ts`, `backend/.env`,
`backend/.env.example`, `backend/src/ai/adapters/
claude-ai-provider.spec.ts` (tests actualizados a la nueva firma de
`messages.create` en ambos métodos). Suite completa (201 tests) y lint
verificados tras el cambio.

---

## D-022 — Prompt de la IA (dialecto y brevedad) y flujo Home/Nueva Investigación

**Fecha:** 2026-07-26
**Estado:** Resuelto

**Contexto:** Verificación en vivo de Fase 5 encontró cuatro problemas
reales de producto, además del bug de navegación del punto 1 (sin
entrada propia en esta bitácora — fix de una línea, causa documentada
como comentario en `header-back-button.tsx`, no amerita su propia
decisión):

1. La IA respondía en voseo rioplatense ("vos", "podés", "contame") en \
vez de español chileno/neutro — el texto de los tres prompts
(`system-prompt.ts`, `report-generation-prompt.ts`,
`evidence-analysis-prompt.ts`, más `build-context-prompt.ts`) estaba
escrito en voseo y no había ninguna instrucción de dialecto; el modelo
aparentemente imitaba el registro del propio texto de instrucciones.
2. Las preguntas de la IA venían largas, con explicación acumulada
antes de la única pregunta del turno — el principio 3 existente ("Una
pregunta, un objetivo", PC-002 del PRD) ya prohibía combinar preguntas
distintas, pero no exigía brevedad.
3. En Home, la tarjeta de "vehículo activo" no era tocable — sin
mockup de "Detalle de vehículo" en `docs/design/mockups/` (confirmado),
se le propusieron al usuario 3 opciones (Mis Vehículos, Historial
filtrado por vehículo —requiere construir un filtro que no existe—, o
dejarla no-tocable) y se resolvió por **Mis Vehículos**: cero UI nueva,
reutiliza la lista ya existente.
4. La descripción escrita en "Nueva investigación" se mostraba de
nuevo como tarjeta fija en Chat, y el usuario tenía que volver a
escribirla como su primer mensaje real — redundante.

**Decisión:**

1. Se reescribe el texto de los cuatro archivos de prompt de voseo a
   tuteo neutro/chileno, y se agrega una regla explícita de dialecto en
   cada uno ("usa siempre 'tú', nunca 'vos'..."). Versión bumpeada en
   cada archivo (`SYSTEM_PROMPT_VERSION` 3→4,
   `REPORT_GENERATION_PROMPT_VERSION` 1→2,
   `EVIDENCE_ANALYSIS_PROMPT_VERSION` 1→2) siguiendo la convención ya
   establecida en cada archivo. Se extendió el fix a los tres prompts
   (no solo al conversacional) por consistencia — el informe y el
   resumen de evidencia son igual de user-facing.
2. Se refuerza el principio 3 de `system-prompt.ts` con una cláusula
   de brevedad explícita ("mensaje corto... no acumules explicaciones
   largas antes de la pregunta").
3. `mobile/src/app/(tabs)/index.tsx`: la tarjeta de vehículo activo
   ahora es un `Pressable` que navega a `/(tabs)/vehicles`.
4. `mobile/src/app/investigation/[id]/chat.tsx`: se elimina la tarjeta
   fija de descripción; en su lugar, el campo de mensaje (`draft`) se
   pre-completa con `investigation.description` una sola vez (si
   todavía no hay ningún mensaje) — nunca de nuevo en refocos/polls
   posteriores, para no pisar lo que el usuario ya edite o borre. Sigue
   siendo editable y sigue exigiendo tocar "Enviar": nada se manda
   solo, mismo principio ya documentado en D-020.
5. `mobile/src/app/investigation/new.tsx`: se agregan chips de
   "problemas comunes" (`mobile/src/constants/common-problems.ts`,
   mismo patrón que `vehicle-brands.ts`) que completan el campo de
   descripción al tocarlos — reemplazan el texto, nunca lo concatenan;
   el campo sigue editable después. Sugerencia, nunca bloqueante.

**Consecuencias:** `backend/src/ai/prompts/{system-prompt,
report-generation-prompt,evidence-analysis-prompt,
build-context-prompt}.ts`; `mobile/src/app/(tabs)/index.tsx`;
`mobile/src/app/investigation/{new,[id]/chat}.tsx`;
`mobile/src/constants/common-problems.ts`. Suite backend (197 tests),
lint y `tsc` de ambos paquetes verificados tras el cambio.

---

## D-023 — Nota de roadmap: mejoras pendientes de Chat, sin implementar

**Fecha:** 2026-07-26
**Estado:** Propuesto — no implementado, prioridad a definir en una
fase de pulido futura (mismo tratamiento que D-013).

**Contexto:** Durante la verificación en vivo de Fase 5 se
identificaron tres mejoras de UX reales pero fuera de alcance de esta
sesión — se documentan para no perder la idea ni el razonamiento,
nunca para construirse ahora.

**Decisión (documentar, no implementar):**

1. **Streaming del texto de la IA** — que la respuesta aparezca
   escribiéndose en vivo, no toda de golpe al terminar. Mejora
   percibida de latencia, especialmente relevante tras D-021 (turnos de
   hasta 30s).
2. **Botones de respuesta rápida generados dinámicamente por la
   propia IA**, según lo que la pregunta del turno permita (por
   ejemplo, si la pregunta es "¿el pedal hace resistencia o no?", la IA
   podría ofrecer esas dos opciones como botones) — distinto de los
   chips fijos de "problemas comunes" de D-022 (punto 5), que son una
   lista estática y solo aplican a la descripción inicial, no a cada
   turno de la conversación.
3. **Indicador cualitativo de progreso** ("Reuniendo información..." →
   "Casi listo para analizar") mientras dura la investigación — nunca
   un contador numérico inventado ("pregunta 3 de 7"), ya que la IA no
   sabe de antemano cuántas preguntas va a necesitar; solo un estado
   cualitativo derivado de señales ya disponibles (cantidad de
   hipótesis, `recommendedState`, etc.).

**Consecuencias:** Ninguna todavía — nota de roadmap únicamente.
Cuando se planifique una fase de pulido, esta entrada es el punto de
partida para las tres.

---

## D-024 — Deuda técnica: `reports.e2e-spec.ts` intermitente bajo carga completa de la suite

**Fecha:** 2026-07-26
**Estado:** No resuelto — no bloqueante, nota de deuda técnica

**Contexto:** Detectado por primera vez durante la Fase 8 del backend
(endurecimiento/pruebas, D-016) como una tarea sugerida que en su
momento se decidió no tomar — nunca llegó a escribirse en esta
bitácora, así que no quedó rastro en el repo. Confirmado de nuevo hoy,
al verificar que `test/messages.e2e-spec.ts`/`test/reports.e2e-spec.ts`
seguían pasando tras el cambio de contrato de `quickReplies` (ver
entrada de Fase 5 — botones de respuesta rápida): `npm run test:e2e`
sobre la suite completa hace fallar `reports.e2e-spec.ts` de forma
intermitente, con **al menos dos síntomas distintos** vistos en
corridas separadas:

1. `StorageService.downloadObject` → `InternalServerErrorException: No
   se pudo descargar el archivo de Storage: Object not found`.
2. `Error: el proveedor de IA no devolvió un informe estructurado`,
   lanzado desde el propio `FakeAiProvider` del spec (`test/
   reports.e2e-spec.ts`).

Que la misma suite falle con dos causas raíz distintas entre corridas
—ninguna relacionada con el código bajo prueba en cada caso— apunta a
un problema de **aislamiento entre tests** (estado compartido y/o
condición de carrera sobre el `JobsWorker`/Postgres local bajo carga
completa), no a una causa única identificable todavía. Confirmado que
`evidence.e2e-spec.ts` y `messages.e2e-spec.ts` no muestran el mismo
patrón cuando corren sin un segundo proceso de backend compitiendo por
los mismos jobs — pero `reports.e2e-spec.ts` sigue fallando a veces
incluso corrido en aislamiento total, así que la causa no se reduce
solo a eso.

**Decisión:** No se investiga a fondo ahora — queda documentado acá
para no perder la señal por segunda vez. Se retoma cuando corresponda
priorizar deuda técnica de testing.

**Consecuencias:** Ninguna todavía. Referencia para cuando se
investigue: correr `reports.e2e-spec.ts` en aislamiento (`npx jest
--config ./test/jest-e2e.json reports.e2e-spec.ts`) reproduce el
problema igual, así que no depende únicamente de otros archivos e2e
corriendo en paralelo.

---

## D-025 — Frontend Fase 7 (Informe): pantalla de informe, "Analizar ahora", y corrección de proceso aplicada sin pausar

**Fecha:** 2026-07-26
**Estado:** Resuelto — vigente para el MVP

**Contexto:** Última pantalla del flujo principal (plan aprobado en
modo plan, tras leer §12.3, §13.7, D-012/D-015 y las Figuras 14/15/16):
la pantalla Informe (reemplaza el placeholder) y el botón "Analizar
ahora" en Chat, que Fase 5 había dejado explícitamente afuera (D-020,
hallazgo 7) porque la pantalla de destino no existía todavía.

**Decisión:**

1. `mobile/src/api/reports.ts`/`jobs.ts` (+ sus hooks): tipos 1:1
   contra `report-json.schema.ts` y `JobsController`. Sin
   `listAll`/`getVersion` — el mapa de pantallas solo pide la versión
   vigente.
2. Dos discrepancias mockup-vs-contrato resueltas a favor del contrato
   real (mismo criterio que D-014): la Figura 14 ("Procesando
   investigación", 5 checks) no se implementa — el job solo expone
   `PENDING/RUNNING/DONE/FAILED`, y fabricar esos 5 pasos sería
   precisión falsa (mismo principio que D-023); se reutiliza en cambio
   el estado inline + polling que ya existía para evidencia. La Figura
   16 ("Detalle del informe") no es una pantalla nueva — es un acordeón
   dentro de la misma pantalla de Informe, y "Qué revisar primero"/
   costo/limitaciones se muestran una sola vez a nivel de informe (el
   schema real los define ahí, no por hipótesis, a diferencia de lo que
   sugiere esa Figura).
3. `chat.tsx`: "Analizar ahora" visible en `READY_TO_ANALYZE`, con
   polling (mismo patrón que `pollEvidenceUntilDone`) hasta `DONE`
   (navega a Informe) o `FAILED` (resetea el estado local de inmediato,
   sin esperar un reload, para que el botón reaparezca en la misma
   pantalla). "Ver informe" visible en `REPORT_GENERATED`.
4. **Corrección de proceso aplicada durante la implementación, sin
   pausar a confirmarla primero — mismo tratamiento que D-004, punto
   5:** el plan aprobado decía que "Analizar ahora" iba a **reemplazar**
   el composer mientras `currentStatus === 'READY_TO_ANALYZE'` (mismo
   tratamiento visual que `blockedReason`). Al escribir el código se
   detectó que eso contradecía D-012: ese estado se diseñó
   explícitamente para seguir permitiendo mensajes
   (`MESSAGE_ALLOWED_STATUSES` incluye `READY_TO_ANALYZE`, transicionando
   de vuelta a `ACTIVE`) — reemplazar el composer le habría quitado al
   usuario una capacidad que el backend ya sostiene. La corrección
   (mostrar el botón junto al composer, sin reemplazarlo) es correcta y
   el usuario la confirmó después del hecho, pero — igual que en D-004 —
   se aplicó unilateralmente durante la implementación en vez de
   pausar a confirmarla antes de escribir el código, pese a que ya
   existía el precedente explícito de proceso de esa misma decisión.
   Repetir el mismo tipo de desvío después de haber quedado documentado
   una vez confirma que necesita más disciplina, no solo la anotación:
   cambios de comportamiento distintos al plan aprobado se confirman
   con el usuario *antes* de aplicarse, incluso cuando la corrección
   parezca obviamente correcta.
5. **Bug real encontrado en vivo y corregido — ventana de polling
   propia para el informe:** `pollReportJob` en `chat.tsx` reutilizaba
   inicialmente `POLL_INTERVAL_MS`/`MAX_POLL_ATTEMPTS`
   (3000ms × 10 = 30s), la misma ventana que `pollEvidenceUntilDone`
   usa para el análisis de evidencia (Claude Vision, mucho más rápido).
   `generateReport()` corre con `AI_REPORT_TIMEOUT_MS` = 60s en el
   backend — 30s no alcanzaba: el cliente se rendía ("está tardando más
   de lo esperado") mientras el job seguía corriendo de verdad, el
   botón "Analizar ahora" reaparecía de forma engañosa (nada localmente
   reflejaba que la investigación seguía `ANALYZING`), y los reintentos
   del usuario chocaban con `409` del backend. Corregido con una
   constante propia, nunca reutilizando la de evidencia:
   `REPORT_POLL_INTERVAL_MS`/`REPORT_MAX_POLL_ATTEMPTS`
   (3000ms × 30 = 90s) — margen real de +50% sobre los 60s nominales,
   no solo empatarlos, cubriendo además la latency de encolado del
   `JobsWorker` (`POLL_INTERVAL_MS` = 2s ahí).
6. **Español chileno/neutro también en el texto fijo del frontend, no
   solo en el prompt de la IA (D-022 solo cubrió el segundo):** 10
   pantallas de las Fases 2-5 (`(auth)/{forgot-password,login,
   register}.tsx`, `(tabs)/{index,history,vehicles/index,
   vehicles/add,vehicles/confirm}.tsx`, `investigation/{new,
   [id]/chat}.tsx`) tenían voseo rioplatense en botones, mensajes de
   error y textos de ayuda — escritas antes de que D-022 definiera el
   dialecto, y ese solo aplicó al prompt de la IA. Corregidas las 10 a
   tuteo neutro. Los mensajes que se repetían literalmente entre
   archivos (el de sin conexión, duplicado en 6; validaciones de marca/
   modelo/año, duplicadas entre `vehicles/add.tsx` y `vehicles/
   confirm.tsx`; etc.) se extrajeron a `mobile/src/constants/
   messages.ts` — un solo lugar para corregir si el dialecto necesita
   otro ajuste. Convención documentada en `mobile/AGENTS.md` para que
   las próximas fases no repitan esto, incluyendo el detalle no obvio de
   los imperativos con pronombre enclítico sin tilde ("confirmala" se
   lee como voseo — la forma neutra correcta es "confírmala", con
   tilde, para conservar el acento original de "confirma").

   (El bug de `applyHypothesisUpdate` encontrado en esta misma ronda de
   verificación en vivo queda documentado aparte, por su propio peso —
   ver D-026.)

**Consecuencias:** Ver `mobile/src/api/{reports,jobs}.ts`,
`mobile/src/hooks/{use-reports-api,use-jobs-api}.ts`,
`mobile/src/app/investigation/[id]/report.tsx`,
`mobile/src/app/investigation/[id]/chat.tsx`,
`mobile/src/constants/messages.ts`, `mobile/AGENTS.md`, y las 10
pantallas listadas en el punto 6. `tsc`/`eslint` verificados (sin suite
de tests automatizada en `mobile/`).

---

## D-026 — Bug real: `applyHypothesisUpdate` crasheaba el turno con `hypothesisId` inexistente; hallazgo de prioridad elevada sobre IDs de hipótesis en el prompt conversacional

**Fecha:** 2026-07-27
**Estado:** Resuelto (el fix); hallazgo de prompt — prioridad elevada, sin implementar

**Contexto:** Al diagnosticar por qué "Analizar ahora" mostraba "No
pudimos enviar el mensaje" (D-025 lo daba por relacionado), los logs
del backend mostraron que ese texto no tenía nada que ver con el
análisis — era un `POST .../messages` real fallando con `500`:

```
PrismaClientKnownRequestError: Invalid `tx.hypothesis.findFirstOrThrow()`
invocation — An operation failed because it depends on one or more
records that were required but not found.
```

`AiHypothesisUpdate.hypothesisId` (`ai-provider.interface.ts:71`) y
`AiHypothesisUpdateDto.hypothesisId` (DTO) son ambos opcionales —
"ausente = hipótesis nueva" por diseño. Un `hypothesisId` presente pero
que no corresponde a ningún registro real no es ese caso normal — es
una anomalía, y `findFirstOrThrow` la convertía en un 500 que tumbaba
la transacción completa del turno (mensaje del usuario incluido).

**Hallazgo de prioridad elevada, no una nota de pasada:**
`backend/src/ai/prompts/build-context-prompt.ts` arma el contexto de
cada turno conversacional **sin incluir el `id` real de ninguna
hipótesis** — solo muestra estado/confianza/texto/razonamiento. Es
decir, en el flujo conversacional la IA **nunca ve un `id` real**, así
que no tiene forma legítima de producir uno válido: cualquier
`hypothesisId` que devuelva ahí es, por diseño actual del prompt,
no-verificable. Esto significa que la IA **nunca puede actualizar una
hipótesis existente de forma confiable en este flujo — solo puede
fingir que lo hace**. El bug de hoy es la primera manifestación visible
de ese gap (mismo tratamiento que D-021 le dio a la nota de resumen de
contexto: evidencia real de que el problema no es hipotético, sube de
prioridad para una fase de pulido). Sigue sin implementarse ahora — es
un cambio de prompt/schema más grande (¿exponer los IDs reales al
modelo?), fuera del alcance de este fix puntual.

**Decisión (el fix en sí):**

1. `applyHypothesisUpdate` cambia `tx.hypothesis.findFirstOrThrow(...)`
   por `tx.hypothesis.findFirst(...)` (nunca tira, devuelve `null`).
2. Si no encuentra el registro: se **ignora esa actualización puntual**
   (nunca se crea una hipótesis nueva para tapar la referencia rota —
   RSIA-001, no inventar interpretaciones de datos que nadie pidió) y se
   deja un `Logger.warn` con detalle forense completo (investigationId,
   mensaje disparador, el `hypothesisId` recibido, el update completo).
   El resto del turno (mensaje del usuario, mensaje de la IA, otras
   actualizaciones de hipótesis en el mismo array, transición de estado)
   sigue exactamente igual que antes.
3. Se agrega `Logger` a `MessagesService` (mismo patrón que
   `JobsWorker`).

**Consecuencias:** Ver `backend/src/messages/messages.service.ts`
(`applyHypothesisUpdate`, ahora retorna `Hypothesis | null`) y
`backend/src/messages/messages.service.spec.ts` (test nuevo para el
caso `hypothesisId` inexistente; los tests existentes migrados de
`findFirstOrThrow` a `findFirst`). Suite completa (201 tests), lint y
`tsc` verificados.

---

## D-027 — Primer despliegue real: backend en Render (plan Starter)

**Fecha:** 2026-07-27
**Estado:** Resuelto — desplegado y verificado

**Contexto:** D-016 (Fase 8) dejó el backend *preparado* para desplegar
(`backend/DEPLOYMENT.md`) pero explícitamente *sin* desplegar, como
paso de infraestructura aparte — ver también D-007 (beta privada antes
del lanzamiento público). Este es ese paso.

**Decisión:**

1. **Backend en Render, plan Starter (US$7/mes), no Free.** El plan
   Free no ofrece Pre-Deploy Command, y las migraciones de Prisma
   (`prisma migrate deploy`) necesitan correr como paso previo a que el
   servicio quede activo — sin eso, cada deploy arrancaría contra un
   esquema desactualizado o directamente roto. Starter es el plan más
   barato de Render que sí lo ofrece.
2. **Postgres con `pgvector` habilitado, misma plataforma (Render).**
   Se ejecutó `CREATE EXTENSION vector;` a mano contra la External
   Database URL (una sola vez, credencial nunca escrita a disco —
   variable de entorno inline, borrada al terminar).
3. **Verificado con el healthcheck real** — `GET /api/v1/health/ready`
   responde con los tres componentes (`database`, `pgvector`,
   `jobsWorker`) en `up`, confirmando que las migraciones corrieron, la
   extensión está activa, y el worker in-process de `jobs` (§9.12)
   arrancó correctamente en el entorno real de Render, no solo en
   Docker local.
4. **URL pública:** `https://carrum-backend.onrender.com`.

**Consecuencias:** `mobile/.env` (`EXPO_PUBLIC_API_URL`) apunta ahora a
la URL pública de Render en vez de la IP LAN local — el teléfono ya no
necesita estar en la misma red que la compu para probar contra un
backend real. Pendiente, fuera del alcance de esta decisión: no se
desplegó todavía ningún frontend/build de la app móvil (D-007 sigue
aplicando — beta privada primero), y `DATABASE_URL` en `backend/.env`
local sigue apuntando a Postgres de Docker, sin cambios — el entorno de
desarrollo local no se movió a la base de Render.

---

## D-028 — Búsqueda web real en `generateReport()` para costo/tiempo de reparación

**Fecha:** 2026-07-28
**Estado:** Resuelto — implementado, testeado y verificado

**Contexto:** `costEstimate` y `estimatedRepairTime` en el informe
final casi siempre salían `available: false`, porque el modelo no
tenía forma de saber precios/tiempos reales y actuales para Chile —
solo su conocimiento de entrenamiento, que el prompt (principio 8, ver
D-013) ya le prohibía usar para inventar un rango. Se agregó el tool
de búsqueda web nativo de Anthropic (`web_search_20260209`), **solo en
`generateReport()`**, nunca en el chat conversacional
(`generateResponse()`), para no sumar costo de búsqueda a cada mensaje
— esa función corre una vez por investigación, de forma asíncrona vía
`jobs`.

**Decisión:**

1. **Dos llamadas separadas a Claude, no una.** `generateReport()`
   fuerza `tool_choice: {type: 'tool', name: 'submit_report'}` —
   Claude no puede llamar `web_search` antes porque ese tool_choice
   exige que la primera respuesta sea exactamente ese tool. Meter
   `web_search` en la misma llamada habría obligado a cambiar ese
   tool_choice a `auto` para **todo** el informe, aumentando el riesgo
   sobre el generador completo (los otros ~8 campos, no solo
   costo/tiempo). En vez de eso: una llamada previa y aislada
   (`gatherWebCostContext()`), solo con `web_search`
   (`tool_choice: auto`), que busca costo/tiempo específicos para Chile
   usando el vehículo + hipótesis ya generadas en la conversación. Su
   resultado se inyecta como una sección más de contexto en el prompt
   de `generateReport()`, que queda exactamente igual que antes en su
   mecanismo central — cero cambios al generador del resto del informe.
   Alternativa descartada: una sola llamada con `tool_choice: auto`
   para todo el informe — más eficiente, pero aumentaba la superficie
   de riesgo sobre el mecanismo de salida estructurada completo.
2. **Los dos requisitos no negociables se garantizan en código, no
   solo en el prompt** (`enforceWebSearchGrounding()` en
   `claude-ai-provider.ts`, corre después de validar
   `AiReportContentDto`):
   - Si `gatherWebCostContext()` no produjo contexto útil (falló, se
     saltó por falta de hipótesis, o la búsqueda fue un hallazgo
     negativo puro — detectado por ausencia de dígitos en el texto,
     ya que costo/tiempo real siempre trae números), se **fuerza**
     `available: false` en ambos campos sin importar qué haya
     devuelto el modelo, con un `warn` si el modelo dijo `true` de
     todas formas.
   - Si terminó `available: true`, se **garantiza** (no se confía en
     que el modelo lo redacte bien) un disclaimer fijo explicitando
     que es un estimado de búsquedas web — no un dato verificado — y
     sugiriendo confirmar con un taller, concatenado después de lo que
     haya escrito el modelo.
   - Mismo criterio que `validateSync` en el resto del archivo: nunca
     confiar ciegamente en que la IA respetó una regla del prompt
     cuando el código puede verificarlo y corregirlo.
3. **Prompt** (`report-generation-prompt.ts` v3, principio 8
   reescrito): `available: true` solo se permite si la sección
   "Búsqueda web de costo/tiempo de reparación (Chile)" inyectada en
   el contexto respalda el rango con algo específico para Chile —
   nunca el conocimiento de entrenamiento del modelo ni cifras de otro
   país. Nuevo archivo `web-cost-search-prompt.ts` (v1) para el system
   prompt de la llamada de búsqueda, separado por ser una tarea
   distinta con su propio versionado — mismo criterio ya establecido
   para `system-prompt.ts`/`report-generation-prompt.ts`/etc.
4. **`AI_REPORT_SEARCH_TIMEOUT_MS`**, timeout propio de la llamada de
   búsqueda, separado de `AI_REPORT_TIMEOUT_MS` — mismo criterio de
   "cada llamada su propia constante" que ya aplican
   `AI_CONVERSATION_TIMEOUT_MS`/`AI_REPORT_TIMEOUT_MS`.
   `gatherWebCostContext()` nunca lanza: cualquier falla se loguea
   como `warn` y degrada a `null` — la búsqueda nunca puede tumbar la
   generación del informe. Default inicial 20000ms, subido a
   **35000ms** tras la verificación en vivo (punto 6) — no era un
   valor definitivo, era una primera estimación a corregir con datos
   reales.
5. **Ventana de polling móvil ensanchada proactivamente**, no dejada
   como punto abierto. El peor caso de `generateReport()` es
   `AI_REPORT_SEARCH_TIMEOUT_MS` + `AI_REPORT_TIMEOUT_MS` (60s) — con
   el timeout de búsqueda ya corregido a 35s (punto 6), ≈95s.
   `REPORT_MAX_POLL_ATTEMPTS` en
   `mobile/src/app/investigation/[id]/chat.tsx` sube de 30 a **50**
   (mismos 3000ms de intervalo) → ventana total de 150s, ~58% de
   margen sobre el peor caso real. Decisión explícita del usuario:
   "ya vivimos las consecuencias de dejar el margen ajustado esta
   misma sesión" (ver D-025 punto 5) — mejor prevenir ahora que
   volver a diagnosticarlo la próxima vez que se pruebe en el celular.
6. **Verificación en vivo (post-implementación), con datos reales, no
   solo tests con mocks:**
   - Primer intento contra una investigación real pero con contexto
     inflado (36 hipótesis acumuladas de pruebas repetidas): la
     búsqueda web se agotó a los 20s, y el informe principal salió
     truncado por `max_tokens: 4096` (campo `whatToCheckFirst` en
     adelante ausente del `tool_use.input` — la IA no alcanzó a
     terminar el JSON). Se encontró y corrigió un bug real propio en
     `web-cost-search-prompt.ts`: `buildWebCostSearchContext()` no
     deduplicaba hipótesis repetidas (mismo texto, distinta confianza
     por revisión) — ahora se queda con la confianza más alta por
     texto único y se acota a las 5 causas más probables.
   - El usuario pidió explícitamente no tocar `max_tokens: 4096`
     (preexistente, fuera del alcance de esta función) hasta probar
     con un caso liviano. Se creó una investigación nueva real (5
     turnos de conversación genuina, sin fixtures) sobre un chillido
     al frenar, que convergió sola a "Desgaste de pastillas de freno"
     con confianza 0.65 y `READY_TO_ANALYZE`.
   - Con el caso liviano, `max_tokens: 4096` **no volvió a ser
     problema** — el informe salió completo (confirma que era el
     contexto inflado del primer caso, no un problema general) — pero
     la búsqueda web **volvió a agotar el timeout de 20s**, esta vez
     ya deduplicada — confirmando que 20s era corto en general, no
     solo por contexto inflado. Se subió a 35s (punto 4) con este dato
     real como justificación.
   - Con el timeout corregido, el informe se generó completo y
     correcto: la búsqueda corrió de verdad (usó su `max_uses: 3`
     buscando precios de pastillas de freno en Chile), no encontró
     nada específico/confiable, y lo dijo explícitamente — el informe
     final mantuvo `costEstimate.available: false` /
     `estimatedRepairTime.available: false` con el disclaimer
     correspondiente, validando en un caso real end-to-end tanto la
     Capa 1 (prompt) como la ruta de "búsqueda corrió pero no
     encontró nada" sin necesitar la Capa 2 (`null`) para forzarlo.
   - Se observó una sola vez (en el intento con contexto inflado) un
     campo `urgency` corrupto con un fragmento de sintaxis ajena
     (`<parameter name="level">MODERATE`) en vez de un objeto anidado
     — `validateSync` lo rechazó correctamente, el informe no se
     generó con datos corruptos. No volvió a aparecer en el reintento
     con el caso liviano; se documenta como anomalía observada, sin
     acción tomada (no reprodujo, no bloquea, la validación ya lo
     cubre).

**Consecuencias:** Cada informe generado ahora hace hasta dos llamadas
a la API de Claude en vez de una (costo adicional acotado por
`max_uses: 3` en el tool de búsqueda), solo durante la generación del
informe — el chat conversacional no cambia. Tests nuevos en
`claude-ai-provider.spec.ts` cubren: búsqueda exitosa con disclaimer
garantizado, `available: false` forzado sin hipótesis, forzado también
ante un hallazgo negativo puro, degradación correcta ante error de la
búsqueda, y la forma exacta de la llamada de búsqueda (tool +
tool_choice). `user_location` orienta los resultados a Chile sin
restringir por dominio — un allowlist de dominios podría generar falsos
negativos que forzarían "sin resultados" de más. `max_tokens: 4096`
en la llamada principal queda **sin tocar**, confirmado como no
problemático en el caso liviano — si reaparece con un caso normal (no
inflado), se trata como hallazgo aparte, no mezclado con esta función.

---
