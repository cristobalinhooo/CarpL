# CARPLUS | TECHNICAL SPECIFICATION | MVP

**CarPlus — MVP v2.1**
**Technical Specification**

> Especificación consolidada, alineada íntegramente con PRD v3.2. Documento único de referencia — reemplaza a v1.2 y v2.0, no los complementa como apéndice.

| Metadato | Valor |
|---|---|
| Versión | 2.1 |
| Estado | **Architecture Frozen — Approved to start MVP implementation** |
| Producto | CarPlus |
| Documento relacionado | Product Requirements Document (PRD) **v3.2** |
| Autor | Equipo CarPlus / Revisión técnica |
| Fecha | 21 de julio de 2026 |

**Principio rector** — CarPlus investiga problemas mecánicos. No realiza diagnósticos definitivos.

---

## 2. Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.0 | Pendiente | Equipo CarPlus | Primera versión del documento técnico del MVP. |
| 1.1 | Revisión técnica | Cristóbal Alonso Fanti Trujillo | Correcciones de identidad, informes, estados, API, seguridad, observabilidad, entornos y ADR. |
| 1.2 | 20-07-2026 | Equipo CarPlus | Consolidación final sobre PRD v3.0. |
| 2.0 | 21-07-2026 | Equipo CarPlus / Revisión técnica | Realineación completa con PRD v3.1. Se incorporan de forma integrada (no como apéndice): Vehicle Data Provider, registro de vehículo por patente, arquitectura RAG para documentación técnica, contexto técnico automático para la IA. Se actualizan arquitectura, stack, modelo de datos, API, especificación de AI Engine, backlog, handbook de ingeniería y registro de ADR. Se cierra con auditoría formal de consistencia PRD ↔ Technical Spec ↔ Arquitectura (Sección 18). |
| 2.1 | 21-07-2026 | Revisión arquitectónica final (pre-implementación) | Revisión crítica del arquitecto responsable antes de congelar el diseño. Se detectaron y corrigieron 5 brechas imprescindibles: (1) el modelo de Informes no soportaba versionado múltiple pese a exigirlo el PRD (RI-009/RBD-004) — se corrige cardinalidad, restricción única y máquina de estados; (2) no existía registro de auditoría de transiciones de estado del caso, exigido explícitamente por PRD §33/RC-004 — se añade `InvestigationStateLog`; (3) no existía historial de cambios de Hipótesis, exigido por PRD §167 — se añade `HypothesisRevision`; (4) no existía arquitectura de procesamiento asíncrono para análisis de evidencia y generación de informes, exigida por PRD §294 — se añade módulo `jobs` y flujos asíncronos; (5) no existía una estrategia de pruebas explícita ni evaluación de comportamiento del AI Engine, exigida por PRD Fase 21 — se añade Sección 15.4/15.5. Se documenta además una tensión interna del propio PRD entre el Estado 7 (Fase 6) y el requisito RI-009 (Fase 7), resuelta a nivel técnico pero señalada para confirmación de producto (resuelta oficialmente en PRD v3.2 — ver entrada de revisión editorial de esta misma versión, más abajo). El documento queda declarado Architecture Frozen al cierre de la Sección 18. |
| **2.1 (revisión editorial)** | **21-07-2026** | **Revisión técnica** | **Sincronización editorial con PRD v3.2, sin cambios arquitectónicos — el número de versión se mantiene en 2.1 por instrucción explícita, dado que el PRD v3.2 no introdujo ningún cambio de arquitectura, modelo de datos, API, módulos, ADR, estados, flujos o entidades respecto de lo ya congelado.** Se actualizan las referencias de "PRD v3.1" a "PRD v3.2" donde correspondía a la fuente de verdad vigente (preservando, donde correspondía citar un punto específico del capítulo histórico "Actualización Oficial — PRD v3.1", la cita exacta a dicho capítulo). Se reemplaza la nota que señalaba la tensión Fase 6/RI-009 como pendiente de confirmación de producto por una referencia a su resolución oficial en el capítulo "Actualización Oficial — PRD v3.2" del PRD. Se actualiza el Mapa de Pantallas (12.3) y la descripción de la pantalla de informe para reflejar explícitamente las dos acciones oficiales: continuar investigando el mismo problema dentro del mismo caso, e iniciar una investigación nueva para un problema diferente. Se cierra con auditoría final de consistencia PRD v3.2 ↔ Technical Specification v2.1 (Sección 18.4). |

---

## 3. Propósito del Documento

### 3.1 Objetivo

Definir cómo se implementará el MVP de CarPlus y establecer una referencia única para arquitectura, datos, API, aplicación móvil, backend, AI Engine, Vehicle Data Provider, arquitectura RAG, seguridad, operación y convenciones de ingeniería.

### 3.2 Audiencia

Desarrollo frontend y backend, arquitectura, DevOps, QA, UX/UI y colaboradores técnicos.

### 3.3 Relación con el PRD

El PRD **v3.2** es la fuente de requisitos funcionales, objetivos de negocio y alcance, y prevalece sobre este documento ante cualquier conflicto funcional. Esta especificación es la fuente para decisiones de implementación; ante un conflicto técnico prevalece esta especificación, salvo una decisión posterior documentada mediante ADR. Este documento incorpora íntegramente los capítulos "Actualización Oficial — PRD v3.1" y "Actualización Oficial — PRD v3.2" como parte de su arquitectura base, no como una extensión opcional.

---

## 4. Objetivo del MVP

Validar que CarPlus puede guiar a un usuario común durante una investigación mecánica estructurada: identificar el vehículo (manualmente o por patente, cuando exista un proveedor autorizado), recopilar antecedentes y evidencia, enriquecer el contexto técnico automáticamente cuando esté disponible, consultar documentación técnica autorizada durante la investigación, mantener hipótesis alternativas, reducir la incertidumbre y producir un informe técnico útil para apoyar decisiones. El flujo validado abarca desde el registro del vehículo hasta la consulta posterior del informe.

---

## 5. Objetivos del MVP

| Objetivo | Resultado verificable |
|---|---|
| Gestión de vehículos | El usuario registra y administra vehículos propios, manual o por patente. |
| Identificación vehicular enriquecida | Cuando exista un proveedor autorizado, los datos técnicos se completan automáticamente y quedan editables. |
| Investigación guiada | El usuario crea y continúa una investigación conversacional. |
| Contexto técnico automático | La IA inicia la investigación con los datos técnicos ya conocidos del vehículo, sin volver a preguntarlos. |
| Documentación técnica dinámica | La IA puede apoyarse en documentación técnica autorizada recuperada mediante RAG, usada como contexto temporal. |
| Evidencia | La investigación incorpora fotografías, vídeo y audio. |
| Hipótesis | El sistema mantiene hipótesis fundamentadas y su confianza. |
| Incertidumbre | El sistema identifica información faltante y contradicciones. |
| Informe | El sistema persiste un informe estructurado y genera PDF bajo demanda. |
| Historial | El usuario recupera investigaciones e informes anteriores. |

---

## 6. Criterios de Éxito del MVP

El MVP se considera funcional cuando un usuario completa sin asistencia externa el flujo siguiente:

1. Crear una cuenta e iniciar sesión.
2. Registrar un vehículo — mediante patente (si existe proveedor autorizado y compatible) o manualmente — y seleccionarlo.
3. Si la identificación fue automática, revisar/editar los datos técnicos recuperados.
4. Crear una investigación y describir el problema.
5. Responder preguntas del AI Engine, que ya conoce el contexto técnico del vehículo y puede apoyarse en documentación técnica cuando sea relevante.
6. Adjuntar evidencia relevante.
7. Obtener un informe técnico estructurado.
8. Cerrar la investigación y consultar el informe desde el historial.

> **Criterio de cierre** — No deben existir errores críticos que impidan este flujo de extremo a extremo, incluyendo el camino de **fallback manual** cuando la identificación por patente no esté disponible o falle.

---

## 7. Alcance del MVP

| Incluido | Resultado |
|---|---|
| Autenticación | Registro, inicio/cierre de sesión y recuperación de contraseña mediante Supabase Auth. |
| Vehículos | Alta, consulta, actualización, eliminación lógica y selección, con dos vías de registro (manual y por patente). |
| Vehicle Data Provider | Interfaz de abstracción integrada desde el MVP; al menos un adaptador de proveedor real cuando exista uno autorizado para el mercado de lanzamiento, y un adaptador nulo (fallback) para mercados sin cobertura. |
| Contexto técnico automático | El AI Engine recibe los datos técnicos del vehículo (cuando existan) sin que el usuario deba repetirlos. |
| Arquitectura RAG | Pipeline de ingesta y recuperación de documentación técnica autorizada, operativo desde el MVP con un corpus inicial mínimo (puede crecer progresivamente sin bloquear el lanzamiento, según lo permite el PRD v3.2, Actualización v3.1). |
| Investigaciones | Creación, conversación, estado, continuidad y cierre. |
| AI Engine | Contexto, preguntas, hipótesis, evidencia, incertidumbre, contexto técnico e informe. |
| Evidencia | Carga, validación, almacenamiento y consulta de imagen, vídeo y audio. |
| Informes | Persistencia JSON versionada, visualización y PDF bajo demanda. |
| Historial | Consulta de investigaciones e informes propios. |

> La cobertura geográfica del Vehicle Data Provider y el tamaño del corpus RAG **pueden crecer progresivamente después del lanzamiento**, tal como habilita explícitamente el PRD v3.2, Actualización v3.1 ("la implementación podrá realizarse progresivamente, sin impedir la entrega del MVP"). Lo que **no** es progresivo es la existencia de la interfaz de abstracción y el pipeline: ambos deben existir desde el primer despliegue para evitar que `Vehicles` y `AI Module` requieran un refactor estructural más adelante.

## 8. Fuera del Alcance

Créditos, suscripciones, pagos y facturación.

Marketplace, talleres, aseguradoras y comunidad.

Mantenimiento preventivo, recordatorios y gamificación.

OBD, flotas, empresas y funciones B2B.

Panel administrativo avanzado, analítica avanzada y comparación entre investigaciones.

Modo offline y eventos distribuidos complejos.

Microservicios, Kubernetes y orquestación avanzada.

Base de Conocimiento persistente y Grafo de Conocimiento (Fase 10 y 18 del PRD): el MVP diseña el modelo de datos para no bloquear su incorporación futura, pero no los implementa.

Sistema de Aprendizaje activo y confirmación de reparación por el usuario (Fase 3, §12 del PRD).

Incorporación permanente de documentación técnica al modelo de IA: el RAG **nunca** deja de ser contexto temporal recuperado en tiempo de consulta (principio explícito del PRD v3.2, Actualización v3.1, punto 6).

---

## 9. Arquitectura Técnica del MVP

### 9.1 Objetivo de la Arquitectura

Implementar un monolito modular cliente-servidor que mantenga límites de dominio claros y reduzca el coste operativo del MVP, incorporando desde el diseño base la identificación vehicular enriquecida y la consulta de documentación técnica, sin acoplar el dominio a un proveedor específico de datos vehiculares, de IA o de recuperación documental.

### 9.2 Principios Arquitectónicos

| Principio | Decisión |
|---|---|
| Monolito modular | NestJS organiza dominios independientes dentro de un único despliegue. |
| Bajo acoplamiento | La aplicación, la base de datos, el almacenamiento, la IA, el proveedor de datos vehiculares y la recuperación documental se integran mediante interfaces explícitas. |
| Alta cohesión | Cada módulo concentra responsabilidades de un dominio. |
| Backend como fuente de verdad | Estados, autorización, reglas y transiciones solo se deciden en backend. |
| Independencia de proveedor IA | AI Service normaliza los proveedores y evita dependencias en el dominio. |
| Independencia de proveedor de datos vehiculares | Vehicle Data Provider normaliza el acceso externo; el dominio nunca invoca un proveedor concreto directamente. |
| Documentación como contexto, no como memoria | El módulo RAG entrega fragmentos recuperados en tiempo de consulta; ninguno se incorpora de forma permanente al modelo ni al comportamiento del dominio. |
| Simplicidad operativa | No se incorporan microservicios, Kubernetes, buses distribuidos ni un motor de base de datos vectorial adicional en el MVP (ver 9.6). |

### 9.3 Arquitectura General

```
Mobile App (React Native + Expo)
        │ HTTPS / JSON
        ▼
Backend API (NestJS + TypeScript, monolito modular)
   ├── PostgreSQL + Prisma (incluye extensión pgvector para RAG — ver 9.6)
   ├── Supabase Auth
   ├── Supabase Storage
   ├── AI Service ── OpenAI / Claude / Gemini / otros
   ├── Vehicle Data Provider ── proveedor(es) externo(s) de datos vehiculares / adaptador nulo
   └── RAG Service (Document Retrieval) ── corpus de documentación técnica autorizada
```

### 9.4 Componentes del Sistema

| Componente | Responsabilidades | Restricción |
|---|---|---|
| Mobile App | Presentación, navegación, validación básica, carga de evidencia, flujo de registro por patente o manual, y visualización. | Sin acceso directo a la base de datos ni a proveedores IA, de datos vehiculares o RAG. |
| Backend API | Autorización, negocio, estados, persistencia, coordinación IA, coordinación de datos vehiculares, coordinación RAG, informes y auditoría. | Única interfaz pública del cliente. |
| PostgreSQL | Datos de usuarios, vehículos, investigaciones, mensajes, hipótesis, evidencia, informes, metadatos y embeddings de documentación técnica. | No almacena binarios de evidencia ni documentos fuente completos. |
| AI Service | Construcción de prompts, selección de proveedor, normalización de respuestas y ensamblado del contexto técnico y documental. | No define por sí solo estados ni reglas de negocio. |
| Vehicle Data Provider | Resuelve datos técnicos de un vehículo a partir de su patente mediante adaptadores por país/proveedor. | El dominio solo conoce la interfaz `VehicleDataProvider`, nunca un proveedor concreto. |
| RAG Service | Ingiere, indexa y recupera fragmentos de documentación técnica autorizada relevantes al contexto de una investigación. | Nunca sustituye evidencia del caso ni se incorpora de forma permanente al modelo o a la Base de Conocimiento. |
| Supabase Storage | Binarios y acceso seguro a archivos (evidencia y documentos fuente de RAG). | Acceso mediado por Storage Module. |
| Supabase Auth | Identidad, credenciales y lifecycle de sesión. | Users no almacena password_hash. |

### 9.5 Stack Tecnológico

| Área | Tecnología |
|---|---|
| Mobile | React Native + Expo |
| Lenguaje | TypeScript |
| Backend | NestJS sobre Node.js |
| ORM | Prisma |
| Base de datos | PostgreSQL (+ extensión `pgvector` para embeddings de RAG — ver 9.6) |
| Identidad | Supabase Auth |
| Storage | Supabase Storage |
| Contenedores | Docker |
| Repositorio | GitHub |
| CI/CD | GitHub Actions |
| Contrato API | OpenAPI |
| IA | Arquitectura multi-proveedor (`AIProvider`) |
| Datos vehiculares | Arquitectura multi-proveedor (`VehicleDataProvider`) |
| Recuperación documental | RAG sobre `pgvector`, con generación de embeddings mediante proveedor configurable |

### 9.6 Arquitectura Multi-Proveedor de IA

El dominio llama a una interfaz `AIProvider`. Cada adaptador traduce solicitudes y respuestas del proveedor a contratos internos. La selección se resuelve por configuración y capacidad; errores, timeouts y metadatos de modelo se normalizan antes de volver al dominio.

```
AIService → AIProvider
           ├── OpenAIProvider
           ├── ClaudeProvider
           ├── GeminiProvider
           └── FutureProvider
```

### 9.7 Vehicle Data Provider (nuevo — PRD v3.2, Actualización v3.1, punto 3)

El dominio llama a una interfaz `VehicleDataProvider`, análoga en diseño a `AIProvider`. Cada adaptador implementa la búsqueda por patente para un país o proveedor específico y normaliza la respuesta a un contrato interno único (`VehicleTechnicalData`).

```
VehicleService → VehicleDataProvider
                ├── ChileVehicleDataProvider   (o proveedor autorizado del mercado de lanzamiento)
                ├── NullVehicleDataProvider    (fallback: siempre NOT_FOUND — habilita mercados sin cobertura)
                └── FutureCountryProvider
```

**Reglas de diseño:**
- El registro por patente es siempre **opcional** y **nunca bloquea** el registro del vehículo (PRD v3.2, Actualización v3.1, punto 1). Si la búsqueda falla o el proveedor no está disponible para el país del usuario, el flujo cae automáticamente al registro manual sin fricción adicional.
- Todos los campos recuperados automáticamente (`brand`, `model`, `version`, `year`, `engine`, `displacement`, `fuel_type`, `transmission`, `traction`, `vin`) son **editables por el usuario** (PRD v3.2, Actualización v3.1, punto 2).
- Cada búsqueda queda registrada para trazabilidad y control de abuso (ver 10.7 `VehicleLookupLog`), sin persistir el payload crudo del proveedor externo más allá de lo necesario (minimización de datos, NFR/RSEC-007 del PRD).
- *Mejora propuesta:* cachear resultados de búsqueda por patente durante una ventana corta (p. ej. 24 h) para reducir llamadas repetidas al proveedor externo ante reintentos del usuario, sin que la caché se convierta en fuente de verdad (consistente con PRD Fase 20 §293).

### 9.8 Arquitectura RAG — Documentación Técnica (nuevo — PRD v3.2, Actualización v3.1, punto 5)

```
AI Module (durante una investigación)
        │  construye consulta de recuperación a partir del contexto técnico y conversacional
        ▼
RAG Service
   ├── Embedding Provider (configurable, desacoplado del proveedor de IA conversacional)
   ├── Vector Search (pgvector sobre PostgreSQL)
   └── Document Store (metadatos + referencia a Storage para el documento fuente)
        │  devuelve fragmentos con cita de origen
        ▼
AI Service — inserta los fragmentos como bloque "Retrieved documentation" del prompt (ver 14.5)
```

**Reglas de diseño:**
- Solo se ingieren documentos de fuentes autorizadas por el equipo del producto (manuales de servicio, boletines técnicos, documentación de fabricante u otras fuentes explícitamente aprobadas), consistente con PRD Fase 10 §82 ("Conocimiento Técnico").
- Cada fragmento recuperado se entrega al modelo **con su cita de origen**; el AI Engine debe poder explicar qué documento respaldó una afirmación, igual que exige con la evidencia del caso (PRD §120, §233).
- La documentación recuperada es **contexto temporal de una única interacción**; nunca se reentrena, memoriza ni persiste como conocimiento permanente del modelo (PRD v3.2, Actualización v3.1, punto 5 y 6). Esto la distingue explícitamente de la futura Base de Conocimiento (Fase 10), que si constituye conocimiento persistente y validado.
- *Mejora propuesta:* registrar qué fragmentos fueron recuperados en cada interacción (`RAGRetrievalLog`, ver 10.7) exclusivamente con fines de auditoría y explicabilidad, no de aprendizaje — refuerza la trazabilidad exigida transversalmente por el PRD sin violar el principio de "no memorizar documentación".
- **Elección técnica**: se propone `pgvector` sobre la misma instancia de PostgreSQL en lugar de una base de datos vectorial separada, para no introducir un nuevo servicio con estado en el MVP (principio de "simplicidad operativa" del propio Technical Spec). Esta decisión debe formalizarse en un ADR (ver Sección 17) por su impacto en escalabilidad futura del corpus.

### 9.9 Flujo General de Datos

1. La aplicación envía una solicitud autenticada.
2. La API valida DTO, sesión, propiedad y estado permitido.
3. El dominio persiste la operación en PostgreSQL.
4. Si se trata de un registro de vehículo por patente, `VehicleService` invoca `VehicleDataProvider`, normaliza la respuesta y la deja editable para el usuario antes de persistir.
5. Cuando corresponde, `AI Module` construye el contexto —incluyendo el bloque técnico del vehículo y, si es relevante, fragmentos recuperados por `RAG Service`— y llama al proveedor de IA.
6. La respuesta se valida y normaliza.
7. El backend persiste mensajes, hipótesis, evidencia o informe y aplica la transición de estado.
8. La API devuelve el contrato público y la aplicación actualiza la interfaz.

### 9.10 Gestión de Estados *(corregido en v2.1 — brecha imprescindible #1)*

El registro por patente y el enriquecimiento técnico ocurren **antes** de que exista una investigación y no introducen nuevos estados en la máquina de estados de `Investigations`.

| Estado | Significado | Transiciones permitidas |
|---|---|---|
| Draft | Investigación creada, aún no iniciada. | Active |
| Active | Conversación y recopilación en curso. | Waiting Evidence, Analyzing, Closed |
| Waiting Evidence | Bloqueada hasta recibir evidencia solicitada. | Active |
| Analyzing | Evaluación de contexto e hipótesis. | Report Generated |
| **Report Generated** | Informe principal disponible. | **Active (continuar investigando), Closed** |
| Closed | Investigación finalizada. | Ninguna |

El Backend controla todas las transiciones y rechaza las no permitidas con 409 Conflict. La interfaz solo representa el estado recibido.

> **Corrección imprescindible (v2.1):** la versión v2.0 solo permitía `Report Generated → Closed`. Esto es incompatible con PRD §47, **RI-009**: *"Si el usuario continúa investigando posteriormente, deberá generarse una nueva versión del informe, preservando la anterior."* Un caso en `Report Generated` no puede volver a `Active` si la máquina de estados no lo permite, por lo que RI-009 sería técnicamente irrealizable con la v2.0. Se añade la transición `Report Generated → Active`.
>
> **Resolución oficial de producto incorporada (PRD v3.2):** la tensión que existía entre la Fase 6, Estado 7 ("Informe Generado") y el requisito RI-009 (Fase 7) fue corregida formalmente por producto en el PRD v3.2. El capítulo "Actualización Oficial — PRD v3.2" y el Estado 7 corregido establecen que, tras un informe, el usuario puede **continuar investigando el mismo problema dentro del mismo caso** (retorna a Investigando y genera una nueva versión del informe, conforme a RI-009) o **iniciar una investigación nueva para un problema diferente** (crea un caso independiente). Esta transición técnica (`Report Generated → Active`) y el modelo de datos versionado de `Reports` (ver 10.6), diseñados en la v2.1 anticipando esta resolución, quedan confirmados como correctos y no requieren ningún ajuste adicional.
>
> **Concurrencia:** la transición `Analyzing → Report Generated` debe ejecutarse dentro de una transacción que bloquee (`SELECT ... FOR UPDATE` o transacción serializable) la fila de `Investigations` y calcule el siguiente `report_version` de forma atómica, para evitar que dos solicitudes concurrentes de análisis generen dos informes con el mismo número de versión o dejen el caso en un estado inconsistente.

### 9.12 Procesamiento Asíncrono *(nuevo en v2.1 — brecha imprescindible #4)*

PRD §294 (Fase 20) exige explícitamente que las tareas de larga duración —análisis de imágenes/video/audio y generación de informes— se ejecuten de forma asíncrona, con retroalimentación visible al usuario mientras se ejecutan. La v2.0 no especificaba ningún mecanismo para esto, lo que habría llevado a implementarlo como llamadas síncronas bloqueantes dentro del ciclo de vida HTTP, contradiciendo el requisito.

**Decisión (para el MVP, consistente con "simplicidad operativa"):** se incorpora un módulo `jobs` respaldado por una tabla en PostgreSQL (patrón *outbox*/cola ligera), sin introducir Redis, BullMQ ni infraestructura adicional con estado en esta etapa. Un *worker* dentro del mismo proceso NestJS consume la cola por *polling* controlado.

```
Evidence Module ──▶ jobs.enqueue(ANALYZE_EVIDENCE, evidenceId)
Reports Module  ──▶ jobs.enqueue(GENERATE_REPORT, investigationId)
                          │
                          ▼
                    Jobs Worker (in-process)
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        AI Module / rag         Storage / Reports
```

**Reglas de diseño:**
- Solo el módulo `jobs` conoce la tabla de tareas y el mecanismo de ejecución; `Evidence` y `Reports` únicamente encolan y consultan estado, nunca ejecutan el procesamiento directamente.
- Cada job conserva: tipo, estado (`PENDING`/`RUNNING`/`DONE`/`FAILED`), intentos, `correlationId`, `investigationId`/`evidenceId`, y timestamps — reutilizando el mismo `correlationId` de la solicitud original para trazabilidad extremo a extremo (PRD Fase 22).
- El estado del job se refleja en los estados de UI ya definidos (12.5/12.6: `Waiting Evidence`, `Analyzing`) — no se introducen estados de interfaz nuevos, solo se les da un mecanismo backend real.
- *ADR pendiente (ADR-011):* si el volumen de evidencia o la latencia del *polling* lo justifican más adelante, evaluar migrar a una cola dedicada (BullMQ/Redis o equivalente gestionado). La interfaz interna del módulo `jobs` se diseña para que ese cambio no afecte a `Evidence` ni a `Reports`.

### 9.13 Decisiones Operativas

| Área | Decisión |
|---|---|
| Despliegue | Un artefacto backend y una aplicación móvil. |
| Entornos | Local, Development, Staging y Production con configuración independiente. |
| Observabilidad | Logs estructurados, correlation ID, health checks, métricas y seguimiento de errores — incluyendo llamadas a Vehicle Data Provider y RAG Service. |
| ADR | Toda decisión arquitectónica relevante se registra en `/docs/adr`. |
| Escalado | Escalado vertical u horizontal del backend sin dividir dominios durante el MVP. |

---

## 10. Modelo de Datos

### 10.1 Objetivo y Reglas Generales

UUID como clave primaria. Relaciones explícitas mediante claves foráneas. `created_at` y `updated_at` en entidades mutables; `deleted_at` cuando exista eliminación lógica. Timestamps en UTC. Migraciones Prisma versionadas y revisadas. Binarios (evidencia y documentos fuente de RAG) en Storage; PostgreSQL conserva metadatos, referencias y, para RAG, embeddings vectoriales.

### 10.2 Entidades Principales

| Entidad | Propósito |
|---|---|
| Users | Perfil de aplicación vinculado a Supabase Auth. |
| Vehicles | Vehículos propiedad del usuario, con soporte para registro manual o por patente. |
| VehicleLookupLog *(nuevo)* | Traza de cada búsqueda por patente realizada contra un Vehicle Data Provider. |
| Investigations | Caso mecánico y su ciclo de vida. |
| **InvestigationStateLog** *(nuevo — v2.1, brecha imprescindible #2)* | Auditoría inmutable de cada transición de estado del caso. |
| Messages | Conversación cronológica. |
| Evidence | Evidencia lógica asociada al caso. |
| Attachments | Metadatos del archivo físico. |
| Hypotheses | Hipótesis evolutivas y su confianza (estado actual). |
| **HypothesisRevision** *(nuevo — v2.1, brecha imprescindible #3)* | Historial inmutable de cada cambio de una hipótesis (confianza, razonamiento, estado). |
| Reports | Informe estructurado, **ahora con múltiples versiones por investigación** (v2.1, brecha imprescindible #1). |
| **Job** *(nuevo — v2.1, brecha imprescindible #4)* | Cola ligera de tareas asíncronas (análisis de evidencia, generación de informe). |
| TechnicalDocument *(nuevo)* | Metadatos de un documento técnico autorizado ingresado al corpus RAG. |
| DocumentChunk *(nuevo)* | Fragmento indexado (con embedding) de un `TechnicalDocument`. |
| RAGRetrievalLog *(nuevo, mejora propuesta)* | Traza de qué fragmentos fueron recuperados en una interacción de investigación. |

### 10.3 Users

Sin cambios respecto a v1.2.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| supabase_auth_id | UUID/String | Unique; identidad externa |
| email | String | Unique; normalizado |
| full_name | String | Requerido |
| profile_image | String? | URL o path |
| created_at / updated_at | Timestamp | UTC |
| deleted_at | Timestamp? | Eliminación lógica |

No se almacena `password_hash`. Las credenciales pertenecen a Supabase Auth.

### 10.4 Vehicles *(actualizado — incorpora PRD v3.2, Actualización v3.1, puntos 1–2)*

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK Users |
| brand | String | Requerido |
| model | String | Requerido |
| version | String? | **Nuevo.** Versión/trim, recuperable automáticamente |
| year | Integer | Validar rango |
| engine | String? | Opcional |
| displacement | String? | **Nuevo.** Cilindrada, recuperable automáticamente |
| fuel_type | String? | Opcional |
| transmission | String? | Opcional |
| traction | String? | **Nuevo.** Tracción, recuperable automáticamente |
| mileage | Integer? | ≥ 0 |
| vin | String? | Opcional; recuperable automáticamente |
| plate | String? | Opcional; nunca bloquea el registro |
| registration_method | Enum | **Nuevo.** `MANUAL` \| `PLATE_LOOKUP` |
| data_source | String? | **Nuevo.** Nombre del `VehicleDataProvider` que originó los datos, si aplica |
| data_synced_at | Timestamp? | **Nuevo.** Momento de la última recuperación automática |
| created_at / updated_at | Timestamp | UTC |
| deleted_at | Timestamp? | Eliminación lógica |

Todos los campos marcados como "recuperables automáticamente" permanecen **editables** por el usuario en cualquier momento, incluso si `registration_method = PLATE_LOOKUP` (PRD v3.2, Actualización v3.1, punto 2: "Todos los datos serán editables por el usuario").

### 10.5 VehicleLookupLog *(nuevo)*

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK Users |
| vehicle_id | UUID? | FK Vehicles; nulo si la búsqueda no derivó en un vehículo guardado |
| plate_input | String | Valor consultado (normalizado) |
| provider_name | String | Adaptador `VehicleDataProvider` invocado |
| status | Enum | `SUCCESS` \| `NOT_FOUND` \| `PROVIDER_ERROR` |
| created_at | Timestamp | UTC |

No se persiste el payload crudo del proveedor externo; solo el resultado normalizado ya reflejado en `Vehicles`. Esto satisface trazabilidad sin violar minimización de datos.

### 10.6 Investigations, Messages, Evidence, Attachments, Hypotheses, Reports *(corregido en v2.1)*

El contexto usado por `AI Module` para generar `Messages`/`Hypotheses` puede incluir datos de `Vehicles` (incl. campos enriquecidos) y fragmentos de `DocumentChunk` recuperados vía RAG, sin que esto modifique el esquema de estas entidades. **Sí cambia el esquema de `Reports`** respecto a v2.0 (ver justificación en 9.10).

| Entidad | Campos clave |
|---|---|
| Investigations | id, vehicle_id, user_id, title, description, current_status, confidence_score, started_at, finished_at, created_at, updated_at |
| Messages | id, investigation_id, sender (USER\|AI\|SYSTEM), message, created_at |
| Evidence | id, investigation_id, evidence_type (IMAGE\|VIDEO\|AUDIO), description, analysis_json, uploaded_at |
| Attachments | id, evidence_id, storage_path, mime_type, file_size, checksum, uploaded_at |
| Hypotheses | id, investigation_id, hypothesis, confidence, reasoning, status (ACTIVE\|DISCARDED\|PARTIALLY_CONFIRMED), evidence_refs, created_at, updated_at |
| **Reports** | id, investigation_id, **report_version** (secuencial por investigación), report_json, generated_by_model, generated_at, **is_latest** (booleano) |

**Corrección imprescindible (Reports):** en v2.0, `Reports` era 1–0..1 respecto a `Investigations` con restricción `unique(investigation_id)`, lo que **impedía físicamente** guardar una segunda versión de informe — en contradicción directa con PRD §47 RI-009 y §173 RBD-004 ("Los informes nunca deberán sobrescribirse... cada actualización generará una nueva versión"). Se corrige a **1–\* ** (una investigación puede tener múltiples informes versionados). `is_latest` permite resolver rápidamente "cuál es el informe vigente" sin depender de `MAX(report_version)` en cada consulta; se mantiene con un índice único parcial (`WHERE is_latest = true`) para garantizar que solo exista un informe vigente por investigación en todo momento (ver 10.10).

### 10.6b InvestigationStateLog *(nuevo — v2.1, brecha imprescindible #2)*

PRD Fase 6, §33 ("Auditoría") y RC-004/RC-005 exigen que **todo** cambio de estado del caso quede registrado de forma inmutable, con estado anterior, estado nuevo, fecha/hora, evento que lo originó y componente responsable. La v2.0 no modelaba esto — `Investigations.current_status` solo reflejaba el estado actual, sin historial. Se añade:

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| investigation_id | UUID | FK Investigations |
| previous_status | Enum? | Nulo solo para la creación inicial (`Draft`) |
| new_status | Enum | Requerido |
| triggering_event | String | p. ej. `USER_STARTED_INVESTIGATION`, `DECISION_ENGINE_SUFFICIENT_EVIDENCE`, `USER_REQUESTED_ANALYSIS` |
| responsible_component | Enum | `FRONTEND` \| `BACKEND` \| `INVESTIGATION_ENGINE` \| `DECISION_ENGINE` \| `LEARNING_SYSTEM` (PRD §33) |
| created_at | Timestamp | UTC; nunca se actualiza ni se elimina (append-only) |

Cada transición de `Investigations.current_status` se escribe **en la misma transacción** que inserta la fila correspondiente en `InvestigationStateLog` (ver 13.7).

### 10.6c HypothesisRevision *(nuevo — v2.1, brecha imprescindible #3)*

PRD §162 y §167 exigen que el historial de cambios de una hipótesis "deberá conservarse" y que "nunca se sobrescribirá información histórica". La v2.0 mutaba `confidence`, `reasoning` y `status` directamente sobre la fila de `Hypotheses`, perdiendo el estado anterior. Se añade una tabla de revisiones append-only:

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| hypothesis_id | UUID | FK Hypotheses |
| investigation_id | UUID | FK Investigations (desnormalizado para consulta directa) |
| previous_confidence | Decimal? | Nulo en la primera revisión |
| new_confidence | Decimal | Requerido |
| previous_status | Enum? | Nulo en la primera revisión |
| new_status | Enum | Requerido |
| reasoning_snapshot | Text | Justificación vigente al momento de la revisión |
| triggered_by_message_id | UUID? | FK Messages, si la revisión se originó en una interacción conversacional |
| created_at | Timestamp | UTC |

Cada actualización de `Hypotheses` (vía `AI Module` → `Investigation Service`) inserta una fila en `HypothesisRevision` **antes o en la misma transacción** que actualiza la fila vigente de `Hypotheses`. `Hypotheses` conserva el estado *actual* (para consultas rápidas); `HypothesisRevision` conserva el historial completo exigido por el PRD.

### 10.6d Job *(nuevo — v2.1, brecha imprescindible #4 — soporta 9.12)*

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| job_type | Enum | `ANALYZE_EVIDENCE` \| `GENERATE_REPORT` |
| status | Enum | `PENDING` \| `RUNNING` \| `DONE` \| `FAILED` |
| reference_id | UUID | `evidence_id` o `investigation_id` según `job_type` |
| attempts | Integer | Control de reintentos |
| correlation_id | UUID | Mismo `correlationId` de la solicitud que originó el job |
| last_error | Text? | Solo mensaje sanitizado, nunca stack trace ni payload de proveedor |
| created_at / updated_at | Timestamp | UTC |

### 10.7 TechnicalDocument, DocumentChunk, RAGRetrievalLog *(nuevos — soportan 9.8)*

**TechnicalDocument**

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| title | String | Requerido |
| source_type | Enum | `MANUAL` \| `BULLETIN` \| `MANUFACTURER_DOC` \| `OTHER_AUTHORIZED` |
| authorized_by | String | Responsable que aprobó la incorporación (gobierno documental) |
| version | String | Versión del documento fuente |
| status | Enum | `ACTIVE` \| `DEPRECATED` |
| vehicle_scope | JSON? | Alcance opcional (marca/modelo/rango de años aplicable) |
| storage_path | String | Referencia al documento fuente en Storage |
| ingested_at | Timestamp | UTC |

**DocumentChunk**

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK TechnicalDocument |
| chunk_index | Integer | Orden dentro del documento |
| content_text | Text | Fragmento indexado |
| embedding | vector | `pgvector`; dimensión según proveedor de embeddings configurado |
| token_count | Integer | Para control de tamaño de contexto |

**RAGRetrievalLog** *(mejora propuesta — trazabilidad de auditoría, no de aprendizaje)*

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID | PK |
| investigation_id | UUID | FK Investigations |
| message_id | UUID? | FK Messages, si aplica |
| chunk_ids | JSON | IDs de `DocumentChunk` recuperados |
| query_text | Text | Consulta de recuperación utilizada |
| retrieved_at | Timestamp | UTC |

### 10.8 Relaciones *(corregido en v2.1)*

```
Users 1 ── * Vehicles 1 ── * Investigations
Vehicles 1 ── * VehicleLookupLog
Users 1 ── * Investigations
Investigations 1 ── * InvestigationStateLog
Investigations 1 ── * Messages
Investigations 1 ── * Evidence 1 ── * Attachments
Investigations 1 ── * Hypotheses 1 ── * HypothesisRevision
Investigations 1 ── * Reports              ← corregido: era 0..1, ahora versionado
Investigations 1 ── * RAGRetrievalLog
Evidence / Investigations 1 ── * Job        (vía reference_id + job_type)
TechnicalDocument 1 ── * DocumentChunk
```

### 10.9 Integridad y Borrado

Todas las consultas de dominio filtran por `user_id` o propiedad derivada. No existe investigación sin usuario y vehículo válidos. No existe mensaje, evidencia, hipótesis o informe sin investigación. Eliminar un vehículo con investigaciones asociadas no elimina el historial: se aplica eliminación lógica o se bloquea la operación según el contrato API. Al cerrar una investigación se bloquean nuevos mensajes y evidencia. La eliminación física de un `attachment` exige eliminar primero el objeto en Storage y registrar auditoría. Los documentos técnicos deprecados (`TechnicalDocument.status = DEPRECATED`) nunca se eliminan físicamente ni se excluyen de recuperación retroactiva en `RAGRetrievalLog` para preservar trazabilidad histórica. **`InvestigationStateLog` y `HypothesisRevision` son estrictamente append-only: ninguna operación de dominio puede actualizar ni eliminar sus filas.**

### 10.10 Índices Mínimos

| Tabla | Índice |
|---|---|
| Users | unique(supabase_auth_id), unique(email) |
| Vehicles | (user_id, deleted_at), (plate) |
| VehicleLookupLog | (user_id, created_at) |
| Investigations | (user_id, created_at), (vehicle_id, created_at), current_status |
| Messages | (investigation_id, created_at) |
| Evidence | (investigation_id, uploaded_at) |
| Hypotheses | (investigation_id, status) |
| **Reports** | **unique(investigation_id, report_version)**; **índice único parcial `unique(investigation_id) WHERE is_latest = true`** — corregido en v2.1, ya no `unique(investigation_id)` a secas |
| **InvestigationStateLog** *(nuevo)* | (investigation_id, created_at) |
| **HypothesisRevision** *(nuevo)* | (hypothesis_id, created_at), (investigation_id, created_at) |
| **Job** *(nuevo)* | (status, job_type), (correlation_id) |
| DocumentChunk | índice vectorial (`ivfflat`/`hnsw` según soporte de pgvector) sobre `embedding` |
| TechnicalDocument | (status), (source_type) |

---

## 11. API Specification

### 11.1 Convenciones

REST sobre HTTPS y JSON. Prefijo `/api/v1`. OpenAPI como contrato versionado. Autenticación Bearer para rutas privadas. Recursos subordinados se anidan bajo `investigations`. Idempotencia exigida para operaciones de generación o reintentos que puedan duplicar efectos.

### 11.2 Autenticación y Sesión

Sin cambios respecto a v1.2: Supabase Auth como proveedor de identidad; el backend valida el access token y aplica autorización por propiedad.

### 11.3 Endpoints

| Módulo | Método y ruta | Resultado |
|---|---|---|
| Auth | POST /api/v1/auth/register | Crear identidad y perfil. |
| Auth | POST /api/v1/auth/login | Iniciar sesión. |
| Auth | POST /api/v1/auth/logout | Cerrar sesión. |
| Auth | POST /api/v1/auth/forgot-password | Iniciar recuperación. |
| Users | GET /api/v1/users/me | Obtener perfil. |
| Users | PATCH /api/v1/users/me | Actualizar perfil. |
| Users | DELETE /api/v1/users/me | Eliminar cuenta lógicamente. |
| Vehicles | **POST /api/v1/vehicles/lookup-by-plate** | **Nuevo.** Consulta `VehicleDataProvider`; devuelve datos técnicos normalizados y editables, sin persistir aún. |
| Vehicles | POST /api/v1/vehicles | Crear vehículo (manual, o confirmando datos de un lookup previo). |
| Vehicles | GET /api/v1/vehicles | Listar vehículos propios. |
| Vehicles | GET /api/v1/vehicles/{id} | Obtener vehículo propio. |
| Vehicles | PATCH /api/v1/vehicles/{id} | Actualizar vehículo propio (incl. campos recuperados automáticamente). |
| Vehicles | DELETE /api/v1/vehicles/{id} | Eliminar lógicamente o rechazar si aplica. |
| Investigations | POST /api/v1/investigations | Crear investigación. |
| Investigations | GET /api/v1/investigations | Listar investigaciones propias. |
| Investigations | GET /api/v1/investigations/{id} | Obtener detalle. |
| Investigations | PATCH /api/v1/investigations/{id} | Actualizar campos permitidos/estado. |
| Investigations | POST /api/v1/investigations/{id}/close | Cerrar investigación. |
| Messages | POST /api/v1/investigations/{id}/messages | Registrar mensaje y obtener interacción IA (con contexto técnico y RAG cuando aplique). |
| Messages | GET /api/v1/investigations/{id}/messages | Obtener conversación. |
| Evidence | POST /api/v1/investigations/{id}/evidence | Cargar metadatos/archivo validado y **encolar job `ANALYZE_EVIDENCE`** (202 Accepted). |
| Evidence | GET /api/v1/investigations/{id}/evidence | Listar evidencia (incl. estado de procesamiento vía `Job`). |
| Evidence | DELETE /api/v1/investigations/{id}/evidence/{evidenceId} | Eliminar evidencia permitida. |
| Reports | POST /api/v1/investigations/{id}/report | **Encolar job `GENERATE_REPORT`** (202 Accepted); no genera de forma síncrona. |
| **Reports** | **GET /api/v1/investigations/{id}/report** | **Actualizado.** Obtener el informe **vigente** (`is_latest = true`). |
| **Reports** | **GET /api/v1/investigations/{id}/reports** | **Nuevo.** Listar todas las versiones del informe (historial completo, nunca sobrescrito). |
| **Reports** | **GET /api/v1/investigations/{id}/reports/{version}** | **Nuevo.** Obtener una versión específica del informe. |
| Reports | GET /api/v1/investigations/{id}/report.pdf | Generar/descargar PDF bajo demanda a partir del informe vigente. |
| **Jobs** *(interno/polling)* | **GET /api/v1/jobs/{jobId}** | **Nuevo.** Consultar estado de un job asíncrono (`PENDING`/`RUNNING`/`DONE`/`FAILED`) para que el cliente refleje progreso real, no simulado. |
| RAG *(interno)* | — | El módulo RAG no se expone directamente al cliente en el MVP; opera exclusivamente como colaborador interno de `AI Module`. La ingesta de documentos técnicos es un proceso operado por el equipo del producto (herramienta interna/administrativa), no un endpoint público de esta versión. |

### 11.4–11.6 Formatos, Códigos HTTP, Listados

Sin cambios respecto a v1.2. Se añade el código de error `VEHICLE_PROVIDER_UNAVAILABLE` (mapeado a 502/503) para distinguir explícitamente una falla del proveedor externo de una patente simplemente no encontrada (`NOT_FOUND`, mapeado a 200 con `status: NOT_FOUND` en el cuerpo, no un 404, ya que la ausencia de datos vehiculares no es un error del recurso `vehicles/lookup-by-plate` en sí).

### 11.7 Seguridad de API

Sin cambios respecto a v1.2, con una adición: las llamadas a `POST /vehicles/lookup-by-plate` quedan sujetas a *rate limiting* específico por usuario, dado que invocan un servicio externo potencialmente costoso o con límites propios de uso.

### 11.8 Objetivos de Rendimiento

| Operación | Objetivo inicial | Medición |
|---|---|---|
| Login y endpoints sin IA | p95 ≤ 500 ms, excluyendo red externa | APM por ruta |
| Consultas paginadas | p95 ≤ 700 ms | APM + DB |
| Búsqueda por patente (Vehicle Data Provider) | Objetivo ≤ 5 s; timeout configurable | Proveedor y extremo a extremo |
| Recuperación RAG (por interacción) | Objetivo ≤ 1.5 s adicionales sobre la latencia de IA | AI Module + pgvector |
| Primera respuesta IA | Objetivo ≤ 15 s; timeout configurable | Proveedor y extremo a extremo |
| Carga de archivos | Progreso visible; timeout según tamaño | Cliente + Storage |
| Generación PDF | Objetivo ≤ 10 s para informe MVP | Backend |

Estos valores son objetivos operativos iniciales y deben validarse en Staging antes de la beta.

---

## 12. Frontend Specification

### 12.1 Objetivo

Aplicación React Native + Expo que guía el flujo principal, representa estados del backend y mantiene una experiencia comprensible para usuarios sin conocimientos mecánicos. La lógica crítica permanece en el backend.

### 12.2 Navegación

Sin cambios: stacks para autenticación e investigación; tabs persistentes para Inicio, Vehículos, Historial y Perfil.

### 12.3 Mapa de Pantallas *(actualizado)*

| Pantalla | Responsabilidad | Estados/Reglas especiales |
|---|---|---|
| Splash | Inicializar configuración y resolver sesión. | Autenticado → Home; no autenticado → Login. |
| Login / Registro / Recuperación | Sin cambios. | Sin cambios. |
| Home | Vehículo activo, CTA de investigación y recientes. | Empty state sin vehículo o sin investigaciones. |
| **Agregar vehículo** | **Actualizado.** Ofrece dos caminos igualmente accesibles: ingreso por patente o ingreso manual. | Si la búsqueda por patente falla o no hay proveedor disponible para el país, cae automáticamente a manual sin bloquear el flujo. |
| **Confirmar datos del vehículo** | **Nueva.** Se muestra solo tras una búsqueda por patente exitosa; presenta los campos recuperados, todos editables, antes de guardar. | El usuario puede corregir cualquier campo antes de confirmar. |
| Nueva investigación | Seleccionar vehículo, título y descripción. | No iniciar sin vehículo ni descripción válida. |
| Chat de investigación | Conversación, progreso, estado y adjuntos. La IA ya conoce el contexto técnico del vehículo desde el primer mensaje. | Persistencia automática; bloquear input según estado. |
| Evidencia | Capturar/subir y listar archivos. | Progreso, reintento, validación y borrado permitido. |
| **Informe final** | **Actualizado (revisión editorial — PRD v3.2).** Renderiza la versión vigente de `report_json`. Puede referenciar fragmentos de documentación técnica citados por la IA. Ofrece dos acciones distintas y explícitas: (a) **continuar investigando el mismo problema dentro del mismo caso** — vuelve a Chat de investigación sobre el mismo `investigationId`, y generará una nueva versión del informe si se vuelve a analizar (ver Estado 7, Fase 6, y RI-009); y (b) **iniciar una investigación nueva para un problema diferente** — crea un caso independiente desde Home/Nueva investigación. | Resumen, evidencia, hipótesis, faltantes, confianza y recomendaciones. |
| Historial | Listar y filtrar investigaciones. | Paginación; estados y etiquetas de confianza. |
| Perfil | Actualizar datos y cerrar sesión. | Sin pagos ni suscripciones. |

### 12.4 Flujo Principal *(actualizado — revisión editorial, PRD v3.2)*

```
Splash → Login/Registro → Home → Agregar/seleccionar vehículo (patente o manual)
      → [Confirmar datos recuperados, si aplica] → Nueva investigación
      → Chat (con contexto técnico ya cargado) ↔ Evidencia
      → Analyzing → Informe ⇄ Chat (continuar el mismo problema, mismo caso)
      → Informe → Closed → Historial

Desde Informe, el usuario puede además elegir "Iniciar una investigación nueva para
un problema diferente", lo que regresa a Home/Nueva investigación y crea un caso
independiente, sin heredar el contexto del caso anterior.
```

### 12.5–12.8 Estados de interfaz, estado de investigación, gestión de datos, accesibilidad

Sin cambios respecto a v1.2.

---

## 13. Backend Specification

### 13.1 Arquitectura y Estructura *(actualizada)*

NestJS se organiza como monolito modular. Los controladores traducen HTTP a casos de uso; los servicios de aplicación coordinan dominio e infraestructura; Prisma, Storage, proveedores IA, proveedor de datos vehiculares y RAG se encapsulan en adaptadores.

```
src/
├── auth/                  ├── users/
├── vehicles/               ├── investigations/
├── messages/               ├── evidence/
├── reports/                ├── ai/
├── vehicle-data-provider/  ├── rag/
├── jobs/                   ├── storage/
├── database/               ├── common/
├── config/
└── main.ts
```

### 13.2 Responsabilidades por Módulo *(actualizada)*

| Módulo | Responsabilidad técnica |
|---|---|
| Auth | Validar identidad, mapear sesión y proteger rutas. |
| Users | Perfil local y eliminación lógica. |
| Vehicles | Propiedad, validación y persistencia del vehículo; orquesta `vehicle-data-provider` cuando el registro es por patente. |
| **vehicle-data-provider** *(nuevo)* | Único módulo que conoce los adaptadores externos de datos vehiculares; expone `VehicleDataProvider` al dominio. |
| Investigations | Ciclo de vida, contexto, máquina de estados y **escritura de `InvestigationStateLog` en cada transición**. |
| Messages | Persistencia cronológica e interacción conversacional. |
| Evidence | Validación, metadatos, asociación; **encola jobs de análisis en `jobs`, no ejecuta el análisis directamente**. |
| Storage | Subida, URLs firmadas, integridad y borrado físico (evidencia y documentos fuente de RAG). |
| Reports | Consolidación, **versionado append-only** (nunca sobrescribe una versión existente), persistencia JSON y PDF bajo demanda; **encola generación en `jobs`**. |
| AI | Prompts, adaptadores, timeouts, normalización, metadatos, y ensamblado de contexto técnico + documental; **escribe `HypothesisRevision` en cada actualización de hipótesis**. |
| **rag** *(nuevo)* | Ingesta, indexado (`pgvector`) y recuperación de fragmentos de documentación técnica; expone `DocumentRetrievalService` a `AI`. |
| **jobs** *(nuevo — v2.1, brecha imprescindible #4)* | Único módulo que conoce la tabla `Job` y el mecanismo de ejecución asíncrona (worker in-process). Expone `enqueue()`/`getStatus()` a `Evidence` y `Reports`; internamente invoca `AI`/`rag`/`Storage` según el tipo de job. |
| Common | Filtros, interceptores, DTO compartidos y utilidades transversales específicas. |

### 13.3 Límites de Dependencia *(actualizada)*

Controllers no acceden directamente a Prisma. Módulos de dominio no importan SDK de proveedor IA. Módulos de dominio no importan SDK de proveedor de datos vehiculares — solo `vehicle-data-provider` lo hace. Storage Module es el único que conoce Supabase Storage. Auth Module es el único que integra detalles de Supabase Auth. AI Module no altera directamente el estado sin pasar por Investigation Service. Report Module consume una instantánea consistente de la investigación (incluye `RAGRetrievalLog` de esa investigación; **nunca invoca a `AI` o `rag` en vivo durante la consolidación del informe** — todo el contenido ya fue producido y persistido antes de que `Reports` construya `report_json`). **`rag` Module es el único que conoce el proveedor de embeddings y la configuración de `pgvector`; `AI` solo consume `DocumentRetrievalService` como contrato estable.** **`jobs` Module es el único que conoce el mecanismo de ejecución asíncrona; `Evidence` y `Reports` solo encolan y consultan estado, nunca ejecutan el procesamiento ellos mismos.**

### 13.4 Flujo de Mensaje *(actualizado)*

1. Validar token, `investigationId`, propiedad y estado `Active`.
2. Persistir el mensaje del usuario.
3. Construir contexto desde datos autorizados, **incluyendo el bloque técnico del vehículo** ya conocido.
4. **Si corresponde, invocar `rag` para recuperar fragmentos relevantes de documentación técnica y registrar la recuperación (`RAGRetrievalLog`).**
5. Ejecutar AI Engine con timeout y correlation ID.
6. Validar la salida estructurada.
7. Persistir respuesta, hipótesis y cambios de contexto en una operación consistente.
8. Aplicar transición de estado si corresponde.
9. Responder al cliente con datos normalizados.

### 13.5 Flujo de Registro de Vehículo por Patente *(nuevo)*

1. Validar token y formato de patente.
2. `Vehicles` invoca `vehicle-data-provider.lookupByPlate(plate, countryCode)`.
3. Registrar el intento en `VehicleLookupLog` (éxito, no encontrado, o error de proveedor).
4. Si hay resultado, devolver los datos normalizados al cliente **sin persistir aún** — el usuario debe confirmar/editar antes de guardar (paso "Confirmar datos del vehículo", 12.3).
5. Si no hay proveedor disponible, hay error del proveedor, o no se encuentra la patente, informar al cliente de forma clara y ofrecer directamente el formulario manual, sin tratarlo como un fallo bloqueante.
6. Al confirmar, `Vehicles` persiste el registro con `registration_method`, `data_source` y `data_synced_at`.

### 13.6 Flujo Asíncrono de Análisis de Evidencia *(nuevo — v2.1, soporta 9.12)*

1. `Evidence` valida y persiste el archivo (Storage) y sus metadatos; responde `202 Accepted` con `jobId`.
2. `Evidence` encola un job `ANALYZE_EVIDENCE` en `jobs`, propagando `correlationId`.
3. El worker de `jobs` invoca `AI` para el análisis del archivo (imagen/vídeo/audio) fuera de cualquier transacción abierta.
4. Al finalizar, `jobs` marca el job `DONE`/`FAILED` y `AI`/`Evidence` persisten `analysis_json` y las variables derivadas en una operación consistente.
5. El cliente consulta `GET /jobs/{jobId}` (o recibe el estado embebido en `GET .../evidence`) para reflejar progreso real.

### 13.7 Flujo Asíncrono de Generación de Informe *(nuevo — v2.1, soporta 9.12)*

1. `Reports` valida que el caso esté en `Analyzing` (o dispara la transición `Active/Waiting Evidence → Analyzing` si el usuario solicitó "Analizar ahora"); responde `202 Accepted` con `jobId`.
2. `Reports` encola un job `GENERATE_REPORT`.
3. El worker construye la instantánea consistente (Hypotheses vigentes, Evidence, RAGRetrievalLog) y produce `report_json`.
4. **En una única transacción**: se calcula `report_version = MAX(report_version WHERE investigation_id = X) + 1` con bloqueo de fila, se inserta el nuevo `Reports` con `is_latest = true`, se pone `is_latest = false` en la versión anterior (si existía), y se registra la transición de estado en `InvestigationStateLog` (`Analyzing → Report Generated`).
5. `jobs` marca el job `DONE`; el cliente consulta el informe vigente.

### 13.8 Validación y Errores

Sin cambios estructurales respecto a v1.2: DTO y transformaciones explícitas, límites de tamaño y allowlist MIME, excepciones de dominio convertidas a códigos HTTP consistentes, nunca exponer stack traces/SQL/secretos/payloads de proveedor, los reintentos no deben duplicar mensajes, evidencia ni informes (reforzado ahora por la idempotencia de `jobs` vía `correlationId`).

### 13.9 Persistencia, Transacciones y Concurrencia *(ampliada — v2.1)*

Las operaciones que cambian múltiples registros relacionados usan transacciones Prisma. **Ninguna llamada larga a IA, Storage, Vehicle Data Provider o RAG permanece dentro de una transacción abierta** (ampliado en v2.1: la regla de v1.2 solo mencionaba IA y Storage). Los cambios de estado usan control de concurrencia mediante `updated_at` o versión equivalente, y **toda transición de `Investigations.current_status` se persiste junto con su fila correspondiente en `InvestigationStateLog` dentro de la misma transacción** (ver 10.6b). **La creación de una nueva versión de `Reports` es atómica** respecto al cálculo de `report_version` y a la actualización de `is_latest` (ver 13.7, paso 4) para evitar condiciones de carrera entre solicitudes concurrentes de análisis. Las migraciones se prueban en Staging y cuentan con estrategia de rollback o forward-fix.

### 13.10 Observabilidad *(ampliada)*

| Señal | Mínimo |
|---|---|
| Logs | JSON estructurado con timestamp, level, service, route, `userId` pseudonimizado, `investigationId` y `correlationId`. |
| Métricas | Latencia, errores, throughput, conexiones DB, uso de IA, uso de Vehicle Data Provider, uso de RAG (recuperaciones por interacción, latencia de `pgvector`), cargas, PDF y **estado de la cola de `jobs` (pendientes, en ejecución, fallidos, tiempo medio de procesamiento)**. |
| Health | Liveness y readiness; dependencias críticas verificadas (incluye disponibilidad de `pgvector`, del/los proveedor(es) de datos vehiculares y del worker de `jobs`) sin exponer secretos. |

### 13.11 Configuración y Entornos, 13.12 Seguridad Centralizada

Sin cambios respecto a v1.2.

---

## 14. AI Engine Specification

### 14.1 Objetivo

Conducir investigaciones mecánicas mediante recopilación estructurada, análisis de evidencia, mantenimiento de hipótesis e identificación de incertidumbre, aprovechando automáticamente el contexto técnico del vehículo y, cuando sea relevante, documentación técnica autorizada recuperada dinámicamente. El motor apoya decisiones; no emite diagnósticos definitivos.

### 14.2 Filosofía

Sin cambios respecto a v1.2 (investigación antes que diagnóstico, evidencia antes que suposición, transparencia, progresión, seguridad, trazabilidad).

### 14.3 Ciclo de Investigación

Sin cambios estructurales: Recopilar → Normalizar contexto → Formular pregunta/solicitud → Recibir respuesta/evidencia → Actualizar hipótesis → Evaluar contradicciones y faltantes → Recalcular confianza → Continuar o generar informe.

### 14.4 Contexto Persistente *(actualizado — incorpora PRD v3.2, Actualización v3.1, puntos 4 y 5)*

| Bloque | Contenido |
|---|---|
| Vehicle | Marca, modelo, versión, año, motor, cilindrada, combustible, transmisión, tracción, kilometraje, VIN y **origen del dato** (`registration_method`/`data_source`). |
| Problem | Título y descripción inicial. |
| Conversation | Mensajes relevantes en orden cronológico. |
| Evidence | Metadatos y análisis normalizado por archivo. |
| Hypotheses | Descripción, estado, razonamiento, evidencia y confianza. |
| Missing information | Preguntas pendientes y evidencia solicitada. |
| **Retrieved documentation** *(nuevo)* | Fragmentos de `DocumentChunk` recuperados vía RAG, cada uno con cita de su `TechnicalDocument` de origen. Contexto temporal de esta interacción únicamente. |
| Investigation | Estado actual y decisiones de flujo. |
| Safety | Alertas o restricciones activas. |

El contexto se construye en backend desde registros autorizados. Si excede el límite del proveedor, se resume por bloques preservando hechos, contradicciones, hipótesis activas, evidencia y decisiones; **nunca se trunca de forma silenciosa**. *(Mejora propuesta — Política de resumen, sin contradecir el PRD: cuando el contexto conversacional exceda un umbral de tokens configurado, se genera un resumen estructurado —no libre— que preserva explícitamente: hechos confirmados, contradicciones no resueltas, hipótesis activas con su estado, y evidencia relevante con su referencia; el resumen reemplaza mensajes antiguos solo en el prompt enviado al proveedor, nunca en `Messages`, que conserva el historial completo e inmutable.)*

**Regla explícita (PRD v3.2, Actualización v3.1, punto 4):** si el vehículo fue identificado correctamente (por patente o manualmente con datos suficientes), la IA **no debe volver a preguntar información ya conocida**, salvo que necesite validarla explícitamente (p. ej., confirmar que el motor no ha sido reemplazado).

### 14.5 Contrato de Prompt *(actualizado)*

Los prompts se versionan y se componen en backend. La estructura mínima es:

1. **System policy**: rol, límites, seguridad y formato.
2. **Product policy**: investigación, no diagnóstico y gestión de incertidumbre.
3. **Investigation context**: vehículo (incl. datos técnicos ya conocidos), problema, historia y estado.
4. **Evidence context**: resultados y referencias.
5. **Retrieved documentation** *(nuevo)*: fragmentos recuperados por RAG con cita de origen, explícitamente marcados como material de referencia, no como hechos del caso.
6. **Hypothesis state**: activas, descartadas y parcialmente confirmadas.
7. **Task**: objetivo único de la llamada.
8. **Output schema**: JSON validable y códigos permitidos.

> **Regla** — La aplicación móvil no construye prompts ni envía instrucciones del sistema. El bloque "Retrieved documentation" se ensambla exclusivamente en backend a partir de `rag`.

### 14.6–14.9 Objetivos conversacionales, Hipótesis, Confianza e Incertidumbre, Solicitud y Análisis de Evidencia

Sin cambios respecto a v1.2, con una precisión (v2.1): cada actualización de una hipótesis (confianza, razonamiento o estado ACTIVE/DISCARDED/PARTIALLY_CONFIRMED) debe escribir una fila en `HypothesisRevision` (10.6c) antes o junto con la actualización de la fila vigente en `Hypotheses`, para cumplir PRD §162/§167 (historial de cambios nunca sobrescrito).

### 14.10 Salida Estructurada *(actualizada)*

```json
{
  "assistantMessage": "string",
  "question": "string | null",
  "requestedEvidence": [],
  "hypothesisUpdates": [],
  "missingInformation": [],
  "contradictions": [],
  "referencedDocuments": [],
  "safety": { "stop": false, "message": null },
  "recommendedState": "ACTIVE | WAITING_EVIDENCE | ANALYZING"
}
```

`referencedDocuments` *(nuevo)*: lista de `document_id`/`chunk_id` efectivamente citados por el modelo en `assistantMessage`, para trazabilidad y para poblar `RAGRetrievalLog` con la relación real de uso (no solo de recuperación). El backend valida el esquema y decide la transición final. Una salida inválida se rechaza, registra y reintenta según política controlada.

### 14.11 Reglas de Seguridad

Sin cambios respecto a v1.2. Se añade explícitamente: la documentación técnica recuperada por RAG **no exime** a la IA de las reglas de seguridad — un boletín técnico no autoriza a recomendar una acción peligrosa si la evidencia del caso es insuficiente.

### 14.12 Generación del Informe *(actualizada)*

El informe se genera cuando el estado y el contexto cumplen las condiciones del backend. El modelo produce `report_json` conforme a un esquema versionado. El informe contiene:

| Sección | Contenido |
|---|---|
| Resumen ejecutivo | Problema, alcance y estado de la investigación. |
| Vehículo y contexto | Datos usados y antecedentes relevantes, incluyendo si fueron recuperados automáticamente. |
| Evidencia considerada | Archivos, observaciones y limitaciones. |
| Hipótesis | Ordenadas, con razonamiento, evidencia y confianza. |
| Contradicciones | Elementos no conciliados. |
| Información faltante | Datos que podrían aumentar o reducir confianza. |
| **Documentación de referencia** *(nuevo)* | Documentos técnicos citados durante la investigación, si los hubo, con su fuente. |
| Recomendaciones | Siguientes pasos seguros y proporcionales. |
| Limitaciones | Declaración de no diagnóstico y límites del análisis. |
| Trazabilidad | Versión del esquema, proveedor/modelo y fecha. |

### 14.13 Independencia del Proveedor *(actualizada)*

Contratos internos estables. Adaptadores por proveedor — tanto para IA (`AIProvider`) como para datos vehiculares (`VehicleDataProvider`) y para embeddings de RAG. Timeouts, errores y metadatos normalizados. Pruebas de contrato con respuestas válidas e inválidas. La lógica de investigación y estados permanece en CarPlus.

### 14.14–14.15 Fallos y Reintentos, Versionado y Evaluación

Sin cambios estructurales. Se añade a 14.15: cambios en la política de recuperación RAG (p. ej. qué fuentes se autorizan, cómo se pondera la relevancia) también requieren ADR y actualización de casos de prueba, igual que cambios en el prompt o el esquema de salida.

---

## 15. User Stories y Criterios de Aceptación

### 15.1 Convención

Sin cambios: "Como [rol], quiero [objetivo], para [beneficio]".

### 15.2 Historias del MVP *(se añaden US-018 a US-021)*

| ID | Historia | Prioridad |
|---|---|---|
| US-001 a US-017 | Sin cambios respecto a v1.2. | — |
| **US-018** | Como usuario, quiero registrar mi vehículo ingresando la patente, para no tener que completar manualmente sus datos técnicos. | Alta |
| **US-019** | Como usuario, quiero poder registrar mi vehículo manualmente si la búsqueda por patente no está disponible o falla, para no quedar bloqueado. | Alta |
| **US-020** | Como usuario, quiero poder corregir cualquier dato recuperado automáticamente de mi vehículo, para asegurar que la información sea correcta. | Alta |
| **US-021** | Como usuario, quiero que la IA no me pregunte datos técnicos que ya proporcioné o que ya se recuperaron automáticamente, para no repetir información innecesariamente. | Alta |

### 15.3 Definition of Done para Historias

Sin cambios respecto a v1.2.

### 15.4 Estrategia de Pruebas *(nuevo — v2.1, brecha imprescindible #5)*

La v2.0 solo mencionaba pruebas de forma dispersa en los checklists de release (17.7–17.9), sin una estrategia explícita. PRD Fase 21 exige niveles de prueba diferenciados; se formaliza aquí:

| Nivel | Alcance | Herramienta de referencia |
|---|---|---|
| Unitarias | Reglas de negocio, validaciones, transformaciones, máquina de estados (incl. transición `Report Generated → Active`), cálculo de `report_version`. | Jest |
| Integración | Frontend↔Backend, Backend↔DB, Backend↔IA (con adaptador simulado), Backend↔Vehicle Data Provider (con adaptador nulo/mock), Backend↔RAG (`pgvector` en Staging/Test). | Jest + Testcontainers o equivalente |
| End-to-End | Flujo completo (registro manual y por patente → investigación → evidencia → informe → historial), incluyendo el camino de fallback manual y de continuar una investigación tras un informe (nueva versión). | Detox/Playwright según capa |
| Regresión | Suite automatizada ejecutada en CI antes de cada merge a `develop`/`main`. | GitHub Actions |
| Rendimiento | Contra los objetivos de la Sección 11.8, incluyendo latencia de recuperación RAG y de `lookup-by-plate`. | k6 o equivalente, en Staging |
| Seguridad | Autorización cruzada entre usuarios, validación de archivos, rate limiting. | Pruebas automatizadas + revisión manual previa a beta |
| Concurrencia *(nuevo)* | Dos solicitudes simultáneas de "Analizar ahora" sobre el mismo caso no deben producir dos versiones con el mismo `report_version` ni un estado inconsistente. | Prueba de integración dedicada |

Ningún cambio se considera terminado (Definition of Done, 15.3/17.7) si degrada la cobertura de estos niveles para el flujo que afecta.

### 15.5 Evaluación de Comportamiento del AI Engine *(nuevo — v2.1, brecha imprescindible #5)*

Los principios inmutables del PRD (§130: no diagnosticar, comunicar incertidumbre, priorizar seguridad, etc.) y las reglas conversacionales (PC-001 a PC-005, RCV-001 a RCV-008) **no son verificables mediante pruebas de esquema JSON**, que solo confirman forma, no comportamiento. Se incorpora un arnés de evaluación específico, ejecutado en Staging antes de cada cambio de prompt/esquema/política del motor (ver 14.15):

- **Casos dorados (*golden scenarios*)**: conjunto versionado de conversaciones sintéticas con evidencia conocida, cubriendo al menos: síntomas de riesgo de seguridad (frenos, sobrecalentamiento, dirección), evidencia contradictoria, evidencia insuficiente, y un vehículo con contexto técnico automático ya cargado.
- **Aserciones de comportamiento, no solo de formato**: para cada caso dorado se verifica que la salida (a) nunca use lenguaje de diagnóstico definitivo, (b) no repita una pregunta ya respondida, (c) escale correctamente el nivel de urgencia ante síntomas de riesgo, (d) no invente información fuera de la evidencia/contexto/documentación entregada, y (e) cite correctamente `referencedDocuments` cuando use contenido recuperado por RAG.
- **Consistencia**: el mismo caso dorado se ejecuta múltiples veces; se verifica que la hipótesis principal, la urgencia y las recomendaciones prioritarias no varíen de forma sustantiva entre ejecuciones (RSIA-017/§121/§234), aunque sí pueda variar la redacción.
- Cambios que alteren el comportamiento (prompt, esquema, política de recuperación RAG) requieren re-ejecutar el arnés completo y registrar el resultado, además del ADR correspondiente (ya exigido en 14.15).

---

## 16. Backlog Técnico y Roadmap

### 16.1 Secuencia de Implementación *(actualizada)*

| Fase | Resultado | Dependencias |
|---|---|---|
| 1. Plataforma | Repositorio, NestJS, React Native, PostgreSQL (+`pgvector`), Prisma, Supabase, Docker, entornos, CI inicial, **y módulo `jobs` (tabla + worker in-process) desde el arranque, dado que Evidencia e Informes dependen de él (v2.1)**. | Ninguna |
| 2. Identidad | Registro, login, sesión, protección de rutas y perfil. | Plataforma |
| 3. Vehículos (manual) | Modelo, API y pantallas de vehículos — registro manual. | Identidad |
| **3b. Vehicle Data Provider** | Interfaz `VehicleDataProvider`, adaptador nulo (fallback), y adaptador real para el mercado de lanzamiento si existe uno autorizado; flujo de confirmación de datos. | Vehículos (manual) |
| 4. Investigaciones | Modelo, estados (incl. transición `Report Generated → Active`), `InvestigationStateLog`, creación, detalle e historial básico. | Vehículos |
| 5. AI Chat | Mensajes, contexto (incl. bloque técnico del vehículo), adaptador IA, `HypothesisRevision` y persistencia. | Investigaciones |
| **5b. RAG técnico** | Pipeline de ingesta, `pgvector`, `DocumentRetrievalService`, integración con AI Chat y corpus inicial mínimo. | AI Chat |
| 6. Evidencia | Carga, Storage, metadatos y **procesamiento asíncrono vía `jobs`**. | Investigaciones, Plataforma (jobs) |
| 7. Informes | `report_json` **versionado**, generación asíncrona vía `jobs`, visualización, PDF e historial final (incl. sección de documentación de referencia). | AI Chat + Evidencia + RAG técnico |
| 8. Beta | Rendimiento, seguridad, observabilidad, corrección, E2E (incl. fallback manual, ausencia de RAG relevante, continuar investigación tras informe) **y ejecución del arnés de evaluación del AI Engine (15.5)**. | Flujo completo |

> Las fases **3b** y **5b** pueden ejecutarse con alcance mínimo (un solo país/proveedor; un corpus pequeño) sin bloquear el avance a fases posteriores, tal como habilita el PRD v3.2, Actualización v3.1. Lo que no puede omitirse es la interfaz y el flujo de fallback.

### 16.2 Priorización *(actualizada)*

| Nivel | Definición | Incluye |
|---|---|---|
| P0 | Bloquea el flujo MVP. | Identidad, vehículos (manual), investigaciones, chat, estados, informe, **fallback manual de Vehicle Data Provider**. |
| P1 | Necesario para beta utilizable. | Historial, perfil, evidencia completa, PDF, observabilidad, **integración real de Vehicle Data Provider para el mercado de lanzamiento**, **RAG con corpus inicial**. |
| P2 | Mejora no bloqueante. | Ajustes visuales, optimizaciones menores, **expansión de cobertura geográfica del Vehicle Data Provider**, **crecimiento del corpus RAG**. |
| P3 | Fuera del MVP. | Pagos, marketplace, flotas, empresas, Base de Conocimiento persistente, Grafo de Conocimiento, Sistema de Aprendizaje. |

### 16.3 Hitos *(se añade uno)*

| Hito | Criterio de salida |
|---|---|
| Plataforma Base | Usuario autenticado administra vehículos. |
| **Identificación Vehicular Enriquecida** | Registro por patente funcional con fallback manual verificado; datos editables antes de guardar. |
| Investigación Funcional | Caso Active conserva conversación y contexto, incluyendo contexto técnico automático. |
| Evidencia | Archivos validados y trazables se incorporan al caso. |
| **Documentación Técnica Operativa** | RAG recupera y cita documentación relevante durante una investigación real. |
| Informe Final | `report_json` persistido, visible y exportable a PDF, incluyendo documentación de referencia cuando aplique. |
| Beta Cerrada | E2E principal estable, seguridad y observabilidad verificadas. |

### 16.4 Riesgos Técnicos *(se añaden filas)*

| Riesgo | Control |
|---|---|
| Cambios/costes de proveedor IA | Adaptadores, configuración y métricas de uso. |
| Contexto extenso | Resumen estructurado y límites medidos (ver 14.4). |
| Archivos grandes | Límites, validación, progreso y pruebas por dispositivo. |
| Almacenamiento de evidencia | Rutas internas, lifecycle y monitorización. |
| Compatibilidad móvil | Matriz de dispositivos objetivo y E2E. |
| Salida IA inválida | Esquema validado, reintento controlado y fallback seguro. |
| Concurrencia de estados | Control de versión y 409 en conflicto. |
| **Falta de cobertura del Vehicle Data Provider en el mercado de lanzamiento** | Adaptador nulo por defecto; UX de fallback manual sin fricción, verificado en pruebas E2E. |
| **Escalabilidad de `pgvector` con corpus creciente** | Monitorizar latencia de búsqueda vectorial; documentar umbral a partir del cual se evaluaría un motor vectorial dedicado (ADR futuro). |
| **Calidad/autorización de fuentes RAG** | Proceso de ingesta restringido a fuentes aprobadas explícitamente (`authorized_by` obligatorio en `TechnicalDocument`). |

### 16.5 Entregables *(actualizado)*

Aplicación móvil funcional. Backend desplegable como monolito modular. Esquema y migraciones Prisma versionadas (incl. `pgvector`). OpenAPI actualizado. AI Engine operativo y evaluado. **Vehicle Data Provider operativo con al menos un adaptador real y el adaptador nulo.** **RAG Service operativo con corpus inicial.** Storage integrado. Informe estructurado y PDF bajo demanda. Pruebas automatizadas, observabilidad y documentación técnica.

---

## 17. Engineering Handbook

### 17.1 Estructura del Proyecto *(actualizada)*

| Área | Estructura |
|---|---|
| Frontend | `src/components, screens, navigation, hooks, services, api, assets, types, utils, constants` |
| Backend | `src/auth, users, vehicles, vehicle-data-provider, investigations, messages, evidence, reports, ai, rag, storage, database, common, config` |
| Arquitectura | `docs/adr` |
| API | `openapi/` o contrato equivalente versionado |

### 17.2–17.5 Convenciones de nombres, Git Flow, Conventional Commits, Versionado

Sin cambios respecto a v1.2.

### 17.6 Variables de Entorno *(se añaden filas)*

| Variable/Grupo | Uso |
|---|---|
| DATABASE_URL | Conexión PostgreSQL. |
| SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY | Identidad y storage. |
| JWT / Auth config | Validación de sesión si aplica. |
| AI_PROVIDER / MODEL / AI_API_KEY_* / AI_TIMEOUT_MS | Selección y configuración del proveedor de IA. |
| **VEHICLE_DATA_PROVIDER** | **Nuevo.** Selección del adaptador activo (o nulo) por entorno/país. |
| **VEHICLE_DATA_PROVIDER_API_KEY_\*** | **Nuevo.** Secretos por proveedor de datos vehiculares. |
| **RAG_EMBEDDING_PROVIDER / RAG_EMBEDDING_MODEL** | **Nuevo.** Selección del proveedor de embeddings, desacoplado del proveedor de IA conversacional. |
| **RAG_MAX_CHUNKS_PER_QUERY** | **Nuevo.** Límite de fragmentos recuperados por interacción. |
| MAX_UPLOAD_SIZE / ALLOWED_MIME_TYPES | Límite y allowlist de carga. |
| CORS_ORIGINS | Orígenes permitidos. |
| LOG_LEVEL / ERROR_TRACKING_DSN | Observabilidad. |

### 17.7–17.9 Definition of Done, Checklist de Release, Checklist de Beta MVP *(se añade un ítem a cada checklist)*

- Checklist de Release: *"Migraciones de `pgvector` y de nuevas entidades RAG/Vehicle Data Provider validadas en Staging."*
- Checklist de Beta MVP: *"El registro por patente funciona con al menos un proveedor real y su fallback manual; la recuperación RAG cita correctamente su fuente cuando se usa."*

### 17.10 Architecture Decision Records *(actualizado — registro de ADR pendientes)*

Las decisiones que cambien stack, límites de módulo, persistencia, contratos, seguridad o estrategia de IA/datos vehiculares/RAG se documentan mediante ADR con estado, contexto, decisión, consecuencias y alternativas. Esta práctica evita introducir cambios arquitectónicos implícitos durante el desarrollo.

**Registro de ADR requeridos, aún no redactados formalmente (pendientes antes o durante su fase correspondiente del backlog):**

| ADR | Tema | Fase asociada |
|---|---|---|
| ADR-000 | Resolución del conflicto PRD v3.0/v3.1 — **Resuelto por esta versión del documento**: PRD v3.1 es fuente de verdad única; este Technical Spec queda alineado. | — (cerrado) |
| ADR-001 | Monolito modular (NestJS) vs. microservicios para el MVP. | 1 |
| ADR-002 | Supabase como proveedor de Auth + Storage: trade-off y estrategia de reemplazo. | 1 |
| ADR-003 | Arquitectura multi-proveedor de IA: política de selección/fallback. | 5 |
| ADR-004 | `pgvector` sobre PostgreSQL vs. base de datos vectorial dedicada para RAG. | 5b |
| ADR-005 | Estrategia de resumen de contexto conversacional (ver 14.4). | 5 |
| ADR-006 | Umbrales de traducción de confianza numérica a niveles cualitativos (UI e informe). | 6/7 |
| ADR-007 | Versionado del esquema `report_json`. | 7 |
| ADR-008 | Esquema de datos con extensibilidad hacia Base de Conocimiento / Grafo de Conocimiento. | 4/6 |
| ADR-009 | Política de privacidad/anonimización para futuro Sistema de Aprendizaje. | — (post-MVP) |
| ADR-010 | Selección del/los proveedor(es) de Vehicle Data Provider para el mercado de lanzamiento. | 3b |
| **ADR-011** *(nuevo — v2.1)* | Tecnología definitiva de cola asíncrona (`jobs`): tabla PostgreSQL con worker in-process (decisión por defecto adoptada en esta versión, ver 9.12) vs. BullMQ/Redis u otra cola gestionada, a reconsiderar si el volumen de evidencia o la latencia de *polling* lo justifican. | 1 |

> **Nota sobre el alcance de estos ADR:** a diferencia de las brechas #1–#5 corregidas en esta revisión (que eran incumplimientos de requisitos explícitos del PRD y por tanto se resolvieron directamente en el documento), los ADR-001 a ADR-011 son decisiones de **implementación con alternativas razonables** que no contradicen el PRD en ninguna de sus opciones; por eso permanecen como registros a formalizar, no como brechas a cerrar.

### 17.11 Cierre

Esta versión integra y reemplaza v1.2 y v2.0, alineándose íntegramente con PRD v3.2 y con los hallazgos de la revisión arquitectónica final (Sección 18). Es la referencia de implementación del MVP. Cualquier cambio de alcance se valida contra el PRD; cualquier cambio arquitectónico relevante se registra mediante ADR y nueva versión del documento.

---

## 18. Revisión Arquitectónica Final y Auditoría de Consistencia — PRD v3.2 ↔ Technical Specification v2.1 ↔ Arquitectura Propuesta

Revisión realizada como responsable de aprobar el inicio del desarrollo, con foco específico en: máquina de estados, modelo de dominio, versionado de informes, concurrencia, límites entre módulos, transacciones, procesamiento asíncrono, AI Engine, estrategia de pruebas y ADR pendientes.

### 18.1 Brechas imprescindibles detectadas y corregidas en esta revisión

| # | Área | Brecha encontrada en v2.0 | Corrección aplicada en v2.1 |
|---|---|---|---|
| 1 | Máquina de estados / versionado de informes | `Report Generated` solo transicionaba a `Closed`; `Reports` era 1–0..1 con `unique(investigation_id)`, impidiendo físicamente una segunda versión — en contradicción directa con RI-009/RBD-004. | Transición `Report Generated → Active` añadida (9.10); `Reports` pasa a 1–\*, con `unique(investigation_id, report_version)` + índice único parcial sobre `is_latest` (10.6, 10.10). La tensión con el Estado 7 de la Fase 6 quedó resuelta oficialmente en PRD v3.2 (ver 9.10). |
| 2 | Modelo de dominio / auditoría | No existía registro de transiciones de estado del caso, exigido explícitamente por §33 y RC-004/RC-005. | Nueva entidad `InvestigationStateLog`, append-only, escrita en la misma transacción que cada transición (10.6b, 13.9). |
| 3 | Modelo de dominio / historial | `Hypotheses` mutaba en el sitio; no se preservaba el historial de cambios exigido por §162/§167. | Nueva entidad `HypothesisRevision`, append-only (10.6c, 14.6–14.9). |
| 4 | Procesamiento asíncrono | No existía mecanismo para las tareas de larga duración (análisis de evidencia, generación de informe) que §294 exige ejecutar de forma asíncrona con retroalimentación visible. | Nuevo módulo `jobs` (tabla + worker in-process), flujos asíncronos explícitos para Evidencia (13.6) e Informes (13.7), endpoint `GET /jobs/{jobId}` (11.3). |
| 5 | AI Engine / estrategia de pruebas | No existía una estrategia de pruebas explícita ni un mecanismo para evaluar el comportamiento del AI Engine más allá de la validación de esquema JSON, pese a exigirlo la Fase 21 del PRD. | Nuevas secciones 15.4 (Estrategia de Pruebas por nivel) y 15.5 (arnés de evaluación de comportamiento con casos dorados, aserciones de seguridad/consistencia). |

### 18.2 Verificación de consistencia (incluye hallazgos de la Sección 18 de v2.0, reconfirmados)

| # | Punto verificado | Resultado |
|---|---|---|
| 1 | Vehicle Data Provider (PRD v3.2, Actualización v3.1, punto 3) | **Alineado.** Interfaz `VehicleDataProvider`, módulo dedicado, adaptador nulo de fallback, endpoint dedicado, entidad de trazabilidad (`VehicleLookupLog`). |
| 2 | Registro por patente, opcional y no bloqueante (PRD v3.2, Actualización v3.1, punto 1) | **Alineado.** Flujo 13.5 y pantalla "Confirmar datos del vehículo" garantizan que el fallback manual siempre esté disponible. |
| 3 | Datos técnicos editables (PRD v3.2, Actualización v3.1, punto 2) | **Alineado.** Todos los campos recuperados automáticamente son editables en `Vehicles`, sin excepción, incluso post-registro. |
| 4 | Arquitectura RAG (PRD v3.2, Actualización v3.1, punto 5) | **Alineado.** Módulo `rag`, entidades `TechnicalDocument`/`DocumentChunk`, integración en el contrato de prompt (14.5) y en el informe (14.12). |
| 5 | Documentación como contexto temporal, nunca memoria permanente (PRD v3.2, Actualización v3.1, punto 5 y 6) | **Alineado.** Explícito en 9.8 y 14.4; distinguido formalmente de la futura Base de Conocimiento (Fase 10 del PRD), que permanece fuera del MVP. |
| 6 | Contexto técnico automático para la IA (PRD v3.2, Actualización v3.1, punto 4) | **Alineado.** Regla explícita en 14.4: no repreguntar información ya conocida salvo validación necesaria. |
| 7 | Independencia de proveedor de IA (PRD, Fase 12/17, principio inmutable) | **Alineado.** `AIProvider` sin cambios respecto a v1.2. |
| 8 | Independencia de proveedor de datos vehiculares (PRD v3.2, Actualización v3.1, punto 3: "para evitar dependencias con un proveedor específico") | **Alineado.** `VehicleDataProvider` sigue el mismo patrón de adaptador que `AIProvider`. |
| 9 | Base de Conocimiento sigue siendo el activo estratégico principal (PRD v3.2, Actualización v3.1, punto 6) | **Alineado.** El MVP no implementa la Base de Conocimiento ni el Grafo, pero el modelo de datos (10.7) no bloquea su incorporación futura, y el documento lo declara explícitamente fuera de alcance en la Sección 8, evitando confundir RAG con conocimiento persistente. |
| 10 | Monolito modular vs. arquitectura de "servicios" descrita en PRD Fase 13 | **Sin contradicción.** El PRD reserva explícitamente arquitectura basada en eventos/microservicios para versiones futuras (Fase 13, "Evolución Futura"); el monolito modular con módulos NestJS es una implementación válida de los límites de dominio descritos. Queda documentado como ADR-001, pendiente de redacción formal. |
| 11 | Acoplamiento a Supabase (Auth + Storage) vs. principio de no depender de librerías difíciles de reemplazar | **Riesgo aceptado y mitigado, no contradicción.** El acceso está encapsulado exclusivamente en `Auth Module`/`Storage Module`. Se mantiene como ADR-002 pendiente para documentar explícitamente el trade-off y la estrategia de salida. |
| 12 | Acoplamiento a PostgreSQL vs. principio de no depender de una base de datos específica | **Sin contradicción.** Prisma actúa como capa de abstracción; el Technical Spec es, por definición, el nivel donde se toman decisiones concretas de implementación, mientras la sustituibilidad se preserva a nivel de contrato (dominio no depende de SQL específico). |
| 13 | Terminología consistente con el PRD (Motor de Investigación, Motor de Decisión, Base de Conocimiento, Grafo de Conocimiento, Sistema de Aprendizaje, Vehicle Data Provider) | **Alineado.** Este documento usa los mismos nombres que el PRD para los conceptos que comparte, facilitando trazabilidad. |
| 14 | Trazabilidad de decisiones IA/RAG/Vehicle Data Provider (principio transversal del PRD, Fases 9, 18, 19, 22) | **Alineado.** `VehicleLookupLog`, `RAGRetrievalLog` y `referencedDocuments` en la salida estructurada cubren esta exigencia sin convertir RAG en aprendizaje permanente. |
| 15 | **Máquina de estados** — soporta el ciclo completo, incluyendo continuar una investigación tras un informe (RI-009) | **Alineado.** Transición `Report Generated → Active` incorporada; la tensión con Estado 7/Fase 6 fue resuelta oficialmente por producto en PRD v3.2 (capítulo "Actualización Oficial — PRD v3.2" y Estado 7 corregido), confirmando que la interpretación técnica adoptada en v2.1 era correcta. |
| 16 | **Modelo de dominio** — preservación de historial exigida transversalmente (§167, §162, §33) | **Alineado tras corrección (18.1, #2 y #3).** `InvestigationStateLog` y `HypothesisRevision` cierran la brecha entre "nunca sobrescribir" (principio repetido en todo el PRD) y un esquema que antes solo guardaba el estado actual. |
| 17 | **Versionado de informes** — RI-009, RBD-004 | **Alineado tras corrección (18.1, #1).** `Reports` 1–\*, `report_version` secuencial atómico, `is_latest` con índice único parcial. |
| 18 | **Concurrencia** — control de condiciones de carrera en transiciones de estado y generación de informes | **Alineado.** `updated_at`/versión para transiciones (ya presente en v2.0); se añade en v2.1 el bloqueo explícito de fila y cálculo atómico de `report_version` (13.7, 13.9) para el caso específico de dos solicitudes concurrentes de análisis. |
| 19 | **Límites entre módulos** — ningún módulo excede su responsabilidad | **Alineado.** `jobs` se incorpora respetando el mismo patrón de encapsulamiento que `vehicle-data-provider` y `rag`: los módulos de dominio (`Evidence`, `Reports`) solo encolan/consultan, nunca ejecutan (13.3). |
| 20 | **Transacciones** — ninguna llamada externa de larga duración dentro de una transacción abierta | **Alineado tras ampliación (13.9).** La regla de v1.2 solo mencionaba IA y Storage; se extiende explícitamente a Vehicle Data Provider y RAG para evitar ambigüedad al implementar esos módulos. |
| 21 | **Procesamiento asíncrono** — §294 (Fase 20) | **Alineado tras corrección (18.1, #4).** Antes ausente; ahora modelado con módulo `jobs`, flujos dedicados y endpoint de consulta de estado. |
| 22 | **AI Engine** — principios inmutables (§130) y reglas conversacionales (PC-001 a PC-005) | **Alineado**, con la advertencia (ya señalada en 15.5) de que su cumplimiento real solo es verificable mediante el arnés de evaluación de comportamiento, no mediante validación de esquema. |
| 23 | **Estrategia de pruebas** — Fase 21 del PRD | **Alineado tras corrección (18.1, #5).** Antes dispersa/implícita; ahora explícita por niveles (15.4) con arnés de comportamiento dedicado para el AI Engine (15.5). |
| 24 | **ADR pendientes** — completitud del registro | **Alineado.** 12 ADR identificados (ADR-000 a ADR-011, Sección 17.10); ADR-000 ya resuelto; los 11 restantes son decisiones de implementación con alternativas válidas dentro del PRD, no brechas de cumplimiento — se dejan pendientes de redacción formal por diseño, no por omisión. |

### 18.3 Conclusión de la auditoría arquitectónica

No se detectan contradicciones activas entre el PRD, este Technical Specification v2.1 y la arquitectura propuesta. Las cinco brechas imprescindibles detectadas durante esta revisión (18.1) fueron corregidas directamente en este mismo documento, no dejadas como hallazgos abiertos. Quedan **11 ADR pendientes de redacción formal** (ADR-001 a ADR-011, Sección 17.10) que documentan decisiones de implementación ya tomadas de forma consistente en este documento — no bloquean el inicio de la Fase 1, pero deben formalizarse antes de cerrar la fase del backlog a la que están asociadas.

### 18.4 Auditoría Final — Sincronización Editorial con PRD v3.2

Esta sección se añade tras la publicación oficial de PRD v3.2, que corrigió en la fuente la tensión documental entre el Estado 7 (Fase 6) y el requisito RI-009 (Fase 7) señalada en 18.3 de la revisión anterior. Verificación de la sincronización:

| Punto verificado | Resultado |
|---|---|
| Referencias al PRD vigente | **Sincronizado.** Todas las referencias de "PRD v3.1" como fuente de verdad vigente se actualizaron a "PRD v3.2" (portada, metadatos, §3.3, §17.11). Las citas a puntos específicos del capítulo histórico "Actualización Oficial — PRD v3.1" se preservaron con precisión, referenciadas como "PRD v3.2, Actualización v3.1, punto N". |
| Resolución de la tensión Fase 6 / RI-009 | **Sincronizado.** La nota que señalaba esta tensión como pendiente de confirmación de producto (9.10, 18.1, 18.2) fue reemplazada por la referencia a su resolución oficial en el capítulo "Actualización Oficial — PRD v3.2" del PRD. La interpretación técnica adoptada en v2.1 (transición `Report Generated → Active`, `Reports` versionado) queda confirmada como correcta, sin ningún ajuste de arquitectura, modelo de datos, API, módulos, ADR, estados, flujos o entidades. |
| Mapa de Pantallas y pantalla de informe | **Sincronizado.** La fila "Informe final" (12.3) y el flujo principal (12.4) reflejan explícitamente las dos acciones oficiales del PRD v3.2: continuar investigando el mismo problema dentro del mismo caso, e iniciar una investigación nueva para un problema diferente. |
| Arquitectura, modelo de datos, API, módulos, ADR, estados, flujos, entidades | **Sin cambios**, por instrucción explícita y porque el PRD v3.2 no introdujo ningún requisito nuevo de arquitectura — solo corrigió una inconsistencia documental que la v2.1 ya había anticipado correctamente. |

**Conclusión:** el PRD v3.2 y el Technical Specification v2.1 quedan **completamente alineados**, sin contradicciones funcionales ni técnicas pendientes entre ambos documentos. El Technical Specification permanece en estado **Architecture Frozen** bajo el mismo número de versión (2.1), ya que esta fue una sincronización puramente editorial. Ambos documentos quedan listos para iniciar la implementación del MVP.

---

## Architecture Frozen

**El Technical Specification v2.1 queda declarado formalmente como Architecture Frozen — ahora sincronizado editorialmente con PRD v3.2.**

La arquitectura, el modelo de dominio, la máquina de estados, el modelo de concurrencia, los límites entre módulos, el procesamiento asíncrono, la especificación del AI Engine y la estrategia de pruebas han sido revisados como responsable de aprobar el inicio del desarrollo. Las brechas imprescindibles detectadas durante esa revisión fueron corregidas en este mismo documento (Sección 18.1); ninguna queda abierta como bloqueante. La posterior corrección de PRD v3.2 confirmó, sin señalar ningún ajuste adicional, que las decisiones técnicas ya tomadas eran correctas (Sección 18.4). Los ADR pendientes (Sección 17.10) son decisiones de implementación con alternativas válidas, no defectos de diseño, y pueden formalizarse en paralelo al desarrollo de su fase correspondiente sin poner en riesgo la coherencia arquitectónica.

**A partir de este punto, cualquier cambio a la máquina de estados, al modelo de dominio, al modelo de concurrencia, a los límites entre módulos o al contrato del AI Engine debe tratarse como un cambio arquitectónico formal — requiere ADR y una nueva versión de este documento, no una modificación silenciosa durante la implementación.**

**PRD v3.2 y Technical Specification v2.1 quedan completamente alineados. Queda autorizado el inicio de la Fase 1 (Plataforma) del roadmap (16.1), sujeto a tu confirmación final.**
