*PRD — **CarPlus** v3.2*

**PRD — ****CarPlus**

**Product**** ****Requirements**** ****Document**

Versión 3.2

*Estado: En desarrollo*

*Documento de Especificación Técnica y Funcional*

Historial de Versiones

| Versión | Cambios principales |
| --- | --- |
| 3.0 | Versión base del PRD (Fases 1 a 24 y Design System). |
| 3.1 | Se incorpora el capítulo "Actualización Oficial — PRD v3.1": Vehicle Data Provider, registro de vehículo por patente, arquitectura RAG para documentación técnica y contexto técnico automático para la IA. |
| **3.2** | **Se corrige una contradicción interna detectada entre el Estado 7 de la Fase 6 ("Informe Generado") y el requisito RI-009 de la Fase 7.** El Estado 7 listaba únicamente "Iniciar una nueva investigación" como acción posible tras un informe, mientras que RI-009 exige generar una nueva versión del informe cuando el usuario continúa investigando el mismo caso. Se corrigen §27 (Ciclo de Vida del Caso), §28 (Estado 7), §29 (Transiciones Permitidas, antes vacía) y §30 (Eventos que Producen Cambios de Estado) de la Fase 6, se añade una definición formal de "Caso", y se revisan y ajustan las referencias relacionadas en la Fase 3 (§12.3) y la Fase 16 (§202, §206) para mantener consistencia documental completa. RI-009 prevalece como regla vigente. No se modifica ningún requisito funcional adicional ni el alcance del MVP. |

Índice General

	Índice General	2

	FASE 1 — FUNDAMENTOS	18

	1.1 Propósito	18

	1.3 Rol de la Inteligencia Artificial	18

	2.1 Nombre del Producto	19

	2.2 Resumen Ejecutivo	19

	2.3 Problema	19

	2.6 Qué es CarPlus	19

	3.1 Visión	20

	3.2 Misión	20

	3.3 Objetivos de Largo Plazo	20

	4. Target Users	20

	4.3 Necesidades	20

	4.5 Motivaciones	21

	FASE 2 — EXPERIENCIA DEL PRODUCTO	22

	Persona 2 — Comprador de Vehículos Usados (Futuro)	22

	Etapa 1 — Descubrimiento	23

	Etapa 3 — Investigación	23

	Etapa 4 — Decisión	23

	Etapa 5 — Generación del Informe	23

	Etapa 6 — Después del Informe	24

	7. Core Features	24

	8. UX Requirements	25

	FASE 3 — SISTEMA DE INTELIGENCIA	27

	9. Inteligencia Artificial del Producto	27

	9.1 Objetivo de la IA	27

	9.2 Rol dentro del producto	27

	9.3 Información que recibe	27

	9.4 Información que entrega	28

	9.5 Qué nunca debe hacer	28

	10. Motor de Investigación	29

	10.1 Objetivo	29

	10.2 Filosofía	29

	10.3 Principio central	29

	10.4 Funcionamiento	29

	10.5 Ciclo de investigación	30

	10.6 Variables de Investigación	30

	11. Motor de Decisión	31

	11.1 Objetivo	31

	11.2 Responsabilidades	31

	11.3 Principio	31

	11.4 Control del usuario	31

	12. Sistema de Aprendizaje	32

	12.1 Objetivo	32

	12.2 Unidad de aprendizaje	32

	12.3 Ciclo de un caso	32

	12.4 Información almacenada	32

	12.5 Calidad del caso	33

	12.6 Aprendizaje de errores	33

	12.7 Historial	33

	13. Base de Conocimiento	33

	13.1 Objetivo	34

	13.2 Principio	34

	13.3 Contenido	34

	13.4 Evolución	34

	14. Principios de Responsabilidad	34

	14.1 Transparencia	34

	14.2 Incertidumbre	34

	14.3 Explicabilidad	35

	14.4 Seguridad	35

	FASE 4 — ARQUITECTURA Y REQUISITOS TÉCNICOS	36

	15. Arquitectura Lógica	36

	15.1 Objetivo	36

	15.2 Componentes principales	36

	15.3 Aplicación Móvil (Frontend)	36

	15.4 Backend	37

	15.5 Gestor de Casos	37

	15.6 Motor de Investigación	37

	15.7 Motor de Decisión	38

	15.8 Base de Conocimiento	38

	15.9 Sistema de Aprendizaje	38

	15.10 Modelo de IA	38

	16. Functional Requirements	38

	17. Non-Functional Requirements	41

	18. Modelo de Datos (Conceptual)	42

	19. Integraciones	43

	Conclusión de la Fase 4	44

	FASE 5 — PLANIFICACIÓN DEL PRODUCTO	45

	20. MVP (Minimum Viable Product)	45

	20.1 Objetivo del MVP	45

	20.2 Funcionalidades Incluidas	45

	20.3 Funcionalidades Excluidas	46

	20.4 Criterios de Éxito del MVP	47

	21. Roadmap	47

	Versión 1 — MVP	47

	Versión 2	47

	Versión 3	47

	22. Riesgos	48

	23. Métricas	49

	24. Preguntas Abiertas	50

	25. Anexo — Decisiones de Producto	50

	FASE 6 — ESTADOS DEL SISTEMA	52

	26. Estados del Sistema	52

	26.1 Objetivo	52

	26.2 Principios	52

	27. Ciclo de Vida del Caso	52

	28. Definición de Estados	53

	Estado 1 — Caso Creado	53

	Estado 2 — Investigando	53

	Estado 3 — Esperando Respuesta	54

	Estado 4 — Procesando Evidencia	54

	Estado 5 — Listo para Analizar	55

	Estado 6 — Analizando	55

	Estado 7 — Informe Generado	56

	Estado 8 — Esperando Confirmación (Futuro)	56

	Estado 9 — Caso Confirmado (Futuro)	56

	Estado 10 — Archivado	56

	29. Transiciones Permitidas	57

	30. Eventos que Producen Cambios de Estado	57

	31. Reglas de Consistencia	57

	32. Manejo de Errores	58

	33. Auditoría	58

	FASE 7 — ESPECIFICACIÓN DEL INFORME	60

	34. Objetivo del Informe	60

	34.1 Propósito	60

	34.2 Principios	60

	35. Estructura del Informe	60

	36. Resumen General	61

	37. Nivel de Urgencia	61

	Nivel 1 — Bajo	61

	Nivel 2 — Moderado	62

	Nivel 3 — Alto	62

	Nivel 4 — Crítico	62

	38. Posibles Causas	62

	39. Compatibilidad con la Evidencia	63

	40. Explicación de las Hipótesis	63

	41. Evidencia Utilizada	64

	42. Qué Revisar Primero	64

	43. Costos Aproximados	64

	44. Limitaciones del Informe	65

	45. Botón "Explícamelo Fácil"	65

	46. Casos Especiales	66

	47. Requisitos del Informe	66

	48. Evolución del Informe	67

	FASE 8 — SISTEMA CONVERSACIONAL	68

	49. Objetivo	68

	49.1 Propósito	68

	49.2 Filosofía	68

	50. Principios Conversacionales	68

	51. Inicio de la Conversación	69

	52. Flujo Conversacional	69

	53. Tipos de Mensajes	70

	54. Selección de Preguntas	71

	55. Priorización de Preguntas	71

	56. Uso de Botones	71

	57. Manejo de Respuestas Especiales	72

	58. Manejo de Contradicciones	72

	59. Resúmenes Parciales	73

	60. Tono Conversacional	73

	61. Adaptación al Usuario	73

	62. Finalización de la Conversación	74

	63. Requisitos Conversacionales	74

	64. Futuras Capacidades Conversacionales	75

	FASE 9 — SISTEMA DE EVIDENCIA	76

	65. Objetivo	76

	65.1 Propósito	76

	65.2 Principios	76

	66. Tipos de Evidencia	76

	67. Ciclo de Vida de la Evidencia	77

	68. Registro de Evidencia	78

	69. Procesamiento	78

	70. Variables Extraídas	79

	71. Relación entre Evidencia y Variables	80

	72. Calidad de la Evidencia	80

	73. Evidencia Contradictoria	80

	74. Evidencia Insuficiente	80

	75. Evidencia No Utilizada	81

	76. Trazabilidad	81

	77. Seguridad e Integridad	81

	78. Requisitos del Sistema de Evidencia	81

	79. Evolución Futura	82

	FASE 10 — BASE DE CONOCIMIENTO	83

	80. Objetivo	83

	80.1 Propósito	83

	80.2 Principios	83

	81. Objetivos de la Base de Conocimiento	83

	82. Fuentes de Conocimiento	83

	83. Organización del Conocimiento	84

	84. Relaciones	84

	85. Patrones	85

	86. Versionado	85

	87. Calidad del Conocimiento	86

	88. Uso durante una Investigación	86

	89. Independencia del Modelo de IA	86

	90. Actualización del Conocimiento	86

	91. Prevención de Contaminación	87

	92. Consulta del Conocimiento	87

	93. Requisitos de la Base de Conocimiento	87

	94. Evolución Futura	88

	FASE 11 — PRINCIPIOS Y DECISIONES DE EXPERIENCIA DE USUARIO (UX)	89

	95. Objetivo	89

	95.1 Propósito	89

	95.2 Alcance	89

	96. Principios de UX	89

	97. Arquitectura de Navegación	90

	98. Registro del Vehículo	90

	99. Experiencia de Investigación	90

	100. Indicador de Progreso	91

	101. Evidencia Multimedia	91

	102. Explicaciones	92

	103. Errores	92

	104. Estados de Carga	92

	105. Acciones Importantes	92

	106. Accesibilidad	92

	107. Adaptación a Dispositivos	93

	108. Experiencia del Informe	93

	109. Microinteracciones	93

	110. Requisitos de UX	93

	111. Métricas de Experiencia	94

	112. Evolución Futura	95

	FASE 12 — ESPECIFICACIÓN DEL SISTEMA DE INTELIGENCIA ARTIFICIAL	96

	113. Objetivo	96

	113.1 Propósito	96

	113.2 Alcance	96

	114. Arquitectura General	96

	115. Responsabilidades	97

	116. Responsabilidades Excluidas	97

	117. Flujo de Razonamiento	97

	118. Generación de Hipótesis	98

	119. Gestión de Incertidumbre	98

	120. Explicabilidad	98

	121. Consistencia	99

	122. Manejo de Información Incompleta	99

	123. Manejo de Contradicciones	99

	124. Seguridad	99

	125. Independencia Tecnológica	99

	126. Observabilidad	100

	127. Evaluación de Calidad	100

	128. Requisitos del Sistema de IA	100

	129. Evolución Futura	101

	130. Principios Inmutables del Sistema de IA	101

	FASE 13 — ARQUITECTURA DEL BACKEND	103

	131. Objetivo	103

	131.1 Propósito	103

	131.2 Principios	103

	132. Responsabilidades del Backend	103

	133. Arquitectura General	104

	134. API Gateway	104

	135. Servicio de Usuarios	105

	136. Servicio de Vehículos	105

	137. Servicio de Casos	105

	138. Servicio de Conversación	105

	139. Servicio de Evidencia	106

	140. Motor de Investigación	106

	141. Motor de Decisión	106

	142. Generador de Informes	107

	143. Base de Conocimiento	107

	144. Sistema de Aprendizaje	107

	145. Flujo de una Investigación	108

	146. Comunicación entre Componentes	109

	147. Manejo de Errores	109

	148. Escalabilidad	109

	149. Observabilidad	109

	150. Seguridad	110

	151. Requisitos del Backend	110

	152. Evolución Futura	111

	FASE 14 — ESPECIFICACIÓN DE LA BASE DE DATOS	112

	153. Objetivo	112

	153.1 Propósito	112

	153.2 Principios	112

	154. Entidades Principales	112

	155. Entidad Usuario	113

	156. Entidad Vehículo	113

	157. Entidad Caso	114

	158. Entidad Conversación	114

	159. Entidad Mensaje	114

	160. Entidad Evidencia	115

	161. Entidad Variable	115

	162. Entidad Hipótesis	116

	163. Entidad Informe	116

	164. Entidad Resultado Confirmado (Futuro)	117

	165. Relaciones	117

	166. Integridad Referencial	118

	167. Versionado	118

	168. Auditoría	118

	169. Índices	118

	170. Almacenamiento Multimedia	119

	171. Escalabilidad	119

	172. Consistencia	119

	173. Requisitos de la Base de Datos	120

	174. Evolución Futura	120

	FASE 15 — ESPECIFICACIÓN DE LA API	122

	175. Objetivo	122

	175.1 Propósito	122

	175.2 Alcance	122

	176. Principios de Diseño	122

	177. Arquitectura General	122

	178. Recursos Principales	123

	179. Versionado	123

	180. Autenticación	124

	181. Formato de Solicitudes	124

	182. Formato de Respuestas	124

	183. Gestión de Usuarios	124

	184. Gestión de Vehículos	125

	185. Gestión de Casos	125

	186. Conversación	125

	187. Evidencia	125

	188. Informes	126

	189. Estados HTTP	126

	190. Manejo de Errores	126

	191. Validación	127

	192. Rate Limiting	127

	193. Idempotencia	127

	194. Observabilidad	127

	195. Seguridad	128

	196. Integraciones Futuras	128

	197. Requisitos de la API	128

	198. Evolución Futura	129

	CAPÍTULO TRANSVERSAL — DESIGN SYSTEM DE CARPLUS	130

	FASE 16 — ESPECIFICACIÓN DEL FRONTEND	147

	199. Objetivo	147

	199.1 Propósito	147

	199.2 Alcance	147

	200. Principios del Frontend	147

	201. Arquitectura General	147

	202. Navegación	148

	203. Pantalla de Inicio	149

	204. Pantalla de Registro de Vehículo	149

	205. Pantalla de Conversación	149

	206. Pantalla de Informe	150

	207. Pantalla de Historial	150

	208. Pantalla de Configuración	150

	209. Componentes Reutilizables	151

	210. Gestión del Estado	151

	211. Validaciones	151

	212. Carga de Evidencia	151

	213. Estados Vacíos	152

	214. Estados de Error	152

	215. Estados de Carga	152

	216. Accesibilidad	153

	217. Rendimiento	153

	218. Responsive Design	153

	219. Requisitos del Frontend	153

	220. Evolución Futura	154

	FASE 17 — IMPLEMENTACIÓN DEL SISTEMA DE INTELIGENCIA ARTIFICIAL	156

	221. Objetivo	156

	221.1 Propósito	156

	221.2 Alcance	156

	222. Principios Fundamentales	156

	223. Rol del Sistema de IA	157

	224. Responsabilidades	157

	225. Restricciones	157

	226. Flujo de Razonamiento	157

	227. Gestión del Contexto	158

	228. Gestión de Variables	158

	229. Generación de Hipótesis	159

	230. Gestión de la Incertidumbre	159

	231. Selección de Preguntas	159

	232. Uso de la Base de Conocimiento	159

	233. Explicabilidad	160

	234. Consistencia	160

	235. Manejo de Información Incompleta	160

	236. Manejo de Contradicciones	160

	237. Priorización de Seguridad	161

	238. Independencia Tecnológica	161

	239. Evaluación del Sistema	161

	240. Requisitos del Sistema de IA	162

	241. Evolución Futura	162

	FASE 18 — GRAFO DE CONOCIMIENTO (KNOWLEDGE GRAPH)	164

	242. Objetivo	164

	242.1 Propósito	164

	242.2 Alcance	164

	243. Principios	164

	244. Objetos del Grafo	164

	245. Nodo Vehículo	165

	246. Nodo Sistema	165

	247. Nodo Componente	166

	248. Nodo Síntoma	166

	249. Nodo Variable	166

	250. Nodo Evidencia	167

	251. Nodo Hipótesis	167

	252. Nodo Reparación	167

	253. Nodo Caso Confirmado	167

	254. Relaciones	168

	255. Relaciones Múltiples	168

	256. Peso de las Relaciones	169

	257. Construcción del Grafo	169

	258. Actualización	169

	259. Consultas	170

	260. Prevención de Contaminación	170

	261. Independencia Tecnológica	170

	262. Requisitos del Grafo	170

	263. Evolución Futura	171

	FASE 19 — SEGURIDAD Y PRIVACIDAD	174

	264. Objetivo	174

	264.1 Propósito	174

	264.2 Alcance	174

	265. Principios de Seguridad	174

	266. Autenticación	174

	267. Autorización	175

	268. Gestión de Sesiones	175

	269. Protección de Datos Personales	175

	270. Protección de Evidencia	175

	271. Cifrado	176

	272. Gestión de Archivos	176

	273. Protección frente a Uso Malicioso	176

	274. Registro de Auditoría	177

	275. Privacidad	177

	276. Retención de Datos	177

	277. Uso de Datos para Aprendizaje	177

	278. Cumplimiento Normativo	178

	279. Gestión de Incidentes	178

	280. Requisitos de Seguridad	178

	281. Evolución Futura	179

	FASE 20 — INFRAESTRUCTURA Y DESPLIEGUE	180

	282. Objetivo	180

	282.1 Propósito	180

	282.2 Alcance	180

	283. Principios de Infraestructura	180

	284. Arquitectura General	180

	285. Ambientes	181

	286. Infraestructura como Código	181

	287. Contenedores	182

	288. Orquestación	182

	289. API Gateway	182

	290. Balanceo de Carga	182

	291. Almacenamiento	183

	292. CDN	183

	293. Caché	183

	294. Procesamiento Asíncrono	184

	295. Integración Continua	184

	296. Despliegue Continuo	184

	297. Gestión de Configuración	184

	298. Gestión de Secretos	185

	299. Backups	185

	300. Recuperación ante Desastres	185

	301. Alta Disponibilidad	186

	302. Portabilidad	186

	303. Requisitos de Infraestructura	186

	304. Evolución Futura	187

	FASE 21 — TESTING Y ASEGURAMIENTO DE LA CALIDAD (QUALITY ASSURANCE)	188

	305. Objetivo	188

	305.1 Propósito	188

	305.2 Alcance	188

	306. Principios de Calidad	188

	307. Estrategia General	188

	308. Pruebas Unitarias	189

	309. Pruebas de Integración	189

	310. Pruebas End-to-End	190

	311. Pruebas del Sistema de IA	190

	312. Casos de Prueba	190

	313. Pruebas de Regresión	191

	314. Pruebas de Rendimiento	191

	315. Pruebas de Seguridad	191

	316. Pruebas de Usabilidad	191

	317. Validación de la Base de Conocimiento	192

	318. Validación del Grafo de Conocimiento	192

	319. Datos de Prueba	192

	320. Automatización	193

	321. Criterios de Aceptación	193

	322. Definition of Done	193

	323. Calidad Continua	193

	324. Requisitos de Calidad	194

	325. Evolución Futura	194

	FASE 22 — OBSERVABILIDAD, MONITOREO Y OPERACIÓN	196

	326. Objetivo	196

	326.1 Propósito	196

	326.2 Alcance	196

	327. Principios de Observabilidad	196

	328. Arquitectura de Observabilidad	196

	329. Logging	197

	330. Niveles de Registro	197

	331. Trazabilidad Distribuida	198

	332. Métricas Operacionales	198

	333. Métricas del Producto	198

	334. Métricas del Sistema de IA	199

	335. Dashboards	199

	336. Alertas	199

	337. Gestión de Incidentes	200

	338. Análisis Posterior (Postmortem)	200

	339. Disponibilidad del Servicio	200

	340. Observabilidad del Sistema de IA	200

	341. Capacidad Operacional	201

	342. Continuidad Operacional	201

	343. Requisitos de Observabilidad	201

	344. Evolución Futura	202

	FASE 23 — ESCALABILIDAD Y EVOLUCIÓN DE LA PLATAFORMA	203

	345. Objetivo	203

	345.1 Propósito	203

	345.2 Alcance	203

	346. Principios de Escalabilidad	203

	347. Estrategia General	203

	348. Escalabilidad Horizontal	204

	349. Escalabilidad Vertical	204

	350. Escalabilidad por Servicios	204

	351. Escalabilidad del Sistema de IA	205

	352. Escalabilidad de la Base de Datos	205

	353. Escalabilidad del Almacenamiento Multimedia	205

	354. Escalabilidad de la Base de Conocimiento	205

	355. Escalabilidad del Grafo de Conocimiento	206

	356. Procesamiento Distribuido	206

	357. Optimización de Recursos	206

	358. Optimización de Costos	206

	359. Evolución Funcional	207

	360. Compatibilidad Evolutiva	207

	361. Medición del Crecimiento	207

	362. Requisitos de Escalabilidad	207

	363. Evolución Futura	208

	FASE 24 — GOBIERNO TÉCNICO Y EVOLUCIÓN DEL PRODUCTO	210

	364. Objetivo	210

	364.1 Propósito	210

	364.2 Alcance	210

	365. Principios de Gobierno Técnico	210

	366. Arquitectura Viva	210

	367. Gestión de Versiones	211

	368. Versionado del Producto	211

	369. Versionado de la API	211

	370. Evolución del Modelo de Datos	212

	371. Evolución de la Base de Conocimiento	212

	372. Evolución del Grafo de Conocimiento	212

	373. Evolución del Sistema de IA	212

	374. Architecture Decision Records (ADR)	213

	375. Gestión de Cambios	213

	376. Deprecación	213

	377. Gestión de Deuda Técnica	213

	378. Revisión Arquitectónica	214

	379. Gestión Documental	214

	380. Indicadores de Gobierno	214

	381. Requisitos de Gobierno Técnico	215

	382. Evolución Futura	215

	**Fase ****2**  —  EXPERIENCIA DEL PRODUCTO

	**Fase ****4**  —  ARQUITECTURA Y REQUISITOS TÉCNICOS

	**Fase ****6**  —  ESTADOS DEL SISTEMA

	**Fase ****8**  —  SISTEMA CONVERSACIONAL

	**Fase ****10**  —  BASE DE CONOCIMIENTO

	**Fase ****12**  —  ESPECIFICACIÓN DEL SISTEMA DE INTELIGENCIA ARTIFICIAL

	**Fase ****14**  —  ESPECIFICACIÓN DE LA BASE DE DATOS

	**Fase ****16**  —  ESPECIFICACIÓN DEL FRONTEND

	**Fase ****18**  —  GRAFO DE CONOCIMIENTO (KNOWLEDGE GRAPH)

	**Fase ****20**  —  INFRAESTRUCTURA Y DESPLIEGUE

	**Fase ****22**  —  OBSERVABILIDAD, MONITOREO Y OPERACIÓN

	**Fase ****24**  —  GOBIERNO TÉCNICO Y EVOLUCIÓN DEL PRODUCTO

FASE 1 — FUNDAMENTOS

1.1 Propósito

La mayoría de las personas no posee conocimientos técnicos suficientes para interpretar síntomas mecánicos, evaluar la gravedad de una falla o comprender las posibles causas de un comportamiento anormal del vehículo. Como consecuencia, recurren a búsquedas genéricas en internet, foros, redes sociales o videos que entregan información contradictoria, poco personalizada y, en muchos casos, incorrecta.

En lugar de responder inmediatamente con una posible falla, el sistema investiga el problema, recopila evidencia, reduce la incertidumbre y finalmente presenta un informe estructurado con las causas más compatibles según la información disponible.

Su propósito es permitir que cualquier persona llegue mejor informada al momento de tomar una decisión.

La filosofía del producto puede resumirse en el siguiente principio rector:

Cuando un usuario abre la aplicación normalmente ya sabe que existe un problema.

- Qué tan grave podría ser.

- Qué debería revisar primero.

- Qué posibles causas son compatibles con lo que está ocurriendo.

1.3 Rol de la Inteligencia Artificial

Es una herramienta que permite ejecutar el proceso de investigación.

Debe actuar como un investigador que recopila información antes de llegar a cualquier conclusión.

- Escuchar.

- Analizar la evidencia.

- Reducir incertidumbre.

Nunca debe asumir información que el usuario no haya proporcionado.

Los siguientes principios representan decisiones estratégicas del producto y no deben modificarse sin una evaluación formal.

CarPlus nunca debe presentarse como una herramienta capaz de diagnosticar un vehículo con certeza.

**PF-002 — La evidencia tiene prioridad sobre la confianza del modelo**

Toda conclusión debe estar respaldada por evidencia obtenida durante la investigación.

Cada pregunta realizada al usuario debe reducir la incertidumbre existente.

**PF-004 — La honestidad genera confianza**

Es preferible admitir incertidumbre antes que entregar una respuesta incorrecta con aparente seguridad.

Cada posible causa incluida en el informe debe contar con una explicación comprensible para una persona sin conocimientos de mecánica.

**PF-006 — La experiencia del usuario tiene prioridad sobre la complejidad técnica**

La complejidad debe permanecer oculta para el usuario.

Cada investigación constituye una oportunidad para ampliar la base de conocimiento de CarPlus.

**PF-008 — El conocimiento es el principal activo**

La base de conocimiento construida mediante investigaciones reales constituye el principal activo estratégico de CarPlus.

2.1 Nombre del Producto

2.2 Resumen Ejecutivo

En lugar de emitir un diagnóstico inmediato, la aplicación recopila información del vehículo, analiza los síntomas reportados por el usuario, identifica la evidencia disponible y genera un informe estructurado con las posibles causas compatibles, explicando el razonamiento detrás de cada una.

2.3 Problema

- No sabe describir correctamente el problema.

- No entiende qué componentes podrían estar involucrados.

- Depende completamente de la interpretación inicial de un taller.

Estas dificultades generan incertidumbre, ansiedad, pérdida de tiempo y, potencialmente, costos innecesarios.

Los avances recientes en inteligencia artificial permiten mantener conversaciones naturales capaces de adaptar preguntas al contexto del usuario.

CarPlus aprovecha esta oportunidad proponiendo un enfoque diferente:

Este enfoque permite generar informes más transparentes, fundamentados y comprensibles para el usuario.

CarPlus transforma conversaciones desordenadas sobre problemas mecánicos en investigaciones estructuradas respaldadas por evidencia.

2.6 Qué es CarPlus

- Un investigador automotriz impulsado por inteligencia artificial.

- Una herramienta de apoyo para comprender problemas mecánicos.

- Una plataforma que aprende continuamente a partir de casos reales.

**CarPlus**** no pretende:**

- Sustituir una inspección física.

- Emitir certificaciones técnicas.

- Asumir responsabilidad sobre decisiones mecánicas del usuario.

3.1 Visión

3.2 Misión

3.3 Objetivos de Largo Plazo

- Construir la base de conocimiento automotriz basada en casos reales más completa de la plataforma.

- Reducir la cantidad de preguntas necesarias para alcanzar un nivel adecuado de evidencia.

- Convertirse en la primera herramienta que un propietario consulte cuando detecte un comportamiento anormal en su vehículo.

CarPlus será exitoso cuando un usuario pueda abrir la aplicación, describir un problema de forma natural y recibir un informe claro, comprensible y útil que le permita comprender mejor la situación antes de acudir a un taller.

4. Target Users

El usuario principal de CarPlus es un propietario de un vehículo particular que posee pocos o ningún conocimiento de mecánica automotriz y desea comprender mejor un problema antes de acudir a un taller.

No espera reparar el automóvil por sí mismo. Su objetivo principal es entender qué podría estar ocurriendo para tomar una mejor decisión.

Aunque el MVP está diseñado para propietarios particulares, la plataforma podría extenderse en el futuro a otros perfiles de usuarios.

- Personas que evalúan la compra de un vehículo usado.

- Empresas de arriendo de automóviles.

- Compañías aseguradoras (mediante futuras integraciones).

4.3 Necesidades

- Comprender mejor el problema de su vehículo.

- Obtener explicaciones fáciles de entender.

- Llegar mejor preparado a un taller mecánico.

**Actualmente el usuario suele experimentar:**

- Explicaciones excesivamente técnicas.

- Dificultad para describir correctamente los síntomas.

4.5 Motivaciones

- Comprender qué está ocurriendo.

- Sentirse más preparado antes de acudir a un taller.

- Entender las posibles causas del problema mediante explicaciones claras y fundamentadas.

Los principales escenarios en los que un usuario utilizará CarPlus incluyen:

- Encendido de un testigo en el tablero.

- Comportamientos inusuales del motor, transmisión, frenos o suspensión.

FASE 2 — EXPERIENCIA DEL PRODUCTO

**Introducción**

Las siguientes personas representan los perfiles principales para los cuales se diseña el producto durante el MVP.

**Información General**

Edad: 34 años

Vehículo: Toyota Corolla 2018

Uso del vehículo: Diario

Carlos utiliza su automóvil para ir al trabajo y transportar a su familia.

Cuando ocurre una falla busca respuestas en Google o pregunta a familiares, obteniendo respuestas diferentes que aumentan su incertidumbre.

- Comprender qué podría estar ocurriendo.

- Llegar preparado al taller.

**Frustraciones**

- Siente que internet entrega demasiadas respuestas distintas.

- Tiene miedo de que el taller le cobre por reparaciones innecesarias.

- Explicaciones simples.

- Sentir que la aplicación realmente entiende su problema.

Persona 2 — Comprador de Vehículos Usados (Futuro)

Nombre: Daniela Morales

Profesión: Arquitecta

**Contexto**

Durante la revisión observa algunos comportamientos extraños y desea comprender si podrían indicar un problema importante.

- Identificar posibles señales de alerta.

- Tomar una mejor decisión antes de comprar.

Esta persona representa una futura expansión del producto y no forma parte del MVP.

**Información General**

Edad: 25 años

**Contexto**

Aunque posee conocimientos básicos, utiliza CarPlus para organizar la información de un problema y validar sus hipótesis.

- Obtener una segunda opinión.

- Confirmar posibles causas.

Aunque posee mayor conocimiento técnico, la aplicación mantiene el mismo lenguaje claro utilizado para todos los usuarios.

**Objetivo**

Etapa 1 — Descubrimiento

**Ejemplos:**

- Aparece humo.

- Percibe una vibración.

En este momento el usuario posee muy poca información y un alto nivel de incertidumbre.

Quiere comprender qué podría estar ocurriendo.

El usuario abre la aplicación.

**Datos mínimos:**

- Modelo

**Datos opcionales:**

- Kilometraje

Etapa 3 — Investigación

**El usuario puede:**

- responder botones sugeridos;

- adjuntar videos;

Durante toda la conversación el Motor de Investigación identifica:

- información faltante;

- evidencia disponible.

Etapa 4 — Decisión

**El usuario puede:**

- Continuar investigando.

Etapa 5 — Generación del Informe

**El informe incluye:**

- explicación;

- nivel de urgencia;

- sugerencias de revisión;

Etapa 6 — Después del Informe

En futuras versiones el usuario podrá confirmar posteriormente cuál fue la reparación realizada.

7. Core Features

**Objetivo**

**Inputs**

- Modelo

- Motor (opcional)

**Outputs**

**Flujo**

**↓**

**↓**

**↓**

**Estados**

- Datos válidos.

**Casos borde**

Año inválido.

**Prioridad**

**CF-002 Investigación Conversacional**

Recopilar información suficiente para reducir la incertidumbre del problema.

Texto.

Fotos.

Audio.

Variables estructuradas del caso.

Evidencia.

Usuario responde.

Motor analiza.

Detecta incertidumbre.

Selecciona mejor pregunta.

Actualiza hipótesis.

Repite.

Investigando.

Procesando evidencia.

**Casos borde**

Usuario responde información contradictoria.

Usuario adjunta archivos irrelevantes.

Must

**Objetivo**

**Contenido**

Explicación.

Costos aproximados.

**Botón:**

**Estados**

Disponible.

**Casos borde**

Hipótesis incompatibles.

**Prioridad**

**CF-004 Gestión de Casos (Base para futuras versiones)**

Guardar toda la investigación realizada.

Vehículo.

Conversación.

Informe.

Resultado confirmado (futuro).

Should

8. UX Requirements

La experiencia de usuario debe diseñarse siguiendo los siguientes principios rectores:

- Claridad.

- Lenguaje cotidiano.

Flujo de Pantallas

**↓**

**↓**

**Feedback**

- qué está haciendo la aplicación;

- cuándo está analizando información;

**Estados Vacíos**

No existen vehículos registrados.

**Estados de Carga**

Analizando información.

Nunca deben bloquear completamente la interfaz más tiempo del necesario. Si un proceso tarda, se debe comunicar claramente al usuario qué está ocurriendo.

**Los errores deben:**

- indicar cómo resolverlo;

- no responsabilizar al usuario.

Incorrecto: Error 503.

**Microinteracciones**

- Confirmación al registrar el vehículo.

- Animación al agregar archivos multimedia.

- Confirmación al iniciar el análisis.

*— Fin de la Fase 2 —*

FASE 3 — SISTEMA DE INTELIGENCIA

9. Inteligencia Artificial del Producto

9.1 Objetivo de la IA

La inteligencia artificial constituye el núcleo operativo del proceso de investigación de CarPlus. Su función es coordinar la recopilación, interpretación y análisis de la evidencia disponible para apoyar la toma de decisiones del usuario.

Su objetivo no es identificar automáticamente una falla mecánica, sino recopilar información relevante, organizar la evidencia disponible y generar un informe fundamentado que ayude al usuario a comprender mejor la situación de su vehículo.

La IA debe comportarse como un investigador técnico: formula preguntas, recopila evidencia, actualiza hipótesis y explica sus conclusiones, evitando entregar respuestas apresuradas.

Su responsabilidad principal consiste en reducir la incertidumbre del usuario mediante un proceso estructurado de investigación.

9.2 Rol dentro del producto

La IA participa durante todo el proceso de investigación.

**Sus funciones incluyen:**

- Interpretar el problema descrito por el usuario.

- Analizar texto, imágenes, audio y video cuando estén disponibles.

- Detectar información relevante.

- Identificar información faltante.

- Generar hipótesis iniciales.

- Seleccionar la siguiente pregunta.

- Actualizar continuamente las hipótesis.

- Generar el informe final.

La IA no controla la aplicación.

Forma parte de un sistema compuesto por múltiples módulos especializados.

9.3 Información que recibe

Durante una investigación la IA puede recibir información proveniente de distintas fuentes.

**Datos del vehículo**

- Marca.

- Modelo.

- Año.

- Motor (opcional).

- Kilometraje (opcional).

**Información entregada por el usuario**

- Descripción libre del problema.

- Respuestas a preguntas.

- Selección de botones sugeridos.

**Evidencia multimedia**

- Fotografías.

- Videos.

- Audio.

**Información estructurada generada por el sistema**

- Variables detectadas.

- Hipótesis actuales.

- Evidencia recopilada.

- Historial de preguntas.

- Información pendiente.

9.4 Información que entrega

Al finalizar una investigación la IA genera un informe estructurado compuesto por:

- Posibles causas.

- Explicación.

- Compatibilidad con la evidencia.

- Nivel de urgencia.

- Costos aproximados.

- Recomendaciones iniciales.

- Explicación simplificada.

9.5 Qué nunca debe hacer

**La IA nunca debe:**

- afirmar que encontró la falla con certeza;

- inventar información que el usuario no entregó;

- ignorar evidencia contradictoria;

- ocultar incertidumbre;

- recomendar reparaciones peligrosas sin suficiente evidencia;

- reemplazar la evaluación de un profesional.

10. Motor de Investigación

10.1 Objetivo

El Motor de Investigación es el componente encargado de planificar y dirigir la conversación con el usuario de forma dinámica, priorizando siempre la obtención de evidencia útil.

Su misión consiste en obtener la mayor cantidad posible de información útil realizando la menor cantidad posible de preguntas.

10.2 Filosofía

El motor no sigue árboles de decisión predefinidos.

Cada investigación es dinámica.

Cada pregunta depende exclusivamente del estado actual del caso.

10.3 Principio central

Todo el proceso de investigación se rige por un principio rector:

Cada pregunta debe reducir la incertidumbre del caso.

Si una pregunta no modifica significativamente el conocimiento disponible, no debe realizarse.

10.4 Funcionamiento

Durante toda la conversación el motor mantiene dos conjuntos de información.

**Información conocida**

Todo aquello que ya fue confirmado durante la investigación.

**Ejemplos:**

- aparece únicamente con el motor caliente;

- ocurre al girar hacia la izquierda;

- existe pérdida de potencia.

**Información faltante**

Todo aquello cuya respuesta permitiría reducir significativamente la incertidumbre.

**Ejemplos:**

- velocidad.

- temperatura.

- frecuencia.

- duración.

- intensidad.

- ubicación del ruido.

10.5 Ciclo de investigación

La investigación sigue continuamente el siguiente ciclo.

**Información conocida**

**↓**

Generación de hipótesis

**↓**

Detección de incertidumbre

**↓**

Selección de la mejor pregunta

**↓**

Nueva evidencia

**↓**

Actualización de hipótesis

**↓**

Repetición

El proceso termina únicamente cuando el usuario decide analizar la información disponible.

10.6 Variables de Investigación

El motor trabaja utilizando variables estandarizadas.

Estas variables permiten comparar casos entre distintos vehículos.

**Variables generales**

- Momento.

- Intensidad.

- Frecuencia.

- Duración.

- Temperatura.

- Velocidad.

- Condiciones ambientales.

**Variables específicas**

Dependen del síntoma.

**Ejemplos:**

**Ruidos**

- tipo;

- ritmo;

- ubicación;

- lado;

- frecuencia.

**Humo**

- color;

- olor;

- cantidad;

- momento de aparición.

**Vibraciones**

- intensidad;

- velocidad;

- frecuencia;

- ubicación.

Nuevos tipos de variables podrán incorporarse sin modificar el funcionamiento general del motor.

11. Motor de Decisión

11.1 Objetivo

Determinar el momento adecuado para finalizar la investigación y generar el informe.

11.2 Responsabilidades

**El motor evalúa continuamente:**

- cantidad de evidencia;

- calidad de la evidencia;

- incertidumbre restante;

- consistencia entre respuestas;

- utilidad esperada de nuevas preguntas.

11.3 Principio

La investigación no finaliza por cantidad de preguntas.

Finaliza cuando preguntas adicionales probablemente aportarán poca información nueva.

11.4 Control del usuario

Aunque el sistema considere suficiente la evidencia disponible, el usuario mantiene siempre el control.

**Puede:**

- analizar inmediatamente;

- continuar investigando.

12. Sistema de Aprendizaje

12.1 Objetivo

Permitir que CarPlus evolucione continuamente mediante el aprendizaje derivado de casos reales y resultados confirmados.

12.2 Unidad de aprendizaje

CarPlus no aprende de conversaciones.

Aprende de casos.

Cada investigación constituye una nueva unidad de conocimiento.

12.3 Ciclo de un caso

Caso creado

**↓**

**Investigación**

**↓**

Informe generado

**↓**

Esperando confirmación

**↓**

Resultado confirmado

**↓**

Validación estadística

**↓**

Incorporación al conocimiento

Este diagrama es una simplificación desde la perspectiva del aprendizaje. "Investigación" e "Informe generado" pueden repetirse varias veces dentro de un mismo caso —el usuario puede continuar investigando el mismo problema y generar nuevas versiones del informe (ver RI-009, Fase 7)— antes de que el caso avance a "Esperando confirmación". La máquina de estados oficial y completa se define en la Fase 6, sección 29.

12.4 Información almacenada

**Cada caso incluye:**

- vehículo;

- problema;

- conversación;

- variables;

- evidencia;

- hipótesis;

- informe;

- reparación confirmada (cuando exista);

- costos;

- ubicación geográfica.

12.5 Calidad del caso

No todos los casos tienen el mismo valor.

Cada caso posee un índice interno de calidad.

**Factores considerados:**

- calidad del texto;

- fotografías;

- videos;

- audio;

- resultado confirmado;

- factura del taller;

- coincidencia con otros casos.

12.6 Aprendizaje de errores

El sistema no aprende únicamente de los aciertos.

También aprende cuando una hipótesis resulta incorrecta.

Esto permite reducir futuros errores y mejorar el proceso de investigación.

12.7 Historial

La información nunca debe sobrescribirse.

Cada actualización debe conservar el historial completo del caso.

**Esto permite:**

- auditoría;

- entrenamiento futuro;

- trazabilidad;

- análisis estadístico.

13. Base de Conocimiento

13.1 Objetivo

La Base de Conocimiento constituye el principal activo estratégico de CarPlus, ya que preserva el conocimiento acumulado independientemente del modelo de IA utilizado.

Su función consiste en almacenar el conocimiento acumulado proveniente de investigaciones reales y casos confirmados.

13.2 Principio

Los modelos de inteligencia artificial pueden cambiar con el tiempo.

La Base de Conocimiento permanece.

El verdadero valor de CarPlus reside en la calidad y cantidad de casos acumulados.

13.3 Contenido

La Base de Conocimiento podrá almacenar, entre otros elementos:

- Casos históricos.

- Variables de investigación.

- Patrones recurrentes.

- Hipótesis frecuentes.

- Resultados confirmados.

- Relaciones entre síntomas y posibles causas.

13.4 Evolución

La Base de Conocimiento debe diseñarse para crecer continuamente sin depender de un modelo específico de IA.

Esto permitirá reemplazar o actualizar modelos de lenguaje en el futuro sin perder el conocimiento adquirido.

14. Principios de Responsabilidad

14.1 Transparencia

CarPlus debe comunicar claramente que las conclusiones presentadas corresponden a una investigación basada en la evidencia disponible y no constituyen un diagnóstico definitivo.

14.2 Incertidumbre

Cuando la información sea insuficiente, el sistema deberá indicarlo explícitamente.

Nunca deberá ocultar la falta de evidencia mediante respuestas excesivamente seguras.

14.3 Explicabilidad

Toda conclusión presentada al usuario deberá incluir una explicación comprensible que permita entender por qué esa posible causa aparece en el informe.

14.4 Seguridad

Si durante una investigación se detectan síntomas compatibles con una falla potencialmente peligrosa, el informe deberá priorizar la seguridad del usuario e indicar que el vehículo debe ser revisado por un profesional antes de continuar utilizándolo.

*— Fin fase 3 —*

FASE 4 — ARQUITECTURA Y REQUISITOS TÉCNICOS

15. Arquitectura Lógica

15.1 Objetivo

La arquitectura de CarPlus debe diseñarse bajo principios de modularidad, escalabilidad y bajo acoplamiento, permitiendo evolucionar el producto y sustituir tecnologías o modelos de IA sin afectar el funcionamiento del resto del sistema.

Cada componente debe tener una responsabilidad claramente definida para facilitar el mantenimiento, la evolución del producto y el reemplazo de tecnologías sin afectar el resto del sistema.

15.2 Componentes principales

La arquitectura lógica está compuesta por los siguientes módulos:

Aplicación Móvil

**↓**

Backend

**↓**

Gestor de Casos

**↓**

Motor de Investigación

**↓**

Motor de Decisión

**↓**

**Base de Conocimiento**

**↓**

Sistema de Aprendizaje

**↓**

Modelo de Inteligencia Artificial

Cada componente cumple una función específica y se comunica mediante interfaces claramente definidas.

La relación de extremo a extremo entre clientes, acceso al dominio, investigación, conocimiento, persistencia y capacidades transversales se representa en la Figura de arquitectura 01.

Figura de arquitectura 01. Arquitectura general

**Descripción técnica. **La aplicación móvil y web accede por el API Gateway. El backend coordina servicios de usuarios, vehículos, casos, conversación y evidencia. El Sistema Conversacional, el Motor de Investigación, el Motor de Decisión y el Sistema de IA interpretan evidencia y reducen incertidumbre. El Generador de Informes produce el resultado; la Base de Conocimiento, el Grafo de Conocimiento y el Sistema de Aprendizaje preservan la evolución del producto.

15.3 Aplicación Móvil (Frontend)

La aplicación móvil representa el punto de interacción principal entre el usuario y CarPlus. Su responsabilidad es ofrecer una experiencia clara, intuitiva y consistente, delegando toda la lógica de negocio al backend.

**Responsabilidades**

- Registrar información del vehículo.

- Gestionar la conversación con el usuario.

- Permitir adjuntar evidencia multimedia.

- Mostrar el estado de la investigación.

- Presentar el informe final.

- Mostrar el historial de investigaciones (versiones futuras).

El frontend no contiene lógica de investigación ni toma decisiones sobre el contenido del informe.

15.4 Backend

El backend actúa como la capa de orquestación del sistema, coordinando la comunicación entre el frontend, los servicios internos y los componentes de inteligencia.

**Responsabilidades**

- Autenticar solicitudes.

- Crear casos.

- Almacenar información.

- Gestionar archivos multimedia.

- Orquestar el flujo de investigación.

- Solicitar análisis a los motores correspondientes.

- Generar respuestas para el frontend.

El backend no debe contener reglas específicas del proceso de investigación.

15.5 Gestor de Casos

Cada investigación corresponde a un caso independiente.

El Gestor de Casos es responsable de administrar su ciclo de vida.

**Responsabilidades**

- Crear nuevos casos.

- Actualizar información.

- Registrar evidencia.

- Mantener historial.

- Cambiar estados del caso.

- Asociar resultados confirmados (futuro).

15.6 Motor de Investigación

Responsable de dirigir la conversación.

**Funciones:**

- Analizar información disponible.

- Detectar incertidumbre.

- Seleccionar la siguiente pregunta.

- Actualizar hipótesis.

- Solicitar evidencia adicional cuando sea necesario.

No genera el informe final.

15.7 Motor de Decisión

Determina cuándo la investigación posee evidencia suficiente para generar un informe.

No decide qué hipótesis son correctas.

Su función consiste en evaluar la calidad de la información recopilada.

15.8 Base de Conocimiento

Almacena el conocimiento acumulado del sistema.

Debe ser independiente del modelo de IA utilizado.

15.9 Sistema de Aprendizaje

Actualiza la Base de Conocimiento utilizando resultados confirmados.

Su funcionamiento no afecta directamente las investigaciones en curso.

15.10 Modelo de IA

El modelo de lenguaje constituye únicamente un componente del sistema.

Debe poder reemplazarse sin modificar el resto de la arquitectura.

**Ejemplos:**

- GPT

- Claude

- Gemini

- futuros modelos

La arquitectura nunca debe depender de capacidades exclusivas de un proveedor específico.

El mapa consolidado de responsabilidades de interacción, dominio del caso, inteligencia, conocimiento y salida se muestra en la Figura de arquitectura 10.

Figura de arquitectura 10. Componentes del sistema

**Descripción técnica. **El mapa distingue interacción, dominio, inteligencia, conocimiento y salida. El Sistema Conversacional y el Servicio de Conversación administran el diálogo; el Gestor de Casos y el Sistema de Evidencia mantienen ciclo de vida y trazabilidad; el Motor de Investigación, el Motor de Decisión y el Sistema de IA procesan variables e hipótesis; la Base de Conocimiento, el Grafo de Conocimiento y el Sistema de Aprendizaje preservan conocimiento; el Generador de Informes produce informes versionados.

16. Functional Requirements

**Introducción**

Los siguientes requisitos funcionales definen el comportamiento que el sistema debe cumplir para satisfacer los objetivos del producto y servir como base para el desarrollo, las pruebas y la validación.

Cada requisito posee un identificador único para facilitar su trazabilidad durante el desarrollo.

**Registro del vehículo**

**FR-001**

El sistema deberá permitir registrar la información básica del vehículo antes de iniciar una investigación.

**FR-002**

El sistema deberá validar que los campos obligatorios hayan sido completados.

**FR-003**

El sistema deberá asociar el vehículo al caso creado.

**Investigación**

**FR-004**

El sistema deberá permitir al usuario describir libremente el problema.

**FR-005**

El sistema deberá combinar entrada mediante texto libre y botones sugeridos.

**FR-006**

El sistema deberá permitir adjuntar fotografías durante la investigación.

**FR-007**

El sistema deberá permitir adjuntar videos durante la investigación.

**FR-008**

El sistema deberá permitir adjuntar archivos de audio durante la investigación.

**FR-009**

El sistema deberá registrar todas las respuestas entregadas por el usuario.

**FR-010**

El sistema deberá mantener el contexto completo durante toda la investigación.

**FR-011**

El sistema deberá adaptar las preguntas según la información ya recopilada.

**FR-012**

El sistema nunca deberá repetir preguntas cuya respuesta ya haya sido obtenida.

Análisis

**FR-013**

El sistema deberá permitir al usuario decidir cuándo generar el informe.

**FR-014**

El sistema podrá sugerir iniciar el análisis cuando considere suficiente la evidencia disponible.

**FR-015**

El usuario podrá continuar investigando incluso después de recibir dicha sugerencia.

**Informe**

**FR-016**

El sistema deberá generar un informe estructurado.

**FR-017**

El informe deberá incluir posibles causas compatibles con la evidencia.

**FR-018**

Cada posible causa deberá incluir una explicación.

**FR-019**

El informe deberá indicar el nivel de urgencia.

**FR-020**

El informe deberá incluir costos aproximados cuando exista información suficiente.

**FR-021**

El informe deberá incluir recomendaciones iniciales.

**FR-022**

El informe deberá ofrecer una explicación simplificada mediante la opción "Explícamelo fácil".

Casos

**FR-023**

Cada investigación deberá almacenarse como un caso independiente.

**FR-024**

Cada caso deberá conservar su historial completo.

**FR-025**

La información histórica nunca deberá sobrescribirse.

17. Non-Functional Requirements

**Rendimiento**

**NFR-001**

La interfaz deberá responder de forma fluida durante toda la investigación.

**NFR-002**

La generación del informe deberá completarse en un tiempo razonable para mantener una buena experiencia de usuario.

**Escalabilidad**

**NFR-003**

La arquitectura deberá permitir incorporar nuevos tipos de evidencia sin rediseñar el sistema.

**NFR-004**

La arquitectura deberá soportar la incorporación de nuevos modelos de IA.

**Disponibilidad**

**NFR-005**

La indisponibilidad temporal de un servicio no deberá provocar pérdida de información del caso.

**Seguridad**

**NFR-006**

Toda comunicación deberá realizarse mediante conexiones seguras.

**NFR-007**

La información de los usuarios deberá almacenarse de forma protegida.

**Privacidad**

**NFR-008**

Los datos recopilados durante una investigación deberán utilizarse únicamente para los fines definidos por el producto y conforme a la política de privacidad aplicable.

**Compatibilidad**

**NFR-009**

El producto deberá estar disponible para dispositivos móviles compatibles con las plataformas objetivo definidas para el MVP.

**Accesibilidad**

**NFR-010**

La interfaz deberá utilizar lenguaje claro, elementos visuales comprensibles y tamaños adecuados para facilitar su uso por la mayor cantidad posible de usuarios.

18. Modelo de Datos (Conceptual)

**Objetivo**

Definir las principales entidades del sistema y sus relaciones, sin especificar aún la implementación de base de datos.

Entidad: Vehículo

Información básica utilizada para contextualizar cada investigación.

**Atributos**

- ID

- Marca

- Modelo

- Año

- Motor (opcional)

- Kilometraje (opcional)

Entidad: Caso

Representa una investigación completa.

**Atributos**

- ID

- Vehículo asociado

- Estado

- Fecha de creación

- Fecha de actualización

Entidad: Conversación

Contiene el historial completo de la investigación.

**Incluye**

- Mensajes del usuario

- Preguntas del sistema

- Botones seleccionados

- Respuestas libres

Entidad: Evidencia

Archivos aportados por el usuario.

**Tipos soportados:**

- Imagen

- Audio

- Video

Entidad: Hipótesis

Posibles causas generadas durante la investigación.

Cada hipótesis debe mantener su historial de evolución.

Entidad: Informe

Resultado generado al finalizar la investigación.

**Incluye:**

- Posibles causas

- Explicaciones

- Compatibilidad con la evidencia

- Urgencia

- Costos

- Recomendaciones

Entidad: Resultado Confirmado (Futuro)

Información validada posteriormente por el usuario o un taller.

Permitirá alimentar el Sistema de Aprendizaje.

19. Integraciones

**MVP**

Durante el MVP únicamente se consideran las integraciones necesarias para el funcionamiento de la aplicación.

No se han definido integraciones con servicios externos específicos.

Futuras Integraciones (Pendientes)

Durante las conversaciones del proyecto se mencionó la posibilidad de integrar el sistema con nuevos servicios en versiones futuras.

Estas integraciones aún no forman parte del alcance del MVP y deberán definirse posteriormente.

Conclusión de la Fase 4

Esta fase establece la estructura técnica del producto sin entrar en detalles de implementación.

**Quedan definidos:**

- la arquitectura lógica;

- las responsabilidades de cada componente;

- los requisitos funcionales;

- los requisitos no funcionales;

- el modelo conceptual de datos.

Con estos elementos, un equipo técnico puede comenzar a diseñar la solución de software respetando la visión y el comportamiento definidos en las fases anteriores.

FASE 5 — PLANIFICACIÓN DEL PRODUCTO

20. MVP (Minimum Viable Product)

20.1 Objetivo del MVP

El objetivo del MVP no es construir la versión definitiva de CarPlus, sino validar las hipótesis fundamentales del producto con el menor esfuerzo posible y obtener evidencia que guíe su evolución.

Su propósito consiste en validar que una investigación conversacional guiada por inteligencia artificial permite reducir la incertidumbre de los usuarios frente a un problema mecánico.

El MVP debe responder principalmente las siguientes preguntas:

- ¿Los usuarios comprenden el flujo de investigación?

- ¿Están dispuestos a responder preguntas antes de recibir un informe?

- ¿El informe les resulta útil?

- ¿La experiencia genera confianza?

- ¿La información obtenida es suficiente para producir investigaciones de calidad?

20.2 Funcionalidades Incluidas

**El MVP incluirá:**

**Registro del vehículo**

**Campos mínimos:**

- Marca

- Modelo

- Año

**Campos opcionales:**

- Motor

- Kilometraje

**Investigación conversacional**

**La investigación permitirá:**

- Texto libre.

- Botones sugeridos.

- Fotografías.

- Audio.

- Video.

La conversación será dirigida por el Motor de Investigación.

**Generación del informe**

**El informe incluirá:**

- Posibles causas.

- Explicación.

- Compatibilidad con la evidencia.

- Urgencia.

- Costos aproximados.

- Qué revisar primero.

- Botón "Explícamelo fácil".

**Creación de casos**

Cada investigación será almacenada como un caso independiente.

20.3 Funcionalidades Excluidas

Las siguientes funcionalidades fueron discutidas durante el diseño del producto, pero quedan fuera del MVP.

**Biblioteca de sonidos**

Inicialmente se consideró crear una biblioteca donde el usuario pudiera comparar sonidos de vehículos.

Posteriormente se decidió eliminar esta funcionalidad del MVP debido a su complejidad y a que no era necesaria para validar la propuesta de valor principal.

**Guías de inspección física**

También se discutió la posibilidad de que la IA guiara al usuario paso a paso para realizar inspecciones mecánicas.

Esta funcionalidad fue pospuesta para versiones futuras.

**Aprendizaje automático basado en resultados confirmados**

La arquitectura del MVP considera el Sistema de Aprendizaje.

Sin embargo, el aprendizaje continuo no formará parte de la primera versión pública.

**Historial avanzado de casos**

Cada caso será almacenado.

Sin embargo, la administración completa del historial queda fuera del MVP.

**Confirmación del resultado del taller**

El usuario aún no podrá confirmar cuál fue la reparación realizada.

Esta funcionalidad se desarrollará posteriormente.

20.4 Criterios de Éxito del MVP

**El MVP será considerado exitoso si logra demostrar que:**

- Los usuarios completan investigaciones.

- Comprenden el informe.

- Consideran útil la información entregada.

- La experiencia genera confianza.

- La duración promedio de una investigación resulta aceptable.

21. Roadmap

**Principios**

El desarrollo de CarPlus seguirá una estrategia iterativa e incremental, donde cada versión validará hipótesis específicas antes de ampliar el alcance del producto.

Cada versión deberá validar hipótesis concretas antes de incorporar nuevas funcionalidades.

Versión 1 — MVP

Objetivo: Validar el proceso de investigación conversacional.

**Incluye:**

- Registro del vehículo.

- Investigación.

- Informe.

- Gestión básica de casos.

Versión 2

Objetivo: Incrementar la calidad de las investigaciones.

**Posibles incorporaciones discutidas:**

- Confirmación del resultado del taller.

- Aprendizaje mediante casos confirmados.

- Mejora del Motor de Investigación.

- Evolución de la Base de Conocimiento.

Versión 3

Objetivo: Expandir el alcance del producto.

**Posibles incorporaciones:**

- Guías inteligentes de inspección.

- Herramientas para compradores de vehículos usados.

- Funciones para talleres.

- Funciones para flotas.

**Evolución continua**

Todas las funcionalidades incorporadas en futuras versiones deberán respetar los principios establecidos en la Filosofía del Producto, preservando la coherencia estratégica de CarPlus.

Ninguna mejora futura podrá comprometer la transparencia, la explicabilidad o el enfoque basado en evidencia.

22. Riesgos

**Riesgos Técnicos**

**Dependencia de modelos de IA**

La calidad de la investigación dependerá parcialmente del modelo de lenguaje utilizado.

Mitigación: Diseñar una arquitectura independiente del proveedor.

**Calidad de la evidencia**

Los usuarios podrían entregar información incompleta o incorrecta.

Mitigación: El Motor de Investigación deberá detectar incertidumbre y solicitar información adicional cuando sea necesario.

**Escalabilidad**

El crecimiento de la Base de Conocimiento podría aumentar la complejidad del sistema.

Mitigación: Arquitectura modular y almacenamiento desacoplado.

**Riesgos de Producto**

**Usuarios que esperan un diagnóstico definitivo**

Existe el riesgo de que algunos usuarios interpreten el informe como un diagnóstico profesional.

Mitigación: Comunicar claramente el propósito de la aplicación y utilizar un lenguaje consistente en toda la experiencia.

**Abandono durante la investigación**

Si la conversación es demasiado larga o repetitiva, algunos usuarios podrían abandonarla.

Mitigación: El Motor de Investigación deberá minimizar la cantidad de preguntas necesarias.

**Riesgos Legales**

CarPlus no debe presentarse como sustituto de un diagnóstico profesional.

La aplicación deberá comunicar claramente sus limitaciones y evitar afirmaciones que puedan interpretarse como garantías técnicas.

**Riesgos de UX**

Una interfaz compleja podría disminuir la confianza del usuario.

Mitigación: Mantener una experiencia simple, guiada y con lenguaje cotidiano.

**Riesgos relacionados con IA**

La IA puede generar hipótesis incorrectas o interpretar erróneamente la información proporcionada.

**Mitigación:**

- Priorizar evidencia sobre confianza del modelo.

- Mostrar incertidumbre cuando corresponda.

- Explicar siempre el razonamiento detrás del informe.

23. Métricas

**North Star ****Metric**

Porcentaje de investigaciones completadas que los usuarios consideran útiles para comprender el problema de su vehículo.

Esta métrica representa directamente el propósito principal de CarPlus: reducir la incertidumbre del usuario.

**KPIs**** Principales**

**Uso**

- Investigaciones iniciadas.

- Investigaciones completadas.

- Tiempo promedio de investigación.

- Cantidad promedio de preguntas.

**Calidad**

- Casos con resultado confirmado.

- Casos reutilizables para aprendizaje.

- Calidad promedio de los casos.

**Experiencia**

- Satisfacción del usuario.

- Comprensión del informe.

- Uso del botón "Explícamelo fácil".

**Retención**

- Usuarios que vuelven a utilizar CarPlus.

- Número promedio de investigaciones por usuario.

**Métricas futuras**

Una vez implementado el Sistema de Aprendizaje podrán incorporarse métricas adicionales relacionadas con la evolución del conocimiento del sistema y la mejora del proceso de investigación.

24. Preguntas Abiertas

Las siguientes decisiones aún no han sido definidas y deberán resolverse durante el desarrollo del producto.

**Producto**

- ¿Será necesario crear cuentas de usuario en el MVP?

- ¿Cómo se administrarán múltiples vehículos por usuario?

- ¿Qué nivel de personalización tendrá el informe?

Inteligencia Artificial

- ¿Cómo se combinarán exactamente el Motor de Investigación y el modelo de lenguaje?

- ¿Qué información se almacenará como contexto permanente?

- ¿Qué estrategia se utilizará para versionar la Base de Conocimiento?

**Tecnología**

- ¿Qué proveedor de IA se utilizará inicialmente?

- ¿Cómo se almacenarán los archivos multimedia?

- ¿Qué infraestructura soportará el crecimiento del sistema?

**Negocio**

- ¿Cuál será el modelo definitivo de monetización?

- ¿Cuándo se incorporará publicidad contextual?

- ¿Existirá una versión premium en el futuro?

25. Anexo — Decisiones de Producto

Esta sección consolida las principales decisiones estratégicas adoptadas durante el diseño del producto y sirve como referencia para mantener la coherencia en futuras iteraciones.

**Filosofía**

- La IA investiga, no diagnostica.

- El objetivo del producto es reducir incertidumbre.

- La evidencia tiene prioridad sobre la confianza del modelo.

- Cada pregunta debe aportar información útil.

- La experiencia del usuario tiene prioridad sobre la complejidad técnica.

- La Base de Conocimiento constituye el principal activo estratégico de CarPlus.

**Investigación**

- No utilizar árboles de preguntas fijos.

- Utilizar un Motor de Reducción de Incertidumbre.

- La conversación debe adaptarse dinámicamente al caso.

- El usuario decide cuándo analizar.

**Informe**

- No mostrar porcentajes de confianza.

- Utilizar niveles de compatibilidad con la evidencia.

- Incluir explicaciones claras para cada posible causa.

- Incorporar un botón "Explícamelo fácil".

**Arquitectura**

- El modelo de IA debe ser reemplazable.

- La Base de Conocimiento debe ser independiente del modelo.

- Cada investigación corresponde a un caso.

- Nunca sobrescribir información histórica.

*— Fin del PRD —*

Versión: 1.0 (Draft)

Estado: En desarrollo

FASE 6 — ESTADOS DEL SISTEMA

26. Estados del Sistema

26.1 Objetivo

Esta fase define el ciclo de vida completo de una investigación dentro de CarPlus, estableciendo un modelo de estados consistente que garantice un comportamiento predecible, auditable y escalable en todo el sistema.

Cada caso deberá encontrarse siempre en un único estado claramente definido.

Los estados permiten que todos los componentes del sistema (Frontend, Backend, Motor de Investigación, Motor de Decisión y Sistema de Aprendizaje) compartan una misma representación del progreso de una investigación.

26.2 Principios

El modelo de estados deberá cumplir los siguientes principios de diseño:

- Un caso solo puede encontrarse en un estado a la vez.

- Cada transición entre estados debe estar definida explícitamente.

- No deben existir transiciones implícitas.

- Todo cambio de estado deberá registrarse en el historial del caso.

- Los estados representan el progreso del caso, no el comportamiento interno de la IA.

27. Ciclo de Vida del Caso

**Definición de Caso**

Caso: investigación abierta sobre un único problema mecánico de un vehículo. Si el usuario desea investigar un problema distinto, deberá crear un nuevo caso. Si aporta nueva información relacionada con el mismo problema, la investigación continúa dentro del caso existente y genera nuevas versiones del informe cuando corresponda.

Todo caso deberá evolucionar siguiendo el siguiente flujo general de estados:

Caso Creado

**↓**

Investigando

**↓**

Esperando Respuesta

**↓**

Procesando Evidencia

**↓**

Listo para Analizar

**↓**

Analizando

**↓**

Informe Generado ⇄ Investigando

**↓**

Esperando Confirmación (futuro)

**↓**

Caso Confirmado (futuro)

**↓**

Archivado

Desde el estado Informe Generado, el caso puede retornar al estado Investigando si el usuario decide continuar investigando el mismo problema (ver Estado 7, sección 28, y Requisito RI-009 de la Fase 7). Cada retorno a Investigando que culmine en un nuevo análisis generará una nueva versión del informe, preservando siempre las versiones anteriores. El caso solo avanza hacia Esperando Confirmación/Archivado cuando el usuario decide finalizarlo definitivamente.

No todos los estados estarán presentes en el MVP, pero todos forman parte del diseño de largo plazo.

28. Definición de Estados

Estado 1 — Caso Creado

**Descripción**

El caso ha sido creado correctamente.

El usuario ya registró la información mínima del vehículo.

Todavía no existe una investigación.

Condiciones de entrada

- Marca registrada.

- Modelo registrado.

- Año registrado.

Condiciones de salida

El usuario comienza la investigación.

Acciones permitidas

- Editar información del vehículo.

- Eliminar caso.

- Iniciar investigación.

Acciones prohibidas

- Generar informe.

- Confirmar resultado.

Estado 2 — Investigando

**Descripción**

La investigación está activa.

La IA analiza continuamente la información disponible y formula nuevas preguntas.

Condiciones de entrada

El usuario inició la conversación.

Acciones permitidas

- Escribir mensajes.

- Seleccionar botones.

- Adjuntar imágenes.

- Adjuntar videos.

- Adjuntar audios.

- Editar información recientemente enviada (si aún no se ha generado el informe).

Condiciones de salida

El sistema necesita esperar una respuesta del usuario o procesar evidencia.

Estado 3 — Esperando Respuesta

**Descripción**

El sistema ya realizó una pregunta y espera información adicional.

No existe procesamiento activo.

**Objetivo**

Evitar generar nuevas preguntas mientras el usuario aún no responde.

Acciones permitidas

- Enviar respuesta.

- Adjuntar evidencia.

- Cancelar investigación.

Acciones prohibidas

- Generar nuevas preguntas automáticamente.

- Analizar información inexistente.

Estado 4 — Procesando Evidencia

**Descripción**

El sistema está analizando archivos multimedia enviados por el usuario.

**Puede tratarse de:**

- fotografías;

- videos;

- audio.

**Objetivo**

Extraer información relevante antes de continuar la conversación.

Acciones permitidas

- Mostrar progreso.

- Analizar evidencia.

- Actualizar variables.

Acciones prohibidas

- Generar informe.

- Solicitar nueva evidencia antes de finalizar el procesamiento actual.

Estado 5 — Listo para Analizar

**Descripción**

El Motor de Decisión considera que existe suficiente evidencia para generar un informe.

La decisión final continúa perteneciendo al usuario.

Acciones permitidas

- Analizar ahora.

- Continuar investigando.

Acciones prohibidas

Finalizar automáticamente la investigación.

Estado 6 — Analizando

**Descripción**

El sistema está consolidando toda la información disponible para construir el informe final.

**Durante este estado:**

- se revisan todas las hipótesis;

- se evalúa la evidencia;

- se determina la urgencia;

- se generan las explicaciones;

- se prepara el informe.

Acciones permitidas

Mostrar progreso del análisis.

Acciones prohibidas

Modificar información del caso.

Enviar nuevas preguntas.

La Figura 14 muestra la pantalla «Procesando investigación» en el contexto funcional descrito en esta sección.

Figura 14. Procesando investigación.

**Descripción UX. **Comunica que el sistema consolida evidencia, variables, contradicciones e hipótesis antes del informe. Utiliza etapas comprensibles y evita porcentajes de precisión o afirmaciones sobre una falla encontrada.

Estado 7 — Informe Generado

**Descripción**

El sistema generó y entregó un informe con la evidencia disponible hasta este punto. Esto no significa que el caso haya finalizado de forma definitiva: el usuario puede darlo por concluido o continuar aportando información sobre el mismo problema.

Acciones permitidas

- Leer informe.

- Compartir informe (futuro).

- Descargar informe (futuro).

- Solicitar una explicación simplificada.

- Continuar investigando el mismo problema dentro del mismo caso (retorna al estado Investigando; ver RI-009, Fase 7). Incluye responder nuevas preguntas, adjuntar nueva evidencia o describir nuevos síntomas relacionados con el mismo vehículo y problema.

- Finalizar definitivamente el caso.

- Iniciar una investigación nueva para un problema diferente (crea un nuevo caso, independiente del actual).

Acciones prohibidas

- Modificar, eliminar o sobrescribir cualquier versión de informe ya generada, la conversación previa, la evidencia registrada o el historial de hipótesis.

Nota de consistencia: "Iniciar una investigación nueva para un problema diferente" y "Continuar investigando el mismo problema dentro del mismo caso" son acciones distintas y ambas están permitidas. La primera abre un caso nuevo e independiente; la segunda reabre el caso actual y, si el usuario vuelve a analizar, culminará en una nueva versión del informe conforme a RI-009. La prohibición de esta sección se limita a la inmutabilidad del historial ya registrado, no a la posibilidad de continuar el caso.

Estado 8 — Esperando Confirmación (Futuro)

**Descripción**

El usuario aún no ha confirmado cuál fue la reparación realizada.

El caso permanece abierto únicamente para aprendizaje.

**Objetivo**

Permitir mejorar la Base de Conocimiento mediante información validada.

Estado 9 — Caso Confirmado (Futuro)

**Descripción**

El usuario confirmó cuál fue la reparación realizada.

El caso puede incorporarse al Sistema de Aprendizaje.

Acciones permitidas

- Actualizar Base de Conocimiento.

- Calcular calidad del caso.

- Incorporar nuevas relaciones estadísticas.

Estado 10 — Archivado

**Descripción**

El caso ya no admite modificaciones.

Toda su información permanece disponible únicamente para consulta y aprendizaje.

29. Transiciones Permitidas

La siguiente tabla constituye la referencia oficial para toda la máquina de estados del producto. Ninguna transición no listada aquí está permitida; toda transición debe registrarse conforme a los requisitos de auditoría de la sección 33.

| Estado origen | Estado destino | Condición |
| --- | --- | --- |
| Caso Creado | Investigando | El usuario inicia la investigación. |
| Investigando | Esperando Respuesta | El sistema formuló una pregunta y espera al usuario. |
| Investigando | Procesando Evidencia | El usuario adjuntó evidencia pendiente de análisis. |
| Esperando Respuesta | Investigando | El usuario respondió. |
| Procesando Evidencia | Investigando | Finalizó el análisis de la evidencia. |
| Investigando | Listo para Analizar | El Motor de Decisión detecta evidencia suficiente. |
| Listo para Analizar | Analizando | El usuario selecciona "Analizar ahora". |
| Listo para Analizar | Investigando | El usuario decide continuar investigando en vez de analizar. |
| Analizando | Informe Generado | El informe se generó correctamente. |
| Analizando | Listo para Analizar | Ocurrió un error durante el análisis (ver RC-006). |
| Informe Generado | Investigando | El usuario decide continuar investigando el mismo problema dentro del mismo caso (ver RI-009, Fase 7). |
| Informe Generado | Esperando Confirmación (futuro) | El usuario da por concluido el caso. |
| Esperando Confirmación (futuro) | Caso Confirmado (futuro) | El usuario confirma la reparación realizada. |
| Caso Confirmado (futuro) / Informe Generado | Archivado | El caso se archiva por inactividad o decisión del usuario. |

30. Eventos que Producen Cambios de Estado

Cada transición de estado deberá originarse únicamente a partir de un evento explícito, evitando cambios implícitos o inconsistentes.

**Eventos iniciados por el usuario**

- Crear caso.

- Iniciar investigación.

- Responder pregunta.

- Adjuntar evidencia.

- Seleccionar "Analizar ahora".

- Cancelar investigación.

- Continuar investigando tras un informe generado (RI-009).

- Confirmar reparación (futuro).

**Eventos iniciados por el sistema**

- Finalizar análisis multimedia.

- Detectar evidencia suficiente.

- Generar informe (primera versión o nuevas versiones subsiguientes cuando el caso continúa tras un informe previo).

- Validar resultado confirmado (futuro).

- Archivar caso.

La Figura 13 muestra la pantalla «Timeline de investigación» en el contexto funcional descrito en esta sección.

Figura 13. Timeline de investigación.

**Descripción UX. **Permite reconstruir la investigación mediante eventos cronológicos de conversación, evidencia, hipótesis y estado. La trazabilidad conserva fecha, evento y origen sin sobrescribir el historial.

31. Reglas de Consistencia

El sistema deberá garantizar las siguientes reglas de consistencia para preservar la integridad de cada investigación.

**RC-001**

Un caso solo puede encontrarse en un estado.

**RC-002**

No podrá existir un informe generado sin haber pasado previamente por el estado Analizando.

**RC-003**

No podrá iniciarse el análisis si no existe al menos una hipótesis activa.

**RC-004**

**Todo cambio de estado deberá registrarse con:**

- fecha;

- hora;

- estado anterior;

- estado nuevo;

- evento que originó el cambio.

**RC-005**

El historial de estados nunca podrá eliminarse ni sobrescribirse.

**RC-006**

Si ocurre un error inesperado durante el análisis, el caso deberá volver al estado Listo para Analizar, permitiendo al usuario intentar nuevamente sin perder información.

32. Manejo de Errores

El sistema deberá manejar fallos sin comprometer la integridad del caso.

**Error durante el procesamiento de evidencia**

**El sistema deberá:**

- conservar la evidencia ya recibida;

- informar el error al usuario;

- permitir reintentar el procesamiento.

**Error durante la generación del informe**

**El sistema deberá:**

- conservar toda la investigación;

- mantener las hipótesis calculadas;

- permitir reiniciar el análisis sin repetir la conversación.

**Error de comunicación**

**Si se pierde la conexión:**

- el caso conservará su último estado válido;

- el usuario podrá reanudar la investigación al recuperar la conexión.

33. Auditoría

Todos los cambios relevantes deberán quedar registrados.

**Cada registro incluirá:**

- Identificador del caso.

- Estado anterior.

- Estado nuevo.

- Fecha y hora.

- Evento que produjo el cambio.

- Componente responsable (Frontend, Backend, Motor de Investigación, Motor de Decisión o Sistema de Aprendizaje).

Este historial permitirá depuración, auditoría, análisis estadístico y futuras mejoras del sistema.

*— Fin de la Fase 6 —*

FASE 7 — ESPECIFICACIÓN DEL INFORME

34. Objetivo del Informe

34.1 Propósito

El informe constituye el principal entregable generado por CarPlus al finalizar una investigación. Su propósito es sintetizar la evidencia recopilada y presentarla de forma clara, comprensible y accionable para el usuario.

Su objetivo no consiste en entregar un diagnóstico definitivo, sino presentar de forma clara, organizada y comprensible las posibles causas compatibles con la evidencia recopilada durante la investigación.

**El informe debe permitir que el usuario:**

- Comprenda mejor el problema.

- Reduzca la incertidumbre.

- Conozca qué revisar primero.

- Evalúe el nivel de urgencia.

- Llegue mejor preparado a un taller.

34.2 Principios

Todo informe generado por CarPlus deberá respetar los siguientes principios de diseño y comunicación:

- Basarse exclusivamente en la evidencia recopilada.

- Explicar todas sus conclusiones.

- Comunicar la incertidumbre cuando exista.

- Priorizar claridad sobre complejidad técnica.

- Evitar lenguaje alarmista.

- No afirmar diagnósticos definitivos.

35. Estructura del Informe

Todos los informes deberán seguir una estructura uniforme para facilitar su interpretación y comparación entre casos.

Resumen General

**↓**

Nivel de Urgencia

**↓**

Posibles Causas

**↓**

Explicación de cada causa

**↓**

Evidencia considerada

**↓**

Qué revisar primero

**↓**

Costos aproximados

**↓**

Limitaciones de la investigación

**↓**

Botón "Explícamelo fácil"

Este orden no debe modificarse sin una decisión de diseño formal.

36. Resumen General

**Objetivo**

Entregar una visión rápida del resultado de la investigación.

**Debe responder en pocas líneas:**

- Qué parece estar ocurriendo.

- Qué tan confiable es la investigación.

- Qué debería hacer el usuario a continuación.

**Ejemplo:**

Según la evidencia recopilada, el comportamiento observado es compatible principalmente con un problema relacionado con el sistema de encendido. Sin embargo, existen otras posibles causas que requieren revisión física para ser descartadas.

37. Nivel de Urgencia

**Objetivo**

Comunicar la prioridad con la que el usuario debería revisar el vehículo.

CarPlus utilizará cuatro niveles.

Nivel 1 — Bajo

Descripción: No existe evidencia de una falla que represente un riesgo inmediato.

**Ejemplos**

- Ruidos leves.

- Vibraciones menores.

- Componentes con desgaste normal.

Nivel 2 — Moderado

Descripción: El vehículo probablemente puede seguir utilizándose, pero se recomienda una revisión próxima.

Nivel 3 — Alto

Descripción: Existe evidencia compatible con una falla que podría agravarse si el vehículo continúa utilizándose.

Nivel 4 — Crítico

Descripción: La información recopilada sugiere una posible condición de riesgo para la seguridad.

En este caso el informe deberá recomendar detener el uso del vehículo hasta ser inspeccionado por un profesional.

38. Posibles Causas

**Objetivo**

Presentar las hipótesis generadas durante la investigación.

**Orden**

Las hipótesis deberán ordenarse según su compatibilidad con la evidencia.

Nunca por popularidad.

Nunca por frecuencia histórica.

Nunca por confianza interna del modelo.

**Cantidad**

**El informe normalmente mostrará entre:**

- 3 y 5 posibles causas.

En investigaciones con evidencia insuficiente podrá mostrar menos.

Cada causa deberá incluir

- Nombre.

- Explicación.

- Compatibilidad con la evidencia.

- Evidencia que la respalda.

- Evidencia que la contradice (si existe).

39. Compatibilidad con la Evidencia

CarPlus no utilizará porcentajes de confianza, ya que estos pueden transmitir una precisión injustificada al usuario.

En su lugar utilizará niveles cualitativos.

**Muy Compatible**

La mayor parte de la evidencia recopilada coincide con esta hipótesis.

**Compatible**

Existe suficiente evidencia para considerarla una causa probable.

**Parcialmente Compatible**

Parte de la evidencia coincide, pero aún existen dudas importantes.

**Poco Compatible**

Existe evidencia limitada para respaldarla.

Se muestra únicamente porque aún no puede descartarse completamente.

**Sin Evidencia Suficiente**

No fue posible determinar qué tan compatible resulta esta hipótesis.

40. Explicación de las Hipótesis

Cada hipótesis deberá responder cuatro preguntas.

¿Qué es?

Descripción sencilla.

¿Por qué podría estar ocurriendo?

Relación con los síntomas observados.

¿Qué evidencia la respalda?

Información específica obtenida durante la investigación.

¿Qué información falta?

Variables que permitirían confirmar o descartar mejor esa hipótesis.

La Figura 12 muestra la pantalla «Detalle de hipótesis» en el contexto funcional descrito en esta sección.

Figura 12. Detalle de hipótesis.

**Descripción UX. **Explica por qué una hipótesis permanece activa y qué información puede fortalecerla o debilitarla. Mantiene una estructura estable para respaldo, contradicción e información faltante.

41. Evidencia Utilizada

El informe deberá mostrar qué información fue considerada.

**Por ejemplo:**

**Vehículo**

- Marca.

- Modelo.

- Año.

Síntomas

- Ruidos.

- Vibraciones.

- Humo.

- Pérdida de potencia.

Archivos

- Fotografías analizadas.

- Videos analizados.

- Audios analizados.

Variables identificadas

- Temperatura.

- Momento.

- Frecuencia.

- Intensidad.

Esto permite aumentar la transparencia del proceso.

La Figura 16 muestra la pantalla «Detalle del informe» en el contexto funcional descrito en esta sección.

Figura 16. Detalle del informe.

**Descripción UX. **Profundiza en una posible causa y en su relación con evidencia, explicación y próximos pasos. Las secciones son consistentes y muestran con el mismo peso documental la evidencia de respaldo y contradicción.

42. Qué Revisar Primero

El informe deberá priorizar acciones.

No reparaciones.

**Ejemplos:**

- Revisar nivel de aceite.

- Revisar correa de accesorios.

- Revisar bujías.

- Revisar sistema de refrigeración.

El objetivo consiste en orientar la inspección física.

43. Costos Aproximados

**Objetivo**

Entregar únicamente una referencia económica.

Nunca una cotización.

**Reglas**

**Cuando exista información suficiente podrán mostrarse:**

- rango aproximado;

- nivel relativo de costo;

- advertencia indicando que el costo depende del taller y la región.

**Si no existe información suficiente:**

El informe no deberá inventar valores.

44. Limitaciones del Informe

Todo informe deberá incluir una sección específica que comunique de forma transparente las limitaciones de la investigación realizada.

**Ejemplos:**

- La investigación se realizó únicamente con la información proporcionada.

- Algunas causas requieren inspección física.

- El informe no reemplaza un diagnóstico profesional.

- La ausencia de evidencia no implica ausencia de una falla.

45. Botón "Explícamelo Fácil"

**Objetivo**

Traducir el contenido técnico a lenguaje cotidiano.

**Principios**

No modificar conclusiones.

No ocultar incertidumbre.

No simplificar eliminando información importante.

**Ejemplo**

Versión técnica: Existe evidencia compatible con una posible falla en el sistema de encendido.

Versión simple: Es posible que una pieza encargada de producir la chispa del motor no esté funcionando correctamente.

46. Casos Especiales

**Evidencia insuficiente**

Si la investigación no permite generar hipótesis sólidas, el informe deberá indicarlo claramente.

No deberá inventar posibles causas únicamente para completar el informe.

**Evidencia contradictoria**

**Si existen respuestas incompatibles entre sí:**

El informe deberá explicar que algunas conclusiones poseen mayor incertidumbre.

**Múltiples problemas**

Si la investigación detecta indicios de más de un problema independiente:

El informe deberá separar claramente cada uno.

**Riesgo para la seguridad**

Si durante la investigación se detectan síntomas potencialmente peligrosos:

- la advertencia deberá aparecer al inicio del informe;

- tendrá prioridad visual sobre cualquier otra sección;

- el resto del informe seguirá mostrándose normalmente.

47. Requisitos del Informe

**RI-001**

Todo informe deberá contener al menos una hipótesis.

**RI-002**

Cada hipótesis deberá incluir una explicación.

**RI-003**

Toda conclusión deberá estar respaldada por evidencia.

**RI-004**

Nunca deberán mostrarse porcentajes de confianza.

**RI-005**

El informe deberá indicar el nivel de urgencia.

**RI-006**

El usuario deberá poder solicitar una explicación simplificada.

**RI-007**

El informe deberá mantener el mismo orden estructural en todos los casos.

**RI-008**

El informe deberá conservarse asociado al caso original.

**RI-009**

Una vez generado, el informe no podrá modificarse.

Si el usuario continúa investigando posteriormente, deberá generarse una nueva versión del informe, preservando la anterior para mantener la trazabilidad del caso.

48. Evolución del Informe

En versiones futuras podrán incorporarse nuevas funcionalidades como:

- Comparación entre informes de un mismo vehículo.

- Compartir el informe mediante un enlace.

- Exportación en PDF.

- Historial de versiones.

- Confirmación de la reparación realizada.

- Comentarios del taller sobre el informe.

Estas funcionalidades no forman parte del alcance del MVP.

*— Fin de la Fase 7 —*

La Figura 19 muestra la pantalla «Exportar / Compartir informe» en el contexto funcional descrito en esta sección.

Figura 19. Exportar / Compartir informe.

**Descripción UX. **Funcionalidad futura, fuera del MVP. Documenta exclusivamente la exportación en PDF y el uso de un enlace compartido; ambas opciones permanecen separadas del recorrido del MVP y conservan la inmutabilidad del informe.

FASE 8 — SISTEMA CONVERSACIONAL

49. Objetivo

49.1 Propósito

El Sistema Conversacional constituye el principal medio de interacción entre el usuario y el Motor de Investigación. Su diseño debe facilitar la recopilación de evidencia mediante una conversación estructurada, natural y eficiente.

Su objetivo consiste en obtener la mayor cantidad posible de información relevante mediante una conversación natural, clara y eficiente.

La conversación no busca mantener un diálogo humano.

Busca conducir una investigación.

49.2 Filosofía

La conversación debe comportarse como una entrevista técnica adaptativa, ajustando dinámicamente las preguntas según la información disponible y la incertidumbre restante.

No sigue un guion fijo.

Cada pregunta depende del estado actual del caso.

El sistema conversa para investigar, no para entretener.

50. Principios Conversacionales

Toda conversación deberá respetar los siguientes principios.

**PC-001 — Investigar antes de concluir**

Nunca generar conclusiones antes de reunir suficiente evidencia.

**PC-002 — Una pregunta, un objetivo**

Cada pregunta debe intentar obtener una única pieza de información.

Nunca combinar múltiples preguntas distintas en un mismo mensaje cuando puedan dificultar la respuesta.

Incorrecto: ¿Hace cuánto ocurre el ruido, en qué lado aparece y qué temperatura tenía el motor?

Correcto: ¿El ruido aparece con el motor frío o caliente?

**PC-003 — Evitar preguntas innecesarias**

El sistema nunca deberá preguntar información que ya conoce.

**PC-004 — Adaptarse al usuario**

La conversación deberá ajustarse al nivel de conocimiento del usuario.

Nunca asumir conocimientos mecánicos.

**PC-005 — Reducir incertidumbre**

Toda interacción debe aportar información útil para disminuir la incertidumbre del caso.

51. Inicio de la Conversación

Una vez registrado el vehículo, comienza la investigación.

**El primer mensaje debe tener tres objetivos:**

- reconocer el problema;

- invitar al usuario a describirlo libremente;

- transmitir que la investigación será guiada.

**Ejemplo:**

Cuéntame qué está ocurriendo con tu vehículo. Puedes describir el problema con tus propias palabras o adjuntar una foto, un video o un audio si crees que ayudará a entender mejor la situación.

52. Flujo Conversacional

La conversación sigue el siguiente ciclo.

Usuario entrega información

**↓**

Motor interpreta la información

**↓**

Actualiza variables conocidas

**↓**

Genera o actualiza hipótesis

**↓**

Detecta incertidumbre

**↓**

Selecciona la mejor pregunta

**↓**

Usuario responde

**↓**

Repetir

El sistema nunca debe saltarse este ciclo.

53. Tipos de Mensajes

El sistema utilizará distintos tipos de mensajes según el momento de la investigación.

**Solicitud de información**

Busca obtener nueva evidencia.

Ejemplo: ¿El ruido aparece únicamente cuando aceleras?

**Confirmación**

Resume información importante para asegurar que fue interpretada correctamente.

Ejemplo: Entonces el ruido solo aparece cuando el motor ya está caliente.

**Explicación**

Aclara por qué se está realizando una pregunta.

Ejemplo: Saber cuándo aparece el ruido ayuda a descartar varios componentes del motor.

**Solicitud de evidencia**

Invita al usuario a enviar archivos.

Ejemplo: Si puedes grabar el sonido del motor, probablemente podremos reducir mejor las posibles causas.

**Resumen parcial**

Resume el progreso de la investigación.

Ejemplo: Hasta ahora sabemos que el ruido aparece al girar hacia la izquierda y únicamente cuando el vehículo está en movimiento.

**Transición**

Informa que la investigación está próxima a finalizar.

Ejemplo: Ya contamos con suficiente información para generar un informe. Si lo deseas, aún podemos seguir investigando antes de analizar el caso.

54. Selección de Preguntas

Cada pregunta deberá cumplir al menos uno de los siguientes objetivos.

- Confirmar información.

- Descartar hipótesis.

- Fortalecer una hipótesis.

- Solicitar evidencia faltante.

- Resolver contradicciones.

Si una pregunta no cumple ninguno de estos objetivos, no debe realizarse.

55. Priorización de Preguntas

Cuando existan varias preguntas posibles, el sistema deberá seleccionar aquella con el mayor potencial para reducir la incertidumbre y mejorar la calidad de las hipótesis.

**El orden de prioridad será:**

- Resolver contradicciones.

- Obtener información crítica para la seguridad.

- Descartar hipótesis principales.

- Confirmar hipótesis principales.

- Completar variables secundarias.

- Obtener información complementaria.

56. Uso de Botones

Los botones existen para facilitar la interacción.

Nunca deben reemplazar completamente el texto libre.

**Cuándo**** utilizar botones**

- Respuestas binarias.

- Opciones limitadas.

- Variables estandarizadas.

- Confirmaciones.

**Ejemplos:**

Sí / No

Motor frío / Motor caliente

Siempre / A veces / Nunca

Izquierda / Derecha / Ambos lados

**Cuándo**** NO utilizar botones**

- Descripción de síntomas.

- Explicaciones.

- Casos complejos.

- Información narrativa.

57. Manejo de Respuestas Especiales

El sistema deberá responder adecuadamente cuando el usuario no pueda proporcionar información.

**"No sé"**

No insistir inmediatamente.

Buscar otra forma de obtener evidencia.

Ejemplo: No hay problema. Intentemos con otra pregunta que pueda ayudarnos.

**"No puedo revisarlo"**

Proponer alternativas.

Ejemplo: Entiendo. Continuemos con la información que ya tenemos.

**"No entiendo"**

Reformular la pregunta utilizando un lenguaje más sencillo.

Nunca repetir exactamente la misma pregunta.

**Sin respuesta**

Si el usuario permanece inactivo, el sistema deberá conservar el estado actual del caso sin generar nuevas preguntas automáticamente.

58. Manejo de Contradicciones

Durante una investigación pueden aparecer respuestas incompatibles.

**Ejemplo:**

El usuario indica inicialmente que el ruido aparece únicamente con el motor frío.

Más adelante afirma que ocurre solamente con el motor caliente.

**En estos casos el sistema deberá:**

- detectar la contradicción;

- informar que existe información inconsistente;

- solicitar una aclaración;

- actualizar las hipótesis únicamente después de resolver la inconsistencia.

Nunca deberá ignorar respuestas contradictorias.

59. Resúmenes Parciales

Durante investigaciones largas, el sistema podrá generar resúmenes automáticos.

**Objetivos:**

- reducir carga cognitiva;

- recordar información relevante;

- aumentar la confianza del usuario.

**Ejemplo:**

Hasta ahora hemos identificado que el problema ocurre únicamente al acelerar, aparece con el motor caliente y no existen luces de advertencia encendidas.

60. Tono Conversacional

La personalidad del sistema deberá mantenerse consistente durante toda la investigación para generar confianza y facilitar la comprensión del usuario.

**Características:**

- profesional;

- tranquila;

- clara;

- objetiva;

- respetuosa;

- paciente.

**Nunca deberá:**

- utilizar sarcasmo;

- exagerar riesgos;

- minimizar problemas;

- emitir juicios sobre el usuario;

- utilizar un lenguaje excesivamente técnico.

61. Adaptación al Usuario

El sistema deberá adaptar el nivel de explicación según las respuestas del usuario.

**Usuario sin conocimientos técnicos**

Utilizar lenguaje cotidiano.

Ejemplo: "pieza que mueve el motor" en lugar de "cigüeñal" cuando sea posible.

**Usuario con conocimientos técnicos**

Aceptar terminología especializada.

No simplificar innecesariamente.

**Detección dinámica**

El sistema no preguntará explícitamente el nivel de conocimiento del usuario.

Lo inferirá a partir de la conversación.

62. Finalización de la Conversación

La conversación podrá finalizar cuando ocurra alguna de las siguientes condiciones.

**Evidencia suficiente**

El Motor de Decisión considera que puede generarse un informe.

**Decisión del usuario**

El usuario selecciona "Analizar ahora".

**Abandono**

El usuario deja la investigación.

El caso queda almacenado para continuar posteriormente.

63. Requisitos Conversacionales

**RCV-001**

Cada mensaje del sistema deberá tener un objetivo específico.

**RCV-002**

Nunca deberán realizarse preguntas repetidas.

**RCV-003**

Toda explicación deberá utilizar lenguaje comprensible para el usuario promedio.

**RCV-004**

Las contradicciones deberán resolverse antes de generar el informe.

**RCV-005**

El sistema deberá permitir combinar texto libre, botones y evidencia multimedia durante toda la investigación.

**RCV-006**

El usuario podrá finalizar la investigación en cualquier momento solicitando el análisis.

**RCV-007**

El sistema podrá sugerir finalizar la investigación, pero nunca hacerlo automáticamente.

**RCV-008**

La conversación deberá conservar el contexto completo durante toda la vida del caso.

64. Futuras Capacidades Conversacionales

En versiones futuras podrán incorporarse funcionalidades como:

- Memoria de investigaciones anteriores del mismo vehículo.

- Conversaciones de seguimiento después de una reparación.

- Comparación entre síntomas antiguos y actuales.

- Continuación de investigaciones iniciadas en otro dispositivo.

- Integración con datos provenientes del vehículo (OBD-II u otros sistemas).

Estas capacidades no forman parte del MVP.

*— Fin de la Fase 8 —*

FASE 9 — SISTEMA DE EVIDENCIA

65. Objetivo

65.1 Propósito

El Sistema de Evidencia es el componente responsable de recopilar, organizar, clasificar y administrar toda la información obtenida durante una investigación, asegurando que cada conclusión pueda justificarse mediante evidencia trazable.

Toda conclusión generada por CarPlus deberá estar respaldada por evidencia.

La evidencia constituye la base sobre la cual se generan hipótesis, se construye el informe y, posteriormente, se alimenta la Base de Conocimiento.

65.2 Principios

El Sistema de Evidencia deberá operar conforme a los siguientes principios fundamentales:

- Toda evidencia deberá quedar asociada a un caso.

- La evidencia nunca podrá modificarse después de ser registrada.

- Toda hipótesis deberá indicar qué evidencia la respalda.

- La ausencia de evidencia nunca deberá interpretarse como evidencia negativa.

- El origen de cada evidencia deberá ser trazable.

66. Tipos de Evidencia

CarPlus trabajará con distintos tipos de evidencia.

**Evidencia Textual**

Información escrita directamente por el usuario.

**Ejemplos:**

- "El motor vibra."

- "El ruido aparece al acelerar."

- "Hace dos semanas comenzó el problema."

**Evidencia Fotográfica**

Imágenes enviadas por el usuario.

**Ejemplos:**

- Motor.

- Tablero.

- Piezas dañadas.

- Fugas.

- Desgaste.

**Evidencia en Video**

Videos que muestran el comportamiento del vehículo.

**Ejemplos:**

- Vibraciones.

- Movimiento de componentes.

- Humo.

- Fugas.

- Funcionamiento del motor.

**Evidencia de Audio**

Grabaciones de sonidos.

**Ejemplos:**

- Golpeteos.

- Chillidos.

- Vibraciones.

- Sonido del motor.

**Evidencia Derivada**

Información inferida automáticamente por el sistema a partir de otra evidencia.

**Ejemplos:**

- "El motor estaba encendido."

- "El tablero muestra luz de Check Engine."

- "Existe humo blanco."

La evidencia derivada deberá indicar siempre cuál fue su fuente original.

67. Ciclo de Vida de la Evidencia

Cada elemento de evidencia deberá recorrer un ciclo de vida estandarizado que garantice su trazabilidad e integridad:

Recibida

**↓**

Validada

**↓**

Procesada

**↓**

Clasificada

**↓**

Relacionada con variables

**↓**

Disponible para hipótesis

**↓**

Archivada con el caso

La Figura 10 muestra la pantalla «Recolección de evidencias» en el contexto funcional descrito en esta sección.

Figura 10. Recolección de evidencias.

**Descripción UX. **Permite consultar y añadir evidencia, conocer su estado de procesamiento y revisar variables derivadas. Cada elemento muestra origen, estado y calidad sin ocultar el archivo original.

68. Registro de Evidencia

**Cada elemento registrado deberá almacenar, como mínimo:**

- Identificador único.

- Caso asociado.

- Tipo de evidencia.

- Fecha y hora.

- Usuario que la proporcionó.

- Estado de procesamiento.

- Variables extraídas.

- Fuente original.

- Estado de validación.

69. Procesamiento

El procesamiento aplicado dependerá del tipo de evidencia recibido, permitiendo extraer información estructurada de manera consistente.

**Texto**

**El sistema podrá identificar:**

- síntomas;

- ubicaciones;

- frecuencia;

- intensidad;

- condiciones de aparición;

- componentes mencionados.

**Imagen**

**El sistema podrá detectar, cuando sea posible:**

- luces del tablero;

- fugas;

- humo;

- corrosión;

- desgaste visible;

- componentes mecánicos.

**Video**

**El sistema podrá analizar:**

- movimiento;

- vibraciones;

- humo;

- comportamiento dinámico;

- secuencia temporal de eventos.

**Audio**

**El sistema podrá identificar patrones acústicos como:**

- golpeteos;

- chirridos;

- traqueteos;

- silbidos;

- ralentí irregular.

70. Variables Extraídas

La evidencia no se utilizará directamente por el Motor de Investigación.

Primero será transformada en variables estructuradas.

**Ejemplos:**

- Motor caliente.

- Motor frío.

- Velocidad alta.

- Velocidad baja.

- Giro hacia la izquierda.

- Giro hacia la derecha.

- Vibración presente.

- Humo blanco.

- Humo azul.

- Olor a combustible.

- Luz Check Engine encendida.

Estas variables podrán ser utilizadas posteriormente por las hipótesis.

71. Relación entre Evidencia y Variables

Una misma evidencia puede generar múltiples variables.

**Ejemplo:**

**Un video puede producir:**

- Motor encendido.

- Humo blanco.

- Vibración moderada.

- Sonido metálico.

- Ralentí inestable.

Asimismo, una misma variable puede estar respaldada por múltiples evidencias.

72. Calidad de la Evidencia

La calidad de la evidencia puede variar significativamente, por lo que el sistema deberá evaluarla antes de utilizarla como soporte para las hipótesis.

El sistema deberá evaluar su calidad para ayudar al Motor de Investigación.

**Los criterios podrán incluir:**

- nitidez;

- duración;

- claridad del audio;

- completitud;

- consistencia;

- relevancia para el caso.

La calidad de la evidencia nunca deberá confundirse con la probabilidad de una hipótesis.

73. Evidencia Contradictoria

Cuando dos elementos de evidencia resulten incompatibles, el sistema deberá:

- conservar ambos registros;

- identificar la contradicción;

- informar al Motor de Investigación;

- solicitar información adicional antes de generar conclusiones.

La evidencia nunca deberá eliminarse únicamente por ser contradictoria.

74. Evidencia Insuficiente

Cuando no exista información suficiente para respaldar una hipótesis, el sistema deberá:

- registrar la falta de evidencia;

- identificar qué información sería necesaria;

- priorizar preguntas orientadas a obtenerla.

75. Evidencia No Utilizada

No toda la evidencia recibida será necesariamente relevante.

El sistema podrá conservar evidencia que no haya sido utilizada en el informe.

**En esos casos deberá indicar internamente:**

- motivo de exclusión;

- hipótesis afectadas;

- fecha de evaluación.

Esto permitirá reanalizar el caso en futuras versiones sin perder información.

76. Trazabilidad

Toda conclusión deberá poder responder las siguientes preguntas:

- ¿Qué evidencia la respalda?

- ¿Qué usuario proporcionó esa evidencia?

- ¿Cuándo fue registrada?

- ¿Qué variables generó?

- ¿Qué hipótesis utilizó esas variables?

Esta trazabilidad es obligatoria para garantizar transparencia y facilitar auditorías.

77. Seguridad e Integridad

**La evidencia deberá cumplir las siguientes reglas:**

- conservar el archivo original sin modificaciones;

- mantener un identificador único;

- registrar la fecha y hora de recepción;

- impedir modificaciones posteriores al registro;

- permitir su consulta durante toda la vida del caso.

78. Requisitos del Sistema de Evidencia

**RSE-001**

Toda evidencia deberá pertenecer a un caso.

**RSE-002**

Toda evidencia deberá poseer un identificador único.

**RSE-003**

Toda evidencia deberá conservar su origen.

**RSE-004**

Las variables deberán derivarse únicamente de evidencia registrada.

**RSE-005**

Toda hipótesis deberá estar asociada a una o más evidencias.

**RSE-006**

El sistema deberá conservar evidencia no utilizada.

**RSE-007**

Las contradicciones deberán registrarse explícitamente.

**RSE-008**

La eliminación de evidencia por parte del sistema no estará permitida.

**RSE-009**

Cada evidencia deberá mantener un historial de procesamiento.

**RSE-010**

El procesamiento de una evidencia nunca deberá alterar el archivo original.

79. Evolución Futura

En versiones posteriores, el Sistema de Evidencia podrá incorporar capacidades como:

- comparación automática entre evidencias de diferentes casos;

- análisis temporal de la evolución de un mismo vehículo;

- detección de patrones recurrentes entre miles de investigaciones;

- integración con datos de sensores del vehículo (por ejemplo, OBD-II);

- enriquecimiento automático de evidencias mediante nuevas versiones del modelo de IA.

Estas funcionalidades quedan fuera del alcance del MVP.

*— Fin de la Fase 9 —*

FASE 10 — BASE DE CONOCIMIENTO

80. Objetivo

80.1 Propósito

La Base de Conocimiento constituye el repositorio central donde CarPlus almacena el conocimiento validado derivado de investigaciones y reparaciones confirmadas, permitiendo que el sistema mejore progresivamente sin depender exclusivamente del modelo de IA.

Su propósito es mejorar progresivamente la capacidad del sistema para investigar problemas similares sin depender exclusivamente del modelo de inteligencia artificial.

80.2 Principios

La Base de Conocimiento deberá regirse por los siguientes principios fundamentales:

- El conocimiento deberá estar estructurado.

- Todo conocimiento deberá ser trazable.

- El conocimiento nunca deberá reemplazar la evidencia del caso actual.

- La información histórica deberá utilizarse únicamente como apoyo.

- Todo aprendizaje deberá poder auditarse.

81. Objetivos de la Base de Conocimiento

**La Base de Conocimiento tendrá como objetivos principales:**

- identificar patrones recurrentes;

- mejorar futuras investigaciones;

- acelerar la generación de hipótesis;

- reducir preguntas innecesarias;

- mejorar la calidad de los informes;

- conservar conocimiento incluso si cambia el modelo de IA.

82. Fuentes de Conocimiento

La Base de Conocimiento podrá incorporar información proveniente de distintas fuentes.

**Casos Confirmados**

Principal fuente de conocimiento.

Corresponde a investigaciones cuya reparación fue confirmada posteriormente.

**Casos de Alta Calidad**

Investigaciones con evidencia abundante y consistente.

Aunque no exista confirmación final, podrán utilizarse como referencia con menor peso.

**Conocimiento Técnico**

Información proveniente de documentación técnica, manuales de fabricantes u otras fuentes autorizadas incorporadas por el equipo del producto.

Su incorporación deberá quedar registrada.

**Reglas del Producto**

Conocimiento definido explícitamente por el equipo de desarrollo.

**Ejemplos:**

- una batería descargada puede impedir el arranque;

- una fuga importante de refrigerante aumenta el riesgo de sobrecalentamiento.

Estas reglas no provienen de casos históricos.

83. Organización del Conocimiento

La Base de Conocimiento organizará la información mediante entidades y relaciones explícitas, facilitando la consulta, trazabilidad y reutilización del conocimiento.

**Entre ellas:**

- Vehículos.

- Sistemas del vehículo.

- Componentes.

- Síntomas.

- Variables.

- Evidencias.

- Hipótesis.

- Reparaciones.

- Casos.

Cada entidad deberá mantener relaciones explícitas con las demás.

84. Relaciones

Ejemplos de relaciones que podrán existir.

**Vehículo**

**↓**

Sistema de Refrigeración

**↓**

Termostato

**↓**

Síntoma

**↓**

Motor se sobrecalienta

**↓**

Hipótesis

**↓**

Reparación Confirmada

Estas relaciones permitirán navegar el conocimiento sin depender exclusivamente del lenguaje natural.

85. Patrones

La Base de Conocimiento podrá almacenar patrones detectados entre múltiples casos.

**Ejemplos:**

- síntomas que suelen aparecer juntos;

- componentes frecuentemente relacionados;

- secuencias habituales de fallas;

- variables que normalmente preceden a una reparación específica.

Los patrones nunca deberán utilizarse como evidencia de un caso particular.

Solo servirán para orientar la investigación.

86. Versionado

La Base de Conocimiento deberá implementar un sistema de versionado que preserve el historial completo de cada modificación.

Ningún conocimiento validado deberá sobrescribirse.

**Cada modificación deberá registrar:**

- fecha;

- origen;

- responsable;

- motivo;

- versión anterior;

- nueva versión.

Esto permitirá reconstruir el estado histórico del conocimiento.

87. Calidad del Conocimiento

No todo conocimiento tendrá el mismo nivel de confiabilidad.

**Cada elemento podrá almacenar indicadores internos como:**

- cantidad de casos asociados;

- calidad promedio de esos casos;

- existencia de confirmaciones;

- antigüedad;

- consistencia histórica.

Estos indicadores serán utilizados internamente y no se mostrarán directamente al usuario.

88. Uso durante una Investigación

Durante una investigación, la Base de Conocimiento podrá utilizarse para:

- sugerir hipótesis iniciales;

- priorizar preguntas;

- identificar evidencia relevante;

- detectar patrones similares;

- enriquecer explicaciones del informe.

**Sin embargo:**

La Base de Conocimiento nunca podrá reemplazar la evidencia obtenida en el caso actual.

89. Independencia del Modelo de IA

La Base de Conocimiento deberá ser independiente del proveedor de inteligencia artificial utilizado por CarPlus.

El conocimiento permanecerá disponible incluso si el modelo cambia completamente.

**Esto garantiza:**

- continuidad del producto;

- portabilidad tecnológica;

- menor dependencia de proveedores externos.

90. Actualización del Conocimiento

Toda incorporación de conocimiento seguirá el siguiente proceso.

Caso Finalizado

**↓**

Caso Confirmado

**↓**

Evaluación de Calidad

**↓**

Extracción de Conocimiento

**↓**

Validación

**↓**

Actualización de la Base

**↓**

Disponible para futuras investigaciones

No todo caso finalizará incorporándose automáticamente.

91. Prevención de Contaminación

Para evitar que la Base de Conocimiento acumule información incorrecta, el sistema deberá impedir:

- aprendizaje basado en casos incompletos;

- aprendizaje basado en evidencia contradictoria sin resolver;

- incorporación de reparaciones no confirmadas como conocimiento definitivo;

- duplicación innecesaria de información.

92. Consulta del Conocimiento

El Motor de Investigación podrá consultar la Base de Conocimiento para responder preguntas como:

- ¿Qué problemas similares existen?

- ¿Qué variables suelen diferenciar estas hipótesis?

- ¿Qué preguntas resultaron más útiles históricamente?

- ¿Qué evidencia permitió confirmar casos similares?

Las respuestas actuarán como apoyo para la investigación, no como decisiones automáticas.

93. Requisitos de la Base de Conocimiento

**RBC-001**

Todo conocimiento deberá tener un origen identificable.

**RBC-002**

Todo conocimiento deberá poder relacionarse con uno o más casos.

**RBC-003**

La Base deberá conservar el historial de versiones.

**RBC-004**

El conocimiento nunca podrá sobrescribir la evidencia de un caso.

**RBC-005**

Las relaciones entre entidades deberán ser explícitas.

**RBC-006**

El Motor de Investigación podrá consultar la Base durante cualquier etapa de la investigación.

**RBC-007**

El conocimiento utilizado por un informe deberá quedar registrado para fines de auditoría.

**RBC-008**

La incorporación de nuevo conocimiento deberá pasar por un proceso de validación.

**RBC-009**

La Base deberá permanecer operativa independientemente del modelo de IA utilizado.

**RBC-010**

Todo conocimiento deberá poder eliminarse lógicamente si se demuestra incorrecto, preservando siempre el historial para auditoría.

94. Evolución Futura

En versiones posteriores, la Base de Conocimiento podrá incorporar:

- relaciones probabilísticas entre componentes;

- representación mediante grafos de conocimiento (Knowledge Graph);

- búsqueda semántica de casos similares;

- agrupación automática de fallas recurrentes;

- recomendaciones de inspección basadas en estadísticas;

- conocimiento específico por fabricante, modelo y motorización.

Estas funcionalidades quedan fuera del alcance del MVP.

*— Fin de la Fase 10 —*

FASE 11 — PRINCIPIOS Y DECISIONES DE EXPERIENCIA DE USUARIO (UX)

95. Objetivo

95.1 Propósito

Esta fase establece los principios que guían el diseño de la experiencia de usuario en CarPlus, con el objetivo de garantizar una interacción consistente, intuitiva y alineada con la filosofía del producto.

Su objetivo es garantizar que todas las funcionalidades del producto sean consistentes, comprensibles y fáciles de utilizar, independientemente de futuras modificaciones en la interfaz.

95.2 Alcance

**Esta fase no define:**

- colores;

- tipografías;

- iconografía;

- componentes visuales.

Estos elementos pertenecerán al Design System.

El capítulo transversal «Design System de CarPlus» formaliza estos elementos y debe utilizarse como referencia visual junto con las decisiones de experiencia de esta fase.

Esta fase define únicamente decisiones de experiencia.

96. Principios de UX

Todas las decisiones de experiencia de usuario deberán respetar los siguientes principios fundamentales:

**PUX-001 — Claridad antes que cantidad**

La información importante siempre deberá tener prioridad sobre la información secundaria.

Nunca se mostrarán grandes cantidades de información simultáneamente si afectan la comprensión.

**PUX-002 — Reducir carga cognitiva**

El usuario deberá concentrarse únicamente en la siguiente acción relevante.

La interfaz evitará mostrar opciones innecesarias durante la investigación.

**PUX-003 — Guiar, no obligar**

CarPlus orienta al usuario durante la investigación.

Nunca impondrá un recorrido rígido cuando existan alternativas razonables.

**PUX-004 — Transparencia**

**El usuario deberá comprender:**

- qué está ocurriendo;

- por qué ocurre;

- qué hará el sistema después.

**PUX-005 — Consistencia**

Una misma acción deberá producir siempre el mismo resultado esperado.

La terminología utilizada será consistente en toda la aplicación.

97. Arquitectura de Navegación

La navegación principal del producto se estructurará en tres pantallas fundamentales, minimizando la complejidad y favoreciendo un flujo continuo.

Registro del Vehículo

**↓**

**Investigación**

**↓**

**Informe**

No deberán incorporarse pasos adicionales al flujo principal sin una justificación clara.

98. Registro del Vehículo

El registro inicial deberá solicitar únicamente la información necesaria para iniciar una investigación.

**Información obligatoria:**

- Marca.

- Modelo.

- Año.

**Información opcional:**

- Motor.

- Kilometraje.

- Patente (si existe esta funcionalidad).

La incorporación de nuevos campos deberá justificarse mediante evidencia de valor para la investigación.

99. Experiencia de Investigación

La pantalla de investigación constituye el núcleo de la experiencia de usuario y deberá concentrar la mayor parte de la interacción con el sistema.

**Deberá priorizar:**

- la conversación;

- la evidencia;

- el progreso de la investigación.

No deberá distraer al usuario con elementos secundarios.

**Componentes principales**

**La investigación podrá incluir:**

- historial de conversación;

- caja de texto;

- botones de respuesta rápida;

- botón para adjuntar evidencia;

- indicador de progreso;

- botón "Analizar ahora".

La Figura 8 muestra la pantalla «Nueva investigación» en el contexto funcional descrito en esta sección.

Figura 8. Nueva investigación.

**Descripción UX. **Crea un caso con vehículo, descripción libre y evidencia opcional sin anticipar conclusiones. La pantalla explica qué ocurrirá después y mantiene una única acción primaria.

100. Indicador de Progreso

El sistema deberá comunicar de forma continua el estado de avance de la investigación, evitando generar falsas expectativas sobre la precisión de los resultados.

**Sin embargo:**

No deberá representar el progreso como un porcentaje de precisión.

**En su lugar podrá utilizar mensajes como:**

- "Aún necesitamos más información."

- "Ya contamos con suficiente evidencia para generar un informe."

- "Podemos seguir investigando para obtener un resultado más completo."

El objetivo es comunicar estado, no exactitud.

101. Evidencia Multimedia

Adjuntar evidencia deberá requerir el menor número posible de acciones.

**El usuario podrá incorporar:**

- imágenes;

- videos;

- audios.

Siempre que sea posible, la evidencia deberá mostrarse inmediatamente dentro de la conversación.

102. Explicaciones

Cuando el sistema realice preguntas poco intuitivas, podrá explicar brevemente su motivo.

Ejemplo: Preguntamos esto porque nos ayuda a diferenciar entre varias posibles causas.

Estas explicaciones deberán ser breves y opcionales.

103. Errores

Los mensajes de error deberán cumplir los siguientes principios.

Nunca culpabilizar al usuario.

Explicar claramente qué ocurrió.

Indicar cómo resolver el problema.

Ejemplo incorrecto: Error 502.

Ejemplo correcto: No pudimos analizar el video. Puedes intentar enviarlo nuevamente.

104. Estados de Carga

Durante procesos largos el sistema deberá informar qué está ocurriendo.

**Ejemplos:**

- Analizando imagen...

- Procesando audio...

- Generando informe...

Nunca mostrar una pantalla completamente vacía mientras exista procesamiento activo.

105. Acciones Importantes

Las acciones con mayor impacto deberán ser claramente diferenciables.

**Ejemplos:**

- Analizar ahora.

- Eliminar caso.

- Confirmar reparación.

Las acciones destructivas deberán solicitar confirmación antes de ejecutarse.

106. Accesibilidad

**La experiencia deberá considerar, como mínimo:**

- contraste adecuado;

- tamaño legible de textos;

- navegación compatible con teclado;

- elementos táctiles de tamaño suficiente;

- uso de iconos acompañados de texto cuando sea necesario.

107. Adaptación a Dispositivos

**El producto deberá funcionar correctamente en:**

- teléfonos móviles;

- tablets;

- navegadores de escritorio.

La experiencia podrá adaptarse al tamaño de pantalla, pero el flujo principal deberá mantenerse consistente.

108. Experiencia del Informe

El informe deberá priorizar la comprensión.

**Orden recomendado:**

- Resumen.

- Urgencia.

- Posibles causas.

- Evidencia utilizada.

- Qué revisar primero.

- Costos aproximados.

- Limitaciones.

Las secciones deberán poder expandirse y contraerse sin alterar el contenido.

109. Microinteracciones

Las microinteracciones deberán utilizarse para comunicar cambios de estado.

**Ejemplos:**

- evidencia enviada correctamente;

- procesamiento iniciado;

- informe disponible;

- caso guardado automáticamente.

No deberán utilizarse únicamente como elementos decorativos.

110. Requisitos de UX

**RUX-001**

La investigación deberá poder iniciarse en menos de dos minutos desde la apertura de la aplicación.

**RUX-002**

El usuario deberá poder adjuntar evidencia en cualquier momento de la conversación.

**RUX-003**

Toda acción importante deberá proporcionar retroalimentación visual.

**RUX-004**

El estado actual de la investigación siempre deberá ser visible.

**RUX-005**

La navegación principal no deberá superar tres niveles de profundidad.

**RUX-006**

El informe deberá poder leerse completamente sin conocimientos de mecánica.

**RUX-007**

Las explicaciones técnicas deberán disponer de una versión simplificada cuando corresponda.

**RUX-008**

La interfaz deberá minimizar el número de pasos necesarios para completar una investigación.

**RUX-009**

La información crítica para la seguridad deberá destacarse visualmente por encima del resto del contenido.

**RUX-010**

Las decisiones de UX deberán favorecer la rapidez de comprensión antes que la densidad de información.

111. Métricas de Experiencia

El éxito de la experiencia podrá medirse mediante indicadores como:

- tiempo promedio para iniciar una investigación;

- tiempo promedio hasta generar un informe;

- porcentaje de investigaciones completadas;

- porcentaje de usuarios que adjuntan evidencia;

- porcentaje de usuarios que leen el informe completo;

- satisfacción reportada después de una investigación.

Estas métricas servirán para evaluar mejoras futuras, pero no forman parte del funcionamiento del sistema.

112. Evolución Futura

**En versiones posteriores podrán incorporarse mejoras como:**

- modo oscuro y claro configurable;

- investigación completamente por voz;

- accesibilidad avanzada para usuarios con discapacidad visual;

- visualización interactiva de componentes del vehículo;

- personalización del flujo según el nivel de experiencia del usuario;

- recomendaciones proactivas basadas en el historial del vehículo.

Estas funcionalidades quedan fuera del alcance del MVP.

*— Fin de la Fase 11 —*

FASE 12 — ESPECIFICACIÓN DEL SISTEMA DE INTELIGENCIA ARTIFICIAL

113. Objetivo

113.1 Propósito

Esta fase establece los principios, responsabilidades y límites del Sistema de Inteligencia Artificial de CarPlus, definiendo el comportamiento esperado del componente con independencia del modelo o proveedor utilizado.

Su propósito es garantizar un comportamiento consistente del sistema independientemente del proveedor o modelo de IA utilizado.

La IA constituye un componente del producto, no el producto completo.

113.2 Alcance

**Esta fase define:**

- responsabilidades del sistema de IA;

- límites de actuación;

- interacción con otros módulos;

- criterios de calidad;

- comportamiento esperado.

No define la implementación técnica de un modelo específico.

114. Arquitectura General

El Sistema de IA deberá integrarse con el resto del producto mediante interfaces claramente definidas, preservando una arquitectura modular y desacoplada.

Usuario

**↓**

Sistema Conversacional

**↓**

Motor de Investigación

**↓**

Sistema de IA

**↓**

Motor de Decisión

**↓**

Generador de Informe

La IA nunca deberá interactuar directamente con la interfaz de usuario ni con la Base de Datos.

Toda comunicación deberá realizarse a través de los componentes correspondientes.

115. Responsabilidades

El Sistema de IA asumirá las siguientes responsabilidades dentro de la arquitectura del producto:

- interpretar información del usuario;

- extraer variables relevantes;

- generar hipótesis;

- identificar incertidumbres;

- seleccionar información útil para la investigación;

- redactar explicaciones;

- colaborar en la generación del informe.

No será responsable de tomar decisiones finales del producto.

116. Responsabilidades Excluidas

**La IA no deberá:**

- emitir diagnósticos definitivos;

- inventar evidencia;

- modificar información registrada;

- alterar el historial de un caso;

- eliminar hipótesis sin justificación;

- decidir automáticamente cuándo finalizar una investigación.

Estas decisiones pertenecen a otros componentes del sistema.

117. Flujo de Razonamiento

Toda interacción deberá seguir el siguiente proceso lógico.

Recibir Evidencia

**↓**

Interpretar Información

**↓**

Actualizar Variables

**↓**

Actualizar Hipótesis

**↓**

Identificar Incertidumbre

**↓**

Seleccionar Acción

**↓**

Generar Respuesta

La IA no deberá omitir etapas de este proceso.

118. Generación de Hipótesis

**Las hipótesis deberán construirse únicamente a partir de:**

- evidencia registrada;

- variables extraídas;

- conocimiento disponible en la Base de Conocimiento.

Nunca deberán originarse únicamente por frecuencia estadística o intuición del modelo.

La Figura 11 muestra la pantalla «Hipótesis generadas» en el contexto funcional descrito en esta sección.

Figura 11. Hipótesis generadas.

**Descripción UX. **Muestra posibles explicaciones ordenadas por compatibilidad cualitativa con la evidencia. Separa hipótesis de evidencia, comunica incertidumbre de forma explícita y evita porcentajes o diagnósticos.

119. Gestión de Incertidumbre

La IA deberá identificar explícitamente los elementos que aún generan incertidumbre durante la investigación, incluyendo:

- información conocida;

- información desconocida;

- contradicciones;

- evidencia insuficiente.

Cuando la incertidumbre sea elevada, la IA deberá solicitar información adicional antes de fortalecer una hipótesis.

120. Explicabilidad

**Toda conclusión generada deberá poder explicar:**

- qué evidencia utilizó;

- qué variables consideró;

- qué hipótesis evaluó;

- por qué llegó a esa conclusión.

Si no puede explicar una conclusión, no deberá presentarla en el informe.

121. Consistencia

Ante el mismo conjunto de evidencia, el sistema deberá producir resultados razonablemente consistentes.

Podrán existir pequeñas diferencias en la redacción, pero no en aspectos fundamentales como:

- hipótesis principales;

- nivel de urgencia;

- evidencia considerada;

- recomendaciones prioritarias.

122. Manejo de Información Incompleta

Cuando la información disponible sea insuficiente, la IA deberá:

- reconocer explícitamente la falta de información;

- priorizar preguntas que reduzcan la incertidumbre;

- evitar completar vacíos mediante suposiciones.

123. Manejo de Contradicciones

**Cuando detecte información incompatible, la IA deberá:**

- registrar la contradicción;

- solicitar aclaraciones;

- posponer conclusiones afectadas hasta resolver la inconsistencia.

Las contradicciones nunca deberán ignorarse.

124. Seguridad

El sistema deberá actuar de forma conservadora cuando exista riesgo para la seguridad.

**Ejemplos:**

- pérdida de frenos;

- sobrecalentamiento severo;

- humo abundante;

- pérdida importante de aceite;

- fallas de dirección.

En estos casos deberá recomendar una inspección inmediata y reflejarlo en el nivel de urgencia.

125. Independencia Tecnológica

CarPlus deberá poder sustituir el modelo de IA sin modificar la lógica principal del producto.

**Por esta razón:**

- los prompts deberán mantenerse separados del código de negocio;

- la Base de Conocimiento será independiente del modelo;

- el Sistema Conversacional será independiente del proveedor;

- el Motor de Investigación utilizará interfaces estables.

126. Observabilidad

El comportamiento del Sistema de IA deberá ser observable y medible mediante métricas que faciliten su evaluación y mejora continua.

**El sistema podrá registrar, entre otros:**

- tiempo de respuesta;

- cantidad de preguntas realizadas;

- hipótesis generadas;

- hipótesis descartadas;

- uso de la Base de Conocimiento;

- solicitudes de evidencia;

- errores de procesamiento.

Estos registros permitirán mejorar continuamente el producto.

127. Evaluación de Calidad

La calidad del Sistema de IA podrá evaluarse mediante indicadores como:

- porcentaje de investigaciones completadas;

- porcentaje de hipótesis confirmadas posteriormente;

- tiempo promedio hasta generar un informe;

- satisfacción del usuario;

- cantidad promedio de preguntas por investigación;

- porcentaje de investigaciones que requieren reinicio.

Estos indicadores no forman parte del funcionamiento del sistema, pero servirán para medir su desempeño.

128. Requisitos del Sistema de IA

**RSIA-001**

La IA deberá utilizar únicamente evidencia registrada durante la investigación.

**RSIA-002**

Toda hipótesis deberá ser explicable.

**RSIA-003**

La IA deberá identificar explícitamente la incertidumbre restante.

**RSIA-004**

Las contradicciones deberán resolverse antes de fortalecer una hipótesis.

**RSIA-005**

La IA nunca deberá afirmar un diagnóstico definitivo.

**RSIA-006**

El sistema deberá ser independiente del proveedor del modelo.

**RSIA-007**

Toda interacción deberá quedar asociada al caso correspondiente.

**RSIA-008**

La IA deberá poder operar con diferentes modelos siempre que respeten las interfaces definidas por el producto.

**RSIA-009**

La IA deberá priorizar la evidencia del caso actual por sobre patrones históricos.

**RSIA-010**

Toda respuesta deberá mantener un tono profesional, claro y coherente con los principios definidos en la Fase 8.

129. Evolución Futura

En futuras versiones, el Sistema de IA podrá incorporar capacidades como:

- razonamiento multimodal más avanzado;

- comparación automática entre casos similares;

- adaptación de estrategias de investigación según el tipo de vehículo;

- generación de hipótesis colaborativa entre múltiples modelos de IA;

- optimización automática de preguntas basada en resultados históricos;

- evaluación continua del desempeño mediante conjuntos de pruebas internos.

Estas capacidades quedan fuera del alcance del MVP.

130. Principios Inmutables del Sistema de IA

Los siguientes principios no deberán modificarse sin una decisión explícita del equipo del producto:

- La IA investiga; no diagnostica.

- Toda conclusión debe estar respaldada por evidencia.

- La incertidumbre debe comunicarse, no ocultarse.

- El usuario mantiene el control sobre el momento del análisis.

- La Base de Conocimiento es independiente del modelo de IA.

- La trazabilidad es obligatoria para toda conclusión.

- La seguridad del usuario tiene prioridad sobre la completitud de la investigación.

*— Fin de la Fase 12 —*

FASE 13 — ARQUITECTURA DEL BACKEND

131. Objetivo

131.1 Propósito

Esta fase establece la arquitectura lógica del backend de CarPlus, definiendo cómo se organizan y colaboran sus componentes para ofrecer una plataforma modular, escalable y mantenible.

Su objetivo es establecer cómo los distintos componentes del sistema colaboran para gestionar investigaciones, almacenar información, coordinar la inteligencia artificial y generar informes, manteniendo una arquitectura modular, escalable e independiente del proveedor de IA.

131.2 Principios

El backend deberá diseñarse y operar conforme a los siguientes principios fundamentales:

- Separación clara de responsabilidades.

- Comunicación mediante interfaces bien definidas.

- Componentes desacoplados.

- Escalabilidad horizontal.

- Persistencia centralizada.

- Independencia tecnológica.

Ningún componente deberá asumir responsabilidades pertenecientes a otro.

132. Responsabilidades del Backend

El backend constituye el núcleo operativo de CarPlus y coordina la interacción entre los distintos componentes del sistema.

**Será responsable de:**

- autenticar solicitudes;

- administrar usuarios;

- gestionar vehículos;

- crear investigaciones;

- almacenar evidencia;

- coordinar el Motor de Investigación;

- coordinar el Sistema de IA;

- generar informes;

- administrar la Base de Conocimiento;

- mantener la consistencia del sistema.

No contendrá lógica específica de interfaz gráfica.

133. Arquitectura General

La arquitectura lógica se organizará en servicios con responsabilidades claramente delimitadas, favoreciendo el desacoplamiento y la evolución independiente de cada componente.

Cliente (Mobile / Web)

**↓**

API Gateway

**↓**

Backend Principal

**↓**

────────────────────────────────

- Servicio de Usuarios

- Servicio de Vehículos

- Servicio de Casos

- Servicio de Conversación

- Servicio de Evidencia

- Motor de Investigación

- Motor de Decisión

- Generador de Informes

- Base de Conocimiento

- Sistema de Aprendizaje

────────────────────────────────

**↓**

**Base de Datos**

Cada servicio tendrá una única responsabilidad.

La organización del backend principal, sus servicios, motores y dependencias operativas se detalla en la Figura de arquitectura 02.

Figura de arquitectura 02. Arquitectura backend

**Descripción técnica. **El backend principal no concentra lógica mecánica: orquesta componentes con responsabilidades separadas. El Servicio de Casos mantiene el ciclo de vida; Conversación conserva mensajes y contexto; Evidencia almacena y procesa archivos; los motores de investigación y decisión controlan la investigación; el Generador de Informes consolida el resultado; Conocimiento y Aprendizaje operan de forma desacoplada.

134. API Gateway

Toda comunicación entre clientes y backend deberá pasar por un único punto de entrada.

**Responsabilidades:**

- autenticación;

- autorización;

- validación básica;

- rate limiting;

- versionado de API;

- registro de solicitudes.

El Gateway no contendrá lógica de negocio.

135. Servicio de Usuarios

Responsable de administrar la información del usuario.

**Funciones:**

- registro;

- autenticación;

- recuperación de cuenta;

- preferencias;

- configuración;

- historial de vehículos.

No administra investigaciones.

136. Servicio de Vehículos

Responsable de toda la información relacionada con vehículos.

**Funciones:**

- registrar vehículos;

- editar información;

- validar datos;

- asociar vehículos a investigaciones;

- mantener historial del vehículo.

Cada vehículo podrá estar asociado a múltiples casos.

137. Servicio de Casos

Representa el núcleo operativo del producto.

**Funciones:**

- crear casos;

- actualizar estados;

- asociar evidencia;

- mantener historial;

- relacionar informes;

- gestionar el ciclo de vida completo.

Nunca interpretará información mecánica.

138. Servicio de Conversación

Administra toda la interacción conversacional.

**Responsabilidades:**

- almacenar mensajes;

- mantener contexto;

- enviar respuestas;

- registrar botones utilizados;

- relacionar mensajes con evidencia.

El Servicio de Conversación no decide qué preguntar.

Esa responsabilidad pertenece al Motor de Investigación.

139. Servicio de Evidencia

Responsable de administrar todos los archivos recibidos.

**Tipos soportados:**

- imágenes;

- videos;

- audio;

- texto.

**Funciones:**

- almacenamiento;

- validación;

- extracción de metadatos;

- procesamiento;

- asociación con variables.

Los archivos originales nunca deberán modificarse.

140. Motor de Investigación

**Responsabilidades:**

- construir hipótesis;

- actualizar variables;

- reducir incertidumbre;

- seleccionar preguntas;

- solicitar evidencia adicional;

- consultar la Base de Conocimiento.

No genera respuestas directamente.

141. Motor de Decisión

Evalúa continuamente si existe suficiente información para generar un informe.

**Considera:**

- cantidad de evidencia;

- calidad;

- contradicciones;

- incertidumbre restante;

- utilidad esperada de nuevas preguntas.

Nunca fuerza el cierre de una investigación.

142. Generador de Informes

Responsable de construir el informe final.

**Recibe:**

- hipótesis;

- evidencia;

- variables;

- urgencia;

- explicaciones.

**Genera:**

- resumen;

- posibles causas;

- evidencia utilizada;

- recomendaciones;

- limitaciones;

- versión simplificada.

143. Base de Conocimiento

Responsable de almacenar conocimiento permanente.

**Funciones:**

- consultas;

- relaciones;

- patrones;

- conocimiento histórico.

No almacena conversaciones activas.

144. Sistema de Aprendizaje

Responsable de incorporar nuevo conocimiento.

**Proceso:**

Caso Confirmado

**↓**

Validación

**↓**

Extracción de conocimiento

**↓**

Actualización de relaciones

**↓**

**Base de Conocimiento**

Este proceso será completamente independiente de las investigaciones activas.

145. Flujo de una Investigación

Usuario

**↓**

API

**↓**

Caso

**↓**

Conversación

**↓**

Motor de Investigación

**↓**

Sistema de IA

**↓**

Motor de Decisión

**↓**

Generador de Informe

**↓**

Usuario

La Base de Conocimiento podrá ser consultada durante cualquier etapa.

146. Comunicación entre Componentes

Los servicios deberán comunicarse exclusivamente mediante interfaces públicas y contratos estables, evitando dependencias directas entre componentes.

Ningún servicio accederá directamente a la base de datos de otro servicio.

**Toda comunicación deberá ser:**

- explícita;

- versionada;

- auditable;

- desacoplada.

La secuencia de intercambio entre el cliente, los servicios del caso, los motores y las fuentes de conocimiento se representa en la Figura de arquitectura 12.

Figura de arquitectura 12. Comunicación entre módulos

**Descripción técnica. **El cliente envía mensajes y evidencia por la API. El Gestor de Casos conserva estado e historial; el Servicio de Conversación guarda el diálogo; el Sistema de Evidencia procesa archivos y produce variables; el Motor de Investigación consulta conocimiento y propone la siguiente acción; el Sistema de IA interpreta; el Motor de Decisión evalúa suficiencia; el Generador de Informes produce una versión inmutable.

147. Manejo de Errores

Cada servicio será responsable de detectar y comunicar sus propios errores.

**Los errores deberán clasificarse como:**

- validación;

- autenticación;

- autorización;

- procesamiento;

- almacenamiento;

- integración;

- infraestructura.

Los errores internos nunca deberán exponerse directamente al usuario.

148. Escalabilidad

La arquitectura deberá permitir escalar de manera independiente:

- API;

- almacenamiento;

- procesamiento multimedia;

- generación de informes;

- consultas a la Base de Conocimiento;

- procesamiento del Sistema de IA.

No deberá requerirse escalar todo el sistema simultáneamente.

149. Observabilidad

**Todos los servicios deberán registrar:**

- solicitudes recibidas;

- tiempo de ejecución;

- errores;

- cambios de estado;

- eventos relevantes;

- uso de recursos.

Estos registros facilitarán monitoreo y auditoría.

150. Seguridad

**Todo servicio deberá cumplir como mínimo:**

- autenticación obligatoria;

- autorización basada en permisos;

- cifrado de comunicaciones;

- validación de entradas;

- protección frente a abuso;

- registro de eventos críticos.

151. Requisitos del Backend

**RBE-001**

Toda investigación deberá estar asociada a un caso.

**RBE-002**

Los servicios deberán mantener responsabilidades independientes.

**RBE-003**

Toda comunicación deberá realizarse mediante interfaces definidas.

**RBE-004**

El backend nunca dependerá de un proveedor específico de IA.

**RBE-005**

Toda modificación importante deberá quedar registrada.

**RBE-006**

Los servicios deberán ser escalables de forma independiente.

**RBE-007**

El backend deberá preservar la consistencia de los datos incluso ante fallos parciales.

**RBE-008**

Toda evidencia deberá almacenarse antes de ser procesada.

**RBE-009**

Los informes deberán poder regenerarse utilizando la información histórica del caso, sin modificar el contenido original almacenado.

**RBE-010**

La arquitectura deberá permitir incorporar nuevos módulos sin afectar el funcionamiento de los existentes.

152. Evolución Futura

**En futuras versiones, la arquitectura podrá incorporar:**

- arquitectura basada en eventos (Event-Driven);

- colas de procesamiento para tareas pesadas;

- procesamiento distribuido de contenido multimedia;

- caché para consultas frecuentes;

- múltiples modelos de IA especializados según el tipo de investigación;

- integración con servicios externos (OBD-II, talleres, aseguradoras y fabricantes).

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 13 —*

***Nota de arquitectura***

El backend de CarPlus debe actuar como un orquestador y no como un componente monolítico. Cada servicio tiene una responsabilidad única y bien definida, lo que facilita el mantenimiento, la escalabilidad y la sustitución de tecnologías a lo largo del tiempo. Esta arquitectura también permite incorporar nuevas capacidades —como modelos de IA adicionales o integraciones externas— sin alterar la lógica central del producto.

FASE 14 — ESPECIFICACIÓN DE LA BASE DE DATOS

153. Objetivo

153.1 Propósito

Esta fase establece la estructura lógica de la Base de Datos de CarPlus, definiendo cómo se organiza y preserva la información necesaria para el funcionamiento del producto.

Su propósito es garantizar que toda la información del producto pueda almacenarse, consultarse y evolucionar de forma consistente, preservando la trazabilidad de cada investigación.

153.2 Principios

La Base de Datos deberá diseñarse conforme a los siguientes principios fundamentales:

- Normalización cuando sea apropiado.

- Integridad referencial.

- Historial completo.

- Escalabilidad.

- Auditoría.

- Independencia del proveedor de base de datos.

Ningún dato crítico deberá perderse durante el ciclo de vida de un caso.

154. Entidades Principales

La Base de Datos se estructurará, como mínimo, mediante las siguientes entidades principales y sus relaciones:

Usuario

**↓**

**Vehículo**

**↓**

Caso

**↓**

Conversación

**↓**

Mensaje

**↓**

Evidencia

**↓**

Variables

**↓**

Hipótesis

**↓**

**Informe**

**↓**

Resultado Confirmado (futuro)

Cada entidad tendrá un identificador único.

155. Entidad Usuario

Representa al propietario de una cuenta.

**Campos principales:**

- User ID

- Nombre

- Correo electrónico

- Fecha de creación

- Estado

- Configuración

- Preferencias

**Relaciones:**

- Un usuario puede tener múltiples vehículos.

- Un usuario puede tener múltiples investigaciones.

156. Entidad Vehículo

Representa un automóvil registrado.

**Campos principales:**

- Vehicle ID

- Usuario

- Marca

- Modelo

- Año

- Motor

- Kilometraje

- Fecha de creación

**Relaciones:**

- Un vehículo puede tener múltiples casos.

- Un caso pertenece únicamente a un vehículo.

157. Entidad Caso

Representa una investigación completa.

**Campos principales:**

- Case ID

- Vehicle ID

- Estado

- Fecha de creación

- Última actualización

- Estado actual

- Nivel de urgencia

- Informe asociado

**Relaciones:**

- Un caso posee una conversación.

- Un caso posee múltiples evidencias.

- Un caso posee múltiples hipótesis.

- Un caso puede tener múltiples versiones del informe.

158. Entidad Conversación

Almacena la conversación completa.

**Campos principales:**

- Conversation ID

- Case ID

- Fecha inicio

- Fecha término

- Estado

**Relaciones:**

- Una conversación contiene múltiples mensajes.

159. Entidad Mensaje

Representa cada interacción.

**Campos principales:**

- Message ID

- Conversation ID

- Autor

- Tipo

- Contenido

- Timestamp

**Tipos posibles:**

- Usuario

- Sistema

- IA

- Botón

- Respuesta rápida

Los mensajes nunca deberán eliminarse.

160. Entidad Evidencia

Representa cualquier archivo recibido.

**Campos principales:**

- Evidence ID

- Case ID

- Tipo

- Ruta de almacenamiento

- Estado de procesamiento

- Fecha

- Metadatos

**Tipos:**

- Imagen

- Video

- Audio

- Texto

La evidencia original será inmutable.

161. Entidad Variable

Representa información estructurada extraída durante la investigación.

**Ejemplos:**

- Motor caliente.

- Humo blanco.

- Vibración alta velocidad.

- Ruido al girar.

**Campos principales:**

- Variable ID

- Case ID

- Nombre

- Valor

- Fuente

- Evidencia asociada

Una variable podrá estar relacionada con múltiples evidencias.

162. Entidad Hipótesis

Representa una posible causa.

**Campos principales:**

- Hypothesis ID

- Case ID

- Nombre

- Estado

- Compatibilidad

- Explicación

**Estados posibles:**

- Activa

- Fortalecida

- Debilitada

- Descartada

El historial de cambios deberá conservarse.

163. Entidad Informe

Representa el resultado generado.

**Campos principales:**

- Report ID

- Case ID

- Versión

- Fecha

- Estado

- Contenido

- Resumen

- Urgencia

Los informes nunca deberán sobrescribirse.

Cada actualización generará una nueva versión.

164. Entidad Resultado Confirmado (Futuro)

Permitirá registrar la reparación real.

**Campos principales:**

- Confirmation ID

- Case ID

- Reparación

- Taller

- Costo

- Fecha

- Comentarios

Esta información alimentará el Sistema de Aprendizaje.

165. Relaciones

Usuario

**↓**

**Vehículo**

**↓**

Caso

**↓**

Conversación

**↓**

Mensajes

**↓**

Evidencia

**↓**

Variables

**↓**

Hipótesis

**↓**

**Informe**

**Adicionalmente:**

- Evidencia ↔ Variables

- Variables ↔ Hipótesis

- Hipótesis ↔ Informe

Estas relaciones deberán mantenerse explícitamente.

166. Integridad Referencial

La Base de Datos deberá garantizar la integridad referencial, impidiendo situaciones como:

- casos sin vehículo;

- mensajes sin conversación;

- evidencia sin caso;

- hipótesis sin caso;

- informes sin caso;

- variables huérfanas.

Toda relación deberá validarse automáticamente.

167. Versionado

**Las siguientes entidades conservarán historial completo:**

- Casos.

- Hipótesis.

- Informes.

- Base de Conocimiento.

Nunca se sobrescribirá información histórica.

168. Auditoría

**Toda modificación importante registrará:**

- identificador del registro;

- operación realizada;

- fecha;

- componente responsable;

- usuario responsable (cuando aplique).

La auditoría nunca podrá modificarse posteriormente.

169. Índices

La Base de Datos deberá optimizar consultas frecuentes sobre:

- User ID

- Vehicle ID

- Case ID

- Estado del caso

- Fecha

- Marca

- Modelo

- Variables

- Hipótesis

La estrategia concreta dependerá del motor de base de datos utilizado.

170. Almacenamiento Multimedia

Los archivos multimedia no deberán almacenarse directamente dentro de la Base de Datos.

**La Base únicamente almacenará:**

- identificador;

- ubicación;

- metadatos;

- estado;

- referencias.

Los archivos residirán en un sistema especializado de almacenamiento.

La separación lógica entre datos transaccionales, objetos multimedia, caché, conocimiento, índices y telemetría se ilustra en la Figura de arquitectura 04.

Figura de arquitectura 04. Arquitectura de datos

**Descripción técnica. **La figura representa tecnologías lógicas y no fija productos concretos ni proveedores. La base de datos transaccional conserva usuarios, vehículos, casos, conversaciones, variables, hipótesis e informes; el almacenamiento de objetos mantiene la evidencia original y sus referencias; la caché acelera consultas sin convertirse en fuente de verdad; el conocimiento y el grafo preservan relaciones versionadas; los índices soportan acceso frecuente y la telemetría conserva señales operativas.

171. Escalabilidad

La estructura de datos deberá diseñarse para soportar el crecimiento continuo del producto sin requerir rediseños estructurales.

- millones de investigaciones;

- millones de archivos multimedia;

- crecimiento continuo de la Base de Conocimiento;

- múltiples versiones por caso.

Sin requerir rediseños estructurales.

172. Consistencia

**El sistema deberá garantizar que:**

- toda evidencia pertenezca a un caso;

- toda hipótesis tenga evidencia asociada;

- todo informe corresponda a una investigación existente;

- todo caso tenga un estado válido.

No podrán existir registros inconsistentes.

173. Requisitos de la Base de Datos

**RBD-001**

Toda entidad deberá poseer un identificador único.

**RBD-002**

Toda relación deberá mantener integridad referencial.

**RBD-003**

La Base de Datos deberá preservar el historial de cambios.

**RBD-004**

Los informes nunca deberán sobrescribirse.

**RBD-005**

La evidencia original será inmutable.

**RBD-006**

Las variables deberán conservar su origen.

**RBD-007**

Toda hipótesis deberá pertenecer a un caso.

**RBD-008**

Los archivos multimedia deberán almacenarse fuera de la Base de Datos.

**RBD-009**

La Base deberá soportar crecimiento continuo sin rediseños estructurales.

**RBD-010**

Toda información crítica deberá poder auditarse.

174. Evolución Futura

**En versiones posteriores podrán incorporarse:**

- particionamiento automático de tablas;

- replicación geográfica;

- búsqueda semántica integrada;

- almacenamiento optimizado para grafos de conocimiento;

- historiales temporales completos (Temporal Tables);

- sincronización entre múltiples regiones.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 14 —*

***Nota de arquitectura***

La Base de Datos de CarPlus no es únicamente un repositorio de información, sino la fuente de verdad del producto. Su diseño prioriza la consistencia, la trazabilidad y la evolución del conocimiento por sobre la optimización prematura. Esta estructura permite reconstruir cualquier investigación en cualquier momento, auditar las decisiones tomadas por el sistema y reutilizar la información para mejorar futuras investigaciones sin comprometer la integridad de los datos.

FASE 15 — ESPECIFICACIÓN DE LA API

175. Objetivo

175.1 Propósito

Esta fase establece la interfaz pública del backend de CarPlus, definiendo el contrato mediante el cual los clientes y futuros sistemas externos interactúan con el producto.

Su propósito es establecer un contrato estable entre clientes (aplicación móvil, aplicación web y futuras integraciones) y los servicios del sistema.

La API constituye el único mecanismo autorizado para acceder a la lógica del producto.

175.2 Alcance

**Esta fase define:**

- estructura general de la API;

- principios de diseño;

- recursos disponibles;

- formato de solicitudes;

- formato de respuestas;

- manejo de errores;

- versionado.

No define la implementación interna del backend.

176. Principios de Diseño

La API deberá diseñarse conforme a los siguientes principios fundamentales:

- Consistencia.

- Simplicidad.

- Versionado explícito.

- Independencia del cliente.

- Idempotencia cuando corresponda.

- Respuestas predecibles.

Todos los endpoints deberán seguir las mismas convenciones.

177. Arquitectura General

Durante el MVP, la API adoptará una arquitectura REST como mecanismo principal de comunicación entre clientes y servicios.

Toda solicitud seguirá el siguiente flujo.

Cliente

**↓**

API Gateway

**↓**

Autenticación

**↓**

Validación

**↓**

Servicio correspondiente

**↓**

Respuesta

En futuras versiones podrán incorporarse WebSockets o GraphQL sin reemplazar la API REST.

178. Recursos Principales

La API expondrá los siguientes recursos.

- Usuarios

- Vehículos

- Casos

- Conversaciones

- Mensajes

- Evidencia

- Informes

- Base de Conocimiento (uso interno)

- Configuración

Cada recurso tendrá un conjunto de endpoints claramente definidos.

La exposición de recursos mediante el API Gateway y el contrato común de respuesta se sintetiza en la Figura de arquitectura 05.

Figura de arquitectura 05. Arquitectura de API

**Descripción técnica. **La API REST se publica bajo una versión explícita y utiliza únicamente los recursos y operaciones descritos en el PRD. El API Gateway autentica, autoriza, valida y limita solicitudes antes de dirigirlas al servicio responsable. Las respuestas y errores mantienen un formato uniforme, códigos HTTP estándar, idempotencia cuando corresponde, timestamps, metadatos y registro de auditoría.

179. Versionado

Toda versión deberá identificarse explícitamente.

Ejemplo: /api/v1/

Una nueva versión nunca deberá romper la compatibilidad de manera silenciosa.

Las versiones antiguas podrán mantenerse activas durante un período de transición.

180. Autenticación

Toda solicitud protegida requerirá autenticación.

El mecanismo específico (JWT, OAuth u otro) se definirá durante la implementación.

**El ****backend**** deberá validar:**

- identidad;

- permisos;

- vigencia de la sesión.

La Figura 2 muestra la pantalla «Login» en el contexto funcional descrito en esta sección.

Figura 2. Login.

**Descripción UX. **Permite el acceso mediante credenciales y mantiene visibles la creación de cuenta y la recuperación de contraseña. La acción primaria es única y los proveedores externos aparecen como alternativas secundarias.

La Figura 3 muestra la pantalla «Registro» en el contexto funcional descrito en esta sección.

Figura 3. Registro.

**Descripción UX. **Crea una cuenta mínima para asociar vehículos, investigaciones, evidencia e informes. Solicita únicamente la información necesaria, explica los requisitos de contraseña durante la escritura y separa el consentimiento de la acción principal.

La Figura 4 muestra la pantalla «Recuperar contraseña» en el contexto funcional descrito en esta sección.

Figura 4. Recuperar contraseña.

**Descripción UX. **Permite recuperar el acceso sin revelar si un correo está registrado. Explica el proceso antes de solicitar el dato y utiliza una confirmación neutra para proteger la privacidad.

181. Formato de Solicitudes

Las solicitudes deberán utilizar un formato consistente.

**Toda solicitud podrá incluir:**

- parámetros de ruta;

- parámetros de consulta;

- cuerpo de la solicitud;

- encabezados.

Las estructuras deberán ser fácilmente extensibles.

182. Formato de Respuestas

Todas las respuestas de la API deberán mantener una estructura uniforme y predecible para simplificar la integración y el mantenimiento de los clientes.

**Toda respuesta exitosa incluirá, cuando corresponda:**

- resultado;

- datos;

- metadatos;

- timestamp.

Las respuestas nunca deberán contener información innecesaria.

183. Gestión de Usuarios

**La API deberá permitir:**

- crear usuario;

- iniciar sesión;

- cerrar sesión;

- recuperar cuenta;

- actualizar perfil;

- consultar configuración.

Estas operaciones serán independientes de las investigaciones.

184. Gestión de Vehículos

**Operaciones mínimas:**

- registrar vehículo;

- obtener vehículos;

- editar vehículo;

- eliminar vehículo;

- consultar información.

Cada vehículo quedará asociado a un usuario.

185. Gestión de Casos

**Operaciones mínimas:**

- crear caso;

- consultar caso;

- actualizar estado;

- listar casos;

- archivar caso.

Cada caso será el contenedor principal de una investigación.

186. Conversación

**La API permitirá:**

- enviar mensaje;

- obtener historial;

- recibir respuesta;

- consultar estado de la investigación.

La lógica de las respuestas permanecerá en el Motor de Investigación.

187. Evidencia

**La API permitirá subir:**

- imágenes;

- videos;

- audio.

**Cada archivo deberá:**

- validarse;

- almacenarse;

- asociarse al caso;

- iniciar su procesamiento.

La carga de archivos deberá ser independiente de la conversación.

188. Informes

**Operaciones disponibles:**

- generar informe;

- consultar informe;

- listar versiones;

- obtener versión específica.

Los informes serán de solo lectura una vez generados.

189. Estados HTTP

La API utilizará códigos HTTP estándar.

**Ejemplos:**

- 200 — Operación exitosa.

- 201 — Recurso creado.

- 400 — Solicitud inválida.

- 401 — No autenticado.

- 403 — Sin permisos.

- 404 — Recurso inexistente.

- 409 — Conflicto.

- 422 — Datos válidos pero imposibles de procesar.

- 429 — Límite de solicitudes excedido.

- 500 — Error interno.

No deberán utilizarse códigos personalizados.

190. Manejo de Errores

**Toda respuesta de error deberá incluir:**

- código;

- descripción;

- identificador del error;

- timestamp.

Los mensajes deberán ser comprensibles para desarrolladores.

La información sensible nunca deberá exponerse.

191. Validación

Antes de ejecutar cualquier operación, la API deberá validar:

- autenticación;

- autorización;

- formato;

- obligatoriedad de campos;

- consistencia.

Las validaciones deberán realizarse antes de modificar información.

192. Rate Limiting

La API podrá limitar solicitudes para proteger la infraestructura.

**Los límites podrán variar según:**

- tipo de usuario;

- endpoint;

- operación;

- volumen de tráfico.

El mecanismo específico se definirá durante la implementación.

193. Idempotencia

Las operaciones que puedan ejecutarse múltiples veces sin modificar el resultado deberán ser idempotentes.

**Ejemplos:**

- consultar un caso;

- obtener un informe;

- listar vehículos.

Las operaciones de creación deberán evitar duplicados accidentales cuando sea posible.

194. Observabilidad

Todas las solicitudes relevantes deberán registrar la información necesaria para garantizar observabilidad, auditoría y diagnóstico del sistema:

- identificador;

- usuario;

- endpoint;

- duración;

- resultado;

- errores;

- servicio responsable.

Estos registros permitirán monitoreo y depuración.

195. Seguridad

**La API deberá implementar como mínimo:**

- autenticación obligatoria;

- autorización por permisos;

- validación de entradas;

- protección contra abuso;

- cifrado de comunicaciones;

- registro de eventos críticos.

La seguridad tendrá prioridad sobre la conveniencia.

196. Integraciones Futuras

**La arquitectura deberá permitir incorporar:**

- talleres mecánicos;

- aseguradoras;

- lectores OBD-II;

- fabricantes;

- sistemas de gestión de flotas;

- APIs públicas de vehículos.

Sin modificar los contratos existentes.

197. Requisitos de la API

**RAP-001**

Toda operación deberá realizarse mediante endpoints versionados.

**RAP-002**

La API nunca expondrá directamente la Base de Datos.

**RAP-003**

Toda solicitud protegida requerirá autenticación.

**RAP-004**

Las respuestas deberán mantener un formato consistente.

**RAP-005**

Toda modificación deberá validarse antes de ejecutarse.

**RAP-006**

Los errores deberán utilizar códigos HTTP estándar.

**RAP-007**

Los endpoints deberán ser independientes del proveedor de IA.

**RAP-008**

Toda solicitud importante deberá registrarse para auditoría.

**RAP-009**

Los contratos públicos deberán mantenerse estables entre versiones.

**RAP-010**

La API deberá ser extensible sin romper la compatibilidad con clientes existentes.

198. Evolución Futura

**En versiones posteriores la API podrá incorporar:**

- WebSockets para conversaciones en tiempo real;

- GraphQL para consultas complejas;

- eventos mediante Webhooks;

- streaming de respuestas del modelo de IA;

- APIs públicas para terceros;

- SDK oficiales para iOS, Android y Web.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 15 —*

***Nota de arquitectura***

La API representa el contrato formal entre CarPlus y cualquier cliente o sistema externo. Su diseño prioriza la estabilidad, la coherencia y la evolución controlada. Mantener contratos claros y versionados permite que el frontend, el backend y futuras integraciones evolucionen de forma independiente, reduciendo el acoplamiento y facilitando el mantenimiento del producto a largo plazo.

Propósito y alcance

Este capítulo establece el sistema visual, los componentes, los estados y los patrones de interacción aplicables a las interfaces de CarPlus. Su contenido constituye la fuente de verdad para la implementación visual del frontend y complementa los principios de experiencia definidos en la Fase 11 y la especificación funcional definida en la Fase 16.

La incorporación de este capítulo no modifica requisitos, arquitectura, alcance ni funcionalidades del MVP. Define cómo deben representarse visualmente los comportamientos ya establecidos en el PRD, manteniendo la consistencia entre dispositivos, estados y recorridos.

Principio rector

CarPlus investiga problemas mecánicos; no emite diagnósticos definitivos. Toda decisión visual debe reforzar la diferencia entre evidencia, hipótesis, incertidumbre e informe técnico.

Filosofía visual

La identidad visual debe hacer visible el proceso de investigación sin convertir hipótesis en certezas. La interfaz prioriza claridad, evidencia, calma operacional, explicabilidad, control del usuario y consistencia semántica.

La Figura 1 presenta la especificación visual y los criterios de aplicación de filosofía visual dentro de CarPlus.

Figura 1

Filosofía visual

La composición organiza los principios rectores y el lenguaje del producto. Una acción principal por contexto, la revelación progresiva de información y la continuidad semántica reducen la carga cognitiva sin ocultar incertidumbre.

Fundamentos visuales

Los fundamentos definen las decisiones primitivas que deben reutilizar todos los componentes. Ninguna pantalla debe introducir colores, tamaños, espaciados, radios, sombras, iconos o duraciones fuera de los tokens establecidos.

La Figura 2 presenta la especificación visual y los criterios de aplicación de color dentro de CarPlus.

Figura 2

Color

La paleta distingue identidad, superficies, texto, evidencia, acciones y estados. Los colores de estado siempre deben acompañarse de texto o iconografía y nunca constituir el único medio para comunicar significado.

La Figura 3 presenta la especificación visual y los criterios de aplicación de tipografía dentro de CarPlus.

Figura 3

Tipografía

La escala tipográfica establece jerarquías consistentes para títulos, cuerpo, etiquetas, mensajes y datos. La legibilidad tiene prioridad sobre la densidad y las variaciones de peso se utilizan para estructurar, no para decorar.

La Figura 4 presenta la especificación visual y los criterios de aplicación de grid y espaciado dentro de CarPlus.

Figura 4

Grid y espaciado

La retícula y la escala de espaciado organizan la composición responsive. Los componentes deben agruparse por proximidad, mantener anchos de lectura controlados y revelar detalle de forma progresiva.

La Figura 5 presenta la especificación visual y los criterios de aplicación de iconografía y movimiento dentro de CarPlus.

Figura 5

Iconografía y movimiento

La iconografía utiliza trazos lineales, geometría consistente y significado estable. El movimiento comunica qué cambió, dónde ocurrió y cuál es la siguiente acción; no debe utilizarse como decoración.

Componentes de interacción

Los componentes de interacción deben conservar apariencia, comportamiento, terminología, validación y estados en todos los módulos del producto. Las variantes se seleccionan según jerarquía y contexto, sin crear excepciones locales.

La Figura 6 presenta la especificación visual y los criterios de aplicación de botones dentro de CarPlus.

Figura 6

Botones

Los botones se organizan por prioridad: acción primaria, secundaria, terciaria y destructiva. Cada contexto debe presentar una única acción primaria y las acciones irreversibles deben exigir confirmación.

La Figura 7 presenta la especificación visual y los criterios de aplicación de inputs dentro de CarPlus.

Figura 7

Inputs

Los campos mantienen etiqueta persistente, ayuda contextual, validación comprensible y foco visible. Los estados default, hover, focus, completado, error y disabled deben ser distinguibles sin depender exclusivamente del color.

La Figura 8 presenta la especificación visual y los criterios de aplicación de dropdowns dentro de CarPlus.

Figura 8

Dropdowns

Los selectores se reservan para conjuntos cerrados de opciones. Deben mantener etiqueta, valor seleccionado, affordance de apertura, navegación por teclado y mensajes de error coherentes con los inputs.

Componentes de contenido

Los componentes de contenido estructuran información, estado y trazabilidad. La misma estructura debe conservar el mismo significado en inicio, vehículos, investigación, evidencia, hipótesis, informe, historial y configuración.

La Figura 9 presenta la especificación visual y los criterios de aplicación de cards dentro de CarPlus.

Figura 9

Cards

Las cards agrupan información relacionada con una jerarquía estable: título, estado, metadatos, contenido y acción. Las variantes deben corresponder a un propósito identificable y no a diferencias puramente decorativas.

La Figura 10 presenta la especificación visual y los criterios de aplicación de badges y chips dentro de CarPlus.

Figura 10

Badges y chips

Los badges comunican estados o atributos de lectura; los chips representan selecciones, filtros o respuestas compactas. Ambos deben utilizar etiquetas breves y mantener una semántica de color estable.

La Figura 11 presenta la especificación visual y los criterios de aplicación de tablas dentro de CarPlus.

Figura 11

Tablas

Las tablas se utilizan para comparar información estructurada y deben mantener encabezados claros, alineación consistente, densidad controlada y adaptación responsive. En pantallas estrechas pueden transformarse en listas o cards sin perder contenido.

Estados y feedback

Los estados visuales traducen el estado funcional del sistema a una representación comprensible. Deben preservar el contexto, explicar lo ocurrido y ofrecer una acción siguiente cuando corresponda.

La Figura 12 presenta la especificación visual y los criterios de aplicación de estados dentro de CarPlus.

Figura 12

Estados

Los estados vacíos, carga, éxito, advertencia, error, sin conexión y procesamiento deben utilizar patrones consistentes. La prioridad visual debe corresponder al impacto real y evitar lenguaje alarmista.

La Figura 13 presenta la especificación visual y los criterios de aplicación de patrones de feedback dentro de CarPlus.

Figura 13

Patrones de feedback

El feedback debe ser inmediato para acciones breves y persistente para procesos largos o errores que requieren intervención. Toasts, banners, mensajes inline y modales se seleccionan según duración, alcance y necesidad de respuesta.

La Figura 14 presenta la especificación visual y los criterios de aplicación de patrones de flujo dentro de CarPlus.

Figura 14

Patrones de flujo

Los patrones de flujo conectan registro, investigación, evidencia, hipótesis, análisis e informe sin añadir pasos al recorrido principal. El progreso comunica estado, no precisión, y el usuario conserva el control del momento del análisis.

Lenguaje, accesibilidad y gobierno

La comunicación del producto y el comportamiento de los controles forman parte del Design System. La consistencia visual no se considera completa si el contenido, la accesibilidad o el gobierno de tokens varían entre pantallas.

La Figura 15 presenta la especificación visual y los criterios de aplicación de lenguaje y contenido dentro de CarPlus.

Figura 15

Lenguaje y contenido

El lenguaje debe ser claro, profesional, tranquilo, objetivo y no concluyente. Se utilizan términos como investigación, evidencia, hipótesis, compatibilidad, urgencia e informe técnico, evitando presentar resultados como diagnósticos confirmados.

La Figura 16 presenta la especificación visual y los criterios de aplicación de estados interactivos y accesibilidad dentro de CarPlus.

Figura 16

Estados interactivos y accesibilidad

Todos los controles deben contemplar estados default, hover, focus, pressed y disabled, además de navegación por teclado, lector de pantalla, zoom, contraste suficiente y objetivos táctiles adecuados.

La Figura 17 presenta la especificación visual y los criterios de aplicación de tokens y gobierno dentro de CarPlus.

Figura 17

Tokens y gobierno

El sistema se gobierna mediante tokens primitivos, semánticos, de componente y de producto. Todo cambio debe evaluarse por impacto, documentarse, versionarse y validarse antes de incorporarse a la implementación.

Aplicación en la especificación del frontend

La Fase 16 define la arquitectura funcional, la navegación, las pantallas, los estados, las validaciones y el comportamiento de la interfaz. Este capítulo define la representación visual obligatoria de esas capacidades. Cuando una especificación de pantalla requiera botones, formularios, cards, badges, chips, tablas, estados o feedback, deberá utilizar los patrones descritos en las Figuras 1 a 17.

Los componentes reutilizables mencionados en la sección 209 deberán implementarse a partir de los tokens y variantes de este capítulo. La gestión de estado definida en la sección 210 deberá representarse mediante los patrones de las Figuras 12, 13, 14 y 16.

— Fin del capítulo transversal de Design System —

ACTUALIZACIÓN OFICIAL — PRD v3.1

Este capítulo forma parte del PRD oficial y reemplaza o complementa los apartados equivalentes de la versión 3.0. **Las decisiones aquí descritas deberán considerarse la fuente de verdad para futuras implementaciones.**

1. Registro del vehículo

El flujo de registro se modifica para permitir dos métodos de identificación: (1) ingreso mediante patente cuando exista un proveedor compatible y autorizado; (2) ingreso manual. Si la recuperación automática falla, el usuario podrá completar o corregir los datos manualmente. La patente es opcional y nunca bloqueará el uso de la aplicación.

2. Información técnica recuperable

Cuando la fuente de datos lo permita, CarPlus podrá completar automáticamente marca, modelo, versión, año, motor, cilindrada, combustible, transmisión, tracción y VIN. Todos los datos serán editables por el usuario.

3. Vehicle Data Provider

Se incorpora una capa de abstracción denominada Vehicle Data Provider. Toda consulta a servicios externos deberá realizarse exclusivamente mediante esta interfaz para evitar dependencias con un proveedor específico y facilitar la expansión internacional.

4. Contexto inicial de la IA

Si el vehículo fue identificado correctamente, la IA iniciará la investigación utilizando toda la información técnica disponible. No deberá volver a preguntar información ya conocida salvo que requiera validación.

5. Consulta dinámica de documentación técnica

Durante una investigación, el sistema podrá consultar manuales de servicio, boletines técnicos, documentación del fabricante y otros recursos autorizados mediante una arquitectura RAG. La documentación será utilizada únicamente como contexto temporal y no se incorporará permanentemente al modelo de IA.

6. Principios

La Base de Conocimiento continúa siendo el principal activo estratégico del producto. La IA consulta conocimiento cuando lo necesita; no memoriza documentación técnica. La arquitectura deberá permitir cambiar tanto el proveedor de IA como el proveedor de datos vehiculares sin modificar la lógica del negocio.

7. Roadmap

Estas capacidades forman parte del diseño objetivo del producto. La implementación podrá realizarse progresivamente, sin impedir la entrega del MVP.

ACTUALIZACIÓN OFICIAL — PRD v3.2

Este capítulo forma parte del PRD oficial y documenta una corrección de consistencia interna respecto de la versión 3.1. No modifica el alcance del MVP ni introduce nuevos requisitos funcionales.

1. Contradicción corregida

Se detectó una contradicción entre el Estado 7 de la Fase 6 ("Informe Generado", que solo permitía "Iniciar una nueva investigación" tras un informe) y el Requisito RI-009 de la Fase 7 (que exige generar una nueva versión del informe cuando el usuario continúa investigando el mismo caso). Tras análisis, se determinó que RI-009 representa el comportamiento previsto del producto: obligar a abrir un caso nuevo tras cada informe eliminaría el contexto ya construido (vehículo, conversación, evidencia, hipótesis) y contradiría FR-010, FR-012 y el principio de que el usuario mantiene el control de la investigación.

2. Cambios aplicados

Se corrigen directamente, dentro de la Fase 6: §27 (Ciclo de Vida del Caso, se habilita el retorno desde Informe Generado a Investigando), §28 (Estado 7, se diferencian explícitamente "continuar investigando el mismo problema" de "iniciar una investigación nueva para un problema diferente"), §29 (Transiciones Permitidas, antes vacía, ahora contiene la tabla oficial de la máquina de estados) y §30 (Eventos que Producen Cambios de Estado, se añade el evento "Continuar investigando tras un informe generado"). Se incorpora además una definición formal de "Caso" al inicio de §27. Se ajustan referencias relacionadas en la Fase 3 (§12.3) y la Fase 16 (§202, §206) para que ningún diagrama o descripción del producto sugiera que un informe cierra el caso de forma definitiva.

3. Regla vigente

RI-009 prevalece. Un caso permanece abierto a nueva investigación sobre el mismo problema hasta que el usuario decide finalizarlo explícitamente; cada análisis posterior genera una nueva versión del informe, preservando siempre las anteriores.

FASE 16 — ESPECIFICACIÓN DEL FRONTEND

199. Objetivo

199.1 Propósito

Esta fase establece la arquitectura funcional del frontend de CarPlus, definiendo cómo la interfaz organiza la interacción con el usuario y se integra con el resto del sistema.

Su propósito es establecer cómo la interfaz debe presentar la información, gestionar la interacción del usuario y comunicarse con la API, manteniendo una experiencia consistente, intuitiva y alineada con los principios del producto.

199.2 Alcance

**Esta fase define:**

- estructura de la aplicación;

- navegación;

- pantallas;

- componentes;

- estados visuales;

- validaciones;

- comportamiento de la interfaz.

No define el diseño visual (colores, tipografía o estilos gráficos).

El diseño visual aplicable a esta especificación se define en el capítulo transversal «Design System de CarPlus», ubicado inmediatamente antes de esta fase.

200. Principios del Frontend

El frontend deberá diseñarse conforme a los siguientes principios fundamentales:

- Simplicidad.

- Claridad.

- Consistencia.

- Rapidez.

- Accesibilidad.

- Retroalimentación inmediata.

Toda interacción deberá comunicar claramente qué está ocurriendo.

201. Arquitectura General

El frontend se organizará en módulos independientes con responsabilidades claramente definidas para facilitar su mantenimiento y evolución.

Aplicación

**↓**

Autenticación

**↓**

Inicio

**↓**

Vehículos

**↓**

Investigaciones

**↓**

Conversación

**↓**

**Informe**

**↓**

Configuración

Cada módulo será responsable únicamente de su propia funcionalidad.

La distribución de plataformas, módulos de aplicación, experiencia de investigación, estado y servicios se presenta en la Figura de arquitectura 03.

Figura de arquitectura 03. Arquitectura frontend

**Descripción técnica. **El frontend prioriza la conversación y delega la lógica de investigación al backend. Los módulos cubren autenticación, inicio, vehículos, investigaciones, conversación, informe, historial y configuración. La capa de estado representa cargando, listo, enviando, procesando, éxito, error y sin conexión; el cliente API gestiona las comunicaciones y las validaciones protegen la entrada antes del envío.

202. Navegación

La navegación deberá ser sencilla y predecible.

**Flujo principal:**

Inicio

**↓**

Seleccionar o registrar vehículo

**↓**

Nueva investigación

**↓**

Conversación ⇄ Informe

**↓**

Historial

El usuario siempre deberá saber dónde se encuentra. Desde la pantalla de Informe, el usuario puede volver a Conversación para continuar investigando el mismo problema (generando una nueva versión del informe al analizar nuevamente, ver RI-009) o avanzar hacia Historial si decide finalizar el caso.

La Figura 1 muestra la pantalla «Splash Screen» en el contexto funcional descrito en esta sección.

Figura 1. Splash Screen.

**Descripción UX. **Presenta CarPlus y confirma el inicio de la aplicación antes de conducir a la autenticación. La composición mínima reduce fricción, refuerza que el producto investiga y orienta, y resuelve la sesión mediante una transición breve.

203. Pantalla de Inicio

Será el punto de entrada principal.

**Funciones:**

- mostrar vehículos;

- crear investigación;

- acceder al historial;

- acceder a configuración.

No mostrará información técnica innecesaria.

La Figura 7 muestra la pantalla «Dashboard» en el contexto funcional descrito en esta sección.

Figura 7. Dashboard.

**Descripción UX. **Da continuidad inmediata al vehículo activo, una investigación en curso y el informe reciente. Evita métricas decorativas y muestra únicamente información que permite decidir el siguiente paso.

La Figura 6 muestra la pantalla «Mis vehículos» en el contexto funcional descrito en esta sección.

Figura 6. Mis vehículos.

**Descripción UX. **Muestra los vehículos asociados a la cuenta y ofrece una entrada inequívoca para iniciar una investigación. Cada card prioriza identificación, configuración y estado, con acciones secundarias agrupadas.

204. Pantalla de Registro de Vehículo

Permitirá registrar un nuevo vehículo.

**Campos obligatorios:**

- Marca.

- Modelo.

- Año.

**Campos opcionales:**

- Motor.

- Kilometraje.

- Patente (opcional según país).

**Validaciones:**

- campos obligatorios;

- formato correcto;

- año válido.

La Figura 5 muestra la pantalla «Agregar vehículo» en el contexto funcional descrito en esta sección.

Figura 5. Agregar vehículo.

**Descripción UX. **Divide el registro del vehículo en cinco pasos dependientes. Marca, modelo y año utilizan selección controlada; motor se muestra cuando aplica y kilometraje admite una entrada numérica formateada.

205. Pantalla de Conversación

Representa el núcleo de la experiencia del usuario y concentra la mayor parte de la interacción con el sistema.

**Componentes principales:**

- historial de conversación;

- campo de texto;

- botones rápidos;

- adjuntar evidencia;

- indicador de progreso;

- botón "Analizar ahora".

Toda la interfaz deberá priorizar la conversación.

La Figura 9 muestra la pantalla «Chat de investigación» en el contexto funcional descrito en esta sección.

Figura 9. Chat de investigación.

**Descripción UX. **Recopila información mediante una conversación natural y estructurada. Presenta una pregunta por mensaje, combina respuestas rápidas con texto libre y mantiene el control del análisis en el usuario.

206. Pantalla de Informe

Presentará la versión vigente del informe de la investigación (ver RI-009 sobre versionado; el historial de versiones anteriores queda fuera del alcance del MVP conforme a la sección 48).

**Orden recomendado:**

- Resumen.

- Nivel de urgencia.

- Posibles causas.

- Evidencia utilizada.

- Qué revisar primero.

- Costos estimados.

- Limitaciones.

- Explícamelo fácil.

Cada sección deberá poder expandirse o contraerse. La pantalla deberá ofrecer la opción de continuar investigando el mismo problema (retorna a Conversación; ver Estado 7, Fase 6) además de la opción de finalizar el caso.

La Figura 15 muestra la pantalla «Informe técnico» en el contexto funcional descrito en esta sección.

Figura 15. Informe técnico.

**Descripción UX. **Presenta el resultado en un orden estable: resumen, urgencia, posibles causas, evidencia, revisión, costes y limitaciones. La urgencia es visible sin dramatización y las hipótesis nunca se presentan como diagnóstico.

207. Pantalla de Historial

Permitirá consultar investigaciones anteriores.

**Cada investigación mostrará como mínimo:**

- vehículo;

- fecha;

- estado;

- nivel de urgencia;

- versión del informe.

El historial nunca modificará investigaciones existentes.

La Figura 17 muestra la pantalla «Historial» en el contexto funcional descrito en esta sección.

Figura 17. Historial.

**Descripción UX. **Permite encontrar investigaciones anteriores por vehículo, fecha, estado y disponibilidad de informe. La lista es cronológica, buscable y filtrable, y cada fila mantiene una única entrada al detalle.

La Figura 18 muestra la pantalla «Detalle de investigación anterior» en el contexto funcional descrito en esta sección.

Figura 18. Detalle de investigación anterior.

**Descripción UX. **Reconstruye un caso pasado sin modificar la investigación original ni el informe. La vista es de solo lectura y separa resumen, evidencias, hipótesis y timeline sin perder el contexto.

208. Pantalla de Configuración

Permitirá administrar preferencias.

**Incluye:**

- perfil;

- idioma;

- notificaciones;

- privacidad;

- ayuda.

Las preferencias deberán sincronizarse con la cuenta del usuario.

La Figura 20 muestra la pantalla «Perfil» en el contexto funcional descrito en esta sección.

Figura 20. Perfil.

**Descripción UX. **Centraliza identidad, seguridad y acceso a preferencias sin introducir contenido de la investigación. La información personal se distingue de los ajustes y las acciones sensibles no compiten con la navegación.

La Figura 21 muestra la pantalla «Configuración» en el contexto funcional descrito en esta sección.

Figura 21. Configuración.

**Descripción UX. **Administra perfil, idioma, notificaciones, privacidad y ayuda. Las preferencias se agrupan en una lista breve, explican su alcance y se sincronizan sin alterar evidencias, hipótesis o informes.

La Figura 22 muestra la pantalla «Notificaciones» en el contexto funcional descrito en esta sección.

Figura 22. Notificaciones.

**Descripción UX. **Reúne avisos accionables relacionados con investigaciones, evidencia, informes y cuenta. Cada aviso explica qué cambió y abre el contexto exacto sin modificar el estado funcional del caso.

209. Componentes Reutilizables

El frontend utilizará componentes reutilizables.

**Ejemplos:**

- botones;

- tarjetas;

- cuadros de diálogo;

- indicadores de carga;

- listas;

- formularios;

- barras de progreso.

Los componentes deberán mantener un comportamiento uniforme.

210. Gestión del Estado

El frontend deberá gestionar estados claramente definidos para garantizar una experiencia consistente y predecible durante toda la interacción.

**Ejemplos:**

- cargando;

- listo;

- enviando;

- procesando;

- éxito;

- error;

- sin conexión.

Nunca deberán coexistir estados incompatibles.

211. Validaciones

Las validaciones deberán ejecutarse antes de enviar información al backend.

**Ejemplos:**

- campos obligatorios;

- longitud máxima;

- formato;

- archivos compatibles.

Las validaciones del frontend no reemplazan las del backend.

212. Carga de Evidencia

**El usuario podrá adjuntar:**

- imágenes;

- videos;

- audio.

**La interfaz deberá mostrar:**

- progreso de carga;

- estado del procesamiento;

- confirmación al finalizar.

El usuario podrá continuar interactuando mientras el archivo se procesa cuando sea posible.

213. Estados Vacíos

El frontend deberá contemplar estados sin contenido.

**Ejemplos:**

- sin vehículos;

- sin investigaciones;

- sin evidencia;

- sin conexión;

- sin resultados.

Cada estado deberá indicar claramente qué puede hacer el usuario a continuación.

La Figura 23 muestra la pantalla «Estado vacío» en el contexto funcional descrito en esta sección.

Figura 23. Estado vacío.

**Descripción UX. **Explica el valor de una sección cuando todavía no existe contenido y ofrece el siguiente paso correcto. Diferencia la ausencia de contenido de un error y no utiliza datos simulados.

La Figura 24 muestra la pantalla «Sin resultados» en el contexto funcional descrito en esta sección.

Figura 24. Sin resultados.

**Descripción UX. **Explica que una búsqueda válida no produjo coincidencias y facilita la recuperación. Mantiene visible la consulta, permite limpiar filtros y diferencia este patrón del estado vacío.

La Figura 25 muestra la pantalla «Offline» en el contexto funcional descrito en esta sección.

Figura 25. Offline.

**Descripción UX. **Protege el contexto durante una pérdida de conexión. Comunica qué información permanece guardada, qué acciones están limitadas y cómo se reanudará la sincronización sin generar hipótesis o informes nuevos.

214. Estados de Error

Toda situación inesperada deberá comunicarse claramente.

**Los mensajes deberán:**

- explicar el problema;

- evitar lenguaje técnico;

- proponer una acción para continuar.

Nunca deberán mostrar errores internos del sistema.

La Figura 26 muestra la pantalla «Error» en el contexto funcional descrito en esta sección.

Figura 26. Error.

**Descripción UX. **Comunica un fallo específico sin perder datos ni bloquear innecesariamente la investigación. Distingue qué falló, qué se conservó y qué acciones de recuperación están disponibles.

215. Estados de Carga

Cuando una operación requiera tiempo, la interfaz deberá mostrar indicadores apropiados.

**Ejemplos:**

- cargando conversación;

- procesando evidencia;

- generando informe;

- sincronizando datos.

El usuario nunca deberá percibir que la aplicación se ha bloqueado.

La Figura 27 muestra la pantalla «Loading» en el contexto funcional descrito en esta sección.

Figura 27. Loading.

**Descripción UX. **Representa una carga breve mediante skeletons que conservan la jerarquía esperada. Para procesos largos remite al patrón Procesando investigación y no comunica progreso falso.

216. Accesibilidad

El frontend deberá cumplir criterios básicos de accesibilidad.

**Como mínimo:**

- navegación mediante teclado;

- contraste adecuado;

- textos legibles;

- iconos acompañados por texto;

- objetivos táctiles de tamaño suficiente.

La accesibilidad deberá considerarse desde el inicio del desarrollo.

217. Rendimiento

La interfaz deberá priorizar la percepción de velocidad.

**Principios:**

- minimizar tiempos de espera;

- evitar recargas completas;

- cargar información progresivamente;

- reutilizar datos cuando sea apropiado.

La experiencia deberá mantenerse fluida incluso en dispositivos de gama media.

218. Responsive Design

**El ****frontend**** deberá adaptarse correctamente a:**

- teléfonos;

- tablets;

- navegadores web.

La funcionalidad deberá mantenerse consistente entre plataformas.

219. Requisitos del Frontend

**RFE-001**

Toda navegación deberá ser consistente.

**RFE-002**

El usuario siempre deberá conocer el estado actual de la investigación.

**RFE-003**

La conversación será el elemento principal de la aplicación.

**RFE-004**

Toda acción importante deberá generar retroalimentación inmediata.

**RFE-005**

Las validaciones deberán realizarse antes del envío al backend.

**RFE-006**

La interfaz deberá permanecer utilizable durante procesos largos.

**RFE-007**

Los componentes reutilizables deberán mantener comportamiento consistente.

**RFE-008**

Los estados vacíos deberán ofrecer una acción clara al usuario.

**RFE-009**

Los errores deberán comunicarse de forma comprensible.

**RFE-010**

El frontend deberá poder evolucionar sin modificar los contratos definidos por la API.

220. Evolución Futura

**En futuras versiones podrán incorporarse:**

- modo oscuro;

- widgets para escritorio;

- notificaciones inteligentes;

- soporte para Apple CarPlay y Android Auto;

- funcionamiento parcial sin conexión;

- personalización avanzada de la interfaz;

- animaciones adaptativas según el estado de la investigación.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 16 —*

***Nota de arquitectura***

El frontend de CarPlus no es simplemente una interfaz gráfica, sino el medio mediante el cual el usuario participa en el proceso de investigación. Su diseño debe minimizar la carga cognitiva y mantener el foco en la conversación y la evidencia. La interfaz debe adaptarse al flujo de la investigación, ofreciendo información clara en cada etapa sin exponer la complejidad interna del sistema.

FASE 17 — IMPLEMENTACIÓN DEL SISTEMA DE INTELIGENCIA ARTIFICIAL

221. Objetivo

221.1 Propósito

Esta fase establece el funcionamiento interno del Sistema de Inteligencia Artificial de CarPlus, definiendo las reglas que permiten mantener un comportamiento consistente, explicable e independiente del modelo utilizado.

Su propósito es establecer las responsabilidades, límites, flujos de razonamiento y reglas que deberá seguir cualquier modelo de inteligencia artificial utilizado por el producto.

El comportamiento esperado debe mantenerse estable incluso si el proveedor de IA cambia en el futuro.

221.2 Alcance

**Esta fase define:**

- responsabilidades de la IA;

- flujo de razonamiento;

- gestión del contexto;

- generación de hipótesis;

- uso de la Base de Conocimiento;

- criterios de calidad;

- restricciones del sistema.

No define prompts específicos ni configuraciones de modelos.

222. Principios Fundamentales

Todo Sistema de IA deberá operar conforme a los siguientes principios fundamentales:

- Investigar antes de concluir.

- Priorizar evidencia sobre probabilidades.

- Explicar cada conclusión.

- Reconocer incertidumbre.

- Adaptarse a nueva información.

- Mantener coherencia durante toda la investigación.

Estos principios prevalecen sobre cualquier comportamiento propio del modelo utilizado.

223. Rol del Sistema de IA

La IA actúa como un investigador técnico dentro de CarPlus, apoyando el proceso de investigación sin sustituir el juicio profesional.

**Sus responsabilidades incluyen:**

- interpretar información;

- identificar variables;

- generar hipótesis;

- detectar contradicciones;

- reducir incertidumbre;

- colaborar en la generación del informe.

La IA no reemplaza el criterio de un profesional.

224. Responsabilidades

**Durante una investigación la IA deberá:**

- comprender el problema descrito;

- analizar evidencia;

- actualizar variables;

- proponer hipótesis;

- seleccionar información relevante;

- identificar información faltante;

- sugerir nuevas preguntas;

- explicar sus conclusiones.

Cada responsabilidad deberá ser trazable.

225. Restricciones

**La IA nunca deberá:**

- emitir diagnósticos definitivos;

- inventar información;

- asumir respuestas implícitas;

- ignorar evidencia contradictoria;

- modificar registros históricos;

- eliminar hipótesis sin justificación;

- recomendar acciones peligrosas sin evidencia suficiente.

Cuando exista incertidumbre deberá reconocerla explícitamente.

226. Flujo de Razonamiento

Toda investigación seguirá el siguiente proceso.

Nueva información

**↓**

Interpretación

**↓**

Extracción de variables

**↓**

Actualización de evidencia

**↓**

Generación de hipótesis

**↓**

Detección de incertidumbre

**↓**

Selección de la mejor acción

Este flujo se repetirá continuamente durante la conversación.

227. Gestión del Contexto

La IA deberá mantener el contexto necesario para comprender la investigación de forma integral y garantizar respuestas coherentes durante toda la conversación.

**El contexto podrá incluir:**

- vehículo;

- conversación;

- variables;

- evidencia;

- hipótesis;

- historial de preguntas;

- respuestas anteriores.

El contexto nunca deberá depender únicamente de la memoria del modelo.

228. Gestión de Variables

Toda información relevante deberá transformarse en variables estructuradas.

**Ejemplos:**

- temperatura;

- velocidad;

- frecuencia;

- color del humo;

- intensidad;

- ubicación del ruido.

Las variables representan conocimiento estructurado y no lenguaje natural.

229. Generación de Hipótesis

**Las hipótesis deberán originarse únicamente a partir de:**

- evidencia registrada;

- variables estructuradas;

- patrones presentes en la Base de Conocimiento.

Nunca deberán generarse únicamente por frecuencia estadística del modelo.

Las hipótesis podrán fortalecerse, debilitarse o descartarse durante la investigación.

230. Gestión de la Incertidumbre

**La IA deberá identificar continuamente:**

- información conocida;

- información desconocida;

- contradicciones;

- evidencia insuficiente.

Cuando la incertidumbre sea elevada, el sistema deberá priorizar nuevas preguntas antes que nuevas conclusiones.

231. Selección de Preguntas

Cada nueva pregunta deberá cumplir al menos uno de los siguientes objetivos:

- confirmar una hipótesis;

- descartar una hipótesis;

- reducir incertidumbre;

- obtener evidencia relevante;

- resolver una contradicción.

Nunca deberán formularse preguntas redundantes.

232. Uso de la Base de Conocimiento

**La IA podrá consultar la Base de Conocimiento para:**

- encontrar patrones similares;

- recuperar variables relevantes;

- identificar investigaciones comparables;

- enriquecer explicaciones.

La Base de Conocimiento nunca sustituirá la evidencia del caso actual.

233. Explicabilidad

**Toda conclusión deberá poder responder:**

- ¿Qué evidencia la respalda?

- ¿Qué variables fueron consideradas?

- ¿Qué hipótesis fueron descartadas?

- ¿Por qué esta hipótesis permanece activa?

Si una conclusión no puede explicarse, no deberá aparecer en el informe.

234. Consistencia

Ante la misma información, la IA deberá producir resultados sustancialmente consistentes.

**Podrán variar:**

- redacción;

- ejemplos;

- orden de presentación.

**No deberán variar de forma significativa:**

- hipótesis;

- urgencia;

- evidencia utilizada;

- recomendaciones.

235. Manejo de Información Incompleta

La IA deberá reconocer cuando la información disponible sea insuficiente.

**En estos casos podrá:**

- solicitar más información;

- solicitar evidencia multimedia;

- indicar limitaciones del análisis.

Nunca deberá completar información faltante mediante suposiciones.

236. Manejo de Contradicciones

**Cuando detecte información incompatible deberá:**

- registrar la contradicción;

- solicitar aclaración;

- evitar conclusiones prematuras.

Las contradicciones permanecerán registradas hasta resolverse.

237. Priorización de Seguridad

Cuando exista evidencia compatible con situaciones potencialmente peligrosas, la IA deberá priorizar la seguridad del usuario.

**Ejemplos:**

- pérdida importante de líquido de frenos;

- humo intenso proveniente del motor;

- sobrecalentamiento severo;

- dirección con pérdida de asistencia;

- fallas importantes en el sistema de frenos.

En estos casos el informe deberá reflejar una urgencia elevada y recomendar una inspección profesional inmediata.

238. Independencia Tecnológica

La arquitectura deberá permitir sustituir el modelo de IA sin modificar:

- la conversación;

- el Motor de Investigación;

- la Base de Conocimiento;

- el formato del informe;

- las reglas del negocio.

El modelo constituye un componente reemplazable.

239. Evaluación del Sistema

El desempeño del Sistema de IA podrá evaluarse mediante indicadores que permitan medir su calidad y orientar su mejora continua:

- investigaciones completadas;

- hipótesis confirmadas posteriormente;

- tiempo promedio hasta el informe;

- satisfacción del usuario;

- reducción de preguntas innecesarias;

- calidad percibida de las explicaciones.

Estas métricas permitirán mejorar el sistema de forma continua.

240. Requisitos del Sistema de IA

**RSIA-011**

La IA deberá generar hipótesis únicamente a partir de evidencia registrada.

**RSIA-012**

Toda conclusión deberá ser explicable.

**RSIA-013**

La incertidumbre deberá comunicarse explícitamente cuando exista.

**RSIA-014**

Las contradicciones deberán registrarse y resolverse antes de fortalecer hipótesis relacionadas.

**RSIA-015**

La IA nunca deberá presentar un diagnóstico definitivo.

**RSIA-016**

El modelo utilizado deberá poder reemplazarse sin modificar la arquitectura del sistema.

**RSIA-017**

La IA deberá mantener consistencia durante toda la investigación.

**RSIA-018**

La Base de Conocimiento solo podrá utilizarse como apoyo al razonamiento.

**RSIA-019**

Toda explicación deberá indicar la evidencia utilizada.

**RSIA-020**

La seguridad del usuario tendrá prioridad sobre la generación de hipótesis.

241. Evolución Futura

**En futuras versiones el Sistema de IA podrá incorporar:**

- agentes especializados por sistema del vehículo (motor, transmisión, frenos, suspensión, sistema eléctrico, etc.);

- colaboración entre múltiples modelos de IA para validar hipótesis;

- razonamiento multimodal avanzado sobre imágenes, audio y video;

- aprendizaje continuo supervisado a partir de casos confirmados;

- optimización automática de estrategias de investigación según resultados históricos;

- explicación visual del razonamiento mediante diagramas de evidencia.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 17 —*

***Nota de arquitectura***

El Sistema de Inteligencia Artificial constituye el motor intelectual de CarPlus, pero no representa la totalidad del producto. Su función es colaborar con el Motor de Investigación para transformar evidencia en conocimiento útil mediante un proceso transparente, trazable y explicable. Al separar las reglas del negocio, la Base de Conocimiento y la lógica de investigación del modelo de IA, CarPlus puede evolucionar tecnológicamente sin comprometer la consistencia de sus investigaciones ni la confianza del usuario.

FASE 18 — GRAFO DE CONOCIMIENTO (KNOWLEDGE GRAPH)

242. Objetivo

242.1 Propósito

Esta fase establece la estructura del Grafo de Conocimiento de CarPlus, definiendo cómo se representan y relacionan los distintos elementos que intervienen en una investigación.

Su propósito es representar formalmente las relaciones existentes entre vehículos, sistemas, componentes, síntomas, variables, evidencia, hipótesis y reparaciones, permitiendo que el Motor de Investigación razone sobre dichas relaciones durante una investigación.

242.2 Alcance

**Esta fase define:**

- entidades del grafo;

- relaciones;

- reglas de construcción;

- consultas;

- actualización del conocimiento;

- restricciones.

No define la implementación técnica del motor del grafo.

243. Principios

El Grafo de Conocimiento deberá diseñarse conforme a los siguientes principios fundamentales:

- Representar relaciones explícitas.

- Mantener trazabilidad.

- Evitar duplicación de conocimiento.

- Permitir evolución continua.

- Ser independiente del modelo de IA.

- Priorizar conocimiento confirmado.

Las relaciones deberán representar hechos y no suposiciones.

244. Objetos del Grafo

El grafo se organizará mediante nodos y relaciones con significado explícito, permitiendo representar el conocimiento de forma estructurada y reutilizable.

**Principales tipos de nodos:**

- Vehículo.

- Sistema.

- Componente.

- Síntoma.

- Variable.

- Evidencia.

- Hipótesis.

- Reparación.

- Caso confirmado.

Cada nodo tendrá un identificador único.

245. Nodo Vehículo

Representa un modelo específico de vehículo.

**Ejemplos:**

- Peugeot 206 XR 1.6 2007.

- Toyota Corolla 2018.

- Mazda CX-5 2022.

**Podrá relacionarse con:**

- sistemas;

- componentes;

- investigaciones;

- patrones históricos.

246. Nodo Sistema

Representa un sistema mecánico del vehículo.

**Ejemplos:**

- Motor.

- Transmisión.

- Dirección.

- Frenos.

- Suspensión.

- Sistema eléctrico.

- Refrigeración.

- Escape.

Cada sistema agrupa múltiples componentes.

247. Nodo Componente

Representa una pieza específica.

**Ejemplos:**

- Bomba de agua.

- Radiador.

- Alternador.

- Embrague.

- Cremallera de dirección.

- Bomba hidráulica.

- Sensor MAF.

- Bobina de encendido.

Un componente podrá relacionarse con múltiples síntomas.

248. Nodo Síntoma

Representa una manifestación observable.

**Ejemplos:**

- Ruido metálico.

- Vibración.

- Humo blanco.

- Olor a combustible.

- Pérdida de potencia.

- Testigo de motor encendido.

- Dificultad para arrancar.

Los síntomas no representan fallas.

Representan observaciones.

249. Nodo Variable

Representa información estructurada.

**Ejemplos:**

- ocurre en frío;

- ocurre en caliente;

- aparece al acelerar;

- velocidad superior a 80 km/h;

- humo blanco;

- lado izquierdo.

Las variables permiten diferenciar investigaciones similares.

250. Nodo Evidencia

Representa cualquier información que respalde una investigación.

**Tipos:**

- fotografía;

- video;

- audio;

- texto;

- evidencia derivada.

Cada evidencia podrá respaldar múltiples variables.

251. Nodo Hipótesis

Representa una posible explicación.

**Ejemplos:**

- Bomba de agua defectuosa.

- Embrague desgastado.

- Fuga en radiador.

- Alternador defectuoso.

Las hipótesis nunca representan certeza.

252. Nodo Reparación

Representa la solución finalmente confirmada.

**Ejemplos:**

- reemplazo de embrague;

- cambio de bomba;

- reparación del radiador;

- sustitución de sensor.

Estas relaciones alimentan el aprendizaje.

253. Nodo Caso Confirmado

Representa investigaciones validadas posteriormente.

**Incluye:**

- vehículo;

- síntomas;

- evidencia;

- reparación;

- costos;

- calidad del caso.

Estos casos constituyen el principal origen del conocimiento.

254. Relaciones

El grafo utilizará relaciones explícitas para representar conexiones verificables entre los distintos tipos de nodos.

**Ejemplos:**

Vehículo TIENE

**↓**

Sistema CONTIENE

**↓**

Componente PUEDE_PRESENTAR

**↓**

Síntoma SE_DESCRIBE_MEDIANTE

**↓**

Variable RESPALDADA_POR

**↓**

Evidencia SUGIERE

**↓**

Hipótesis CONFIRMADA_POR

**↓**

Reparación

Cada relación tendrá un significado específico.

El flujo de conocimiento desde la observación del vehículo hasta la incorporación de conocimiento validado se muestra en la Figura de arquitectura 07.

Figura de arquitectura 07. Knowledge Graph

**Descripción técnica. **El grafo no diagnostica. El vehículo contextualiza síntomas observables; la evidencia registrada origina variables; las variables respaldan o contradicen hipótesis; las hipótesis se relacionan con componentes y sistemas; el caso conserva toda la trazabilidad. Solo una solución o reparación confirmada puede alimentar el Sistema de Aprendizaje y fortalecer conocimiento validado y versionado.

255. Relaciones Múltiples

Un nodo podrá participar en múltiples relaciones.

**Ejemplo:**

**Un síntoma puede estar asociado a:**

- varios componentes;

- múltiples hipótesis;

- distintos vehículos.

El conocimiento nunca deberá duplicarse.

256. Peso de las Relaciones

Las relaciones podrán almacenar atributos adicionales.

**Ejemplos:**

- número de casos;

- calidad promedio;

- fecha de actualización;

- origen;

- nivel de confianza interno.

Estos atributos son utilizados únicamente por el sistema.

Nunca serán visibles para el usuario.

257. Construcción del Grafo

El conocimiento permanente solo podrá incorporarse a partir de fuentes validadas, tales como:

- casos confirmados;

- documentación técnica validada;

- reglas definidas por el producto.

Las conversaciones sin confirmar no crearán relaciones permanentes.

258. Actualización

**Cuando un nuevo caso sea confirmado:**

Caso Confirmado

**↓**

Validación

**↓**

Extracción de relaciones

**↓**

Actualización del Grafo

**↓**

Disponible para futuras investigaciones

Las relaciones existentes podrán fortalecerse.

Nunca deberán eliminarse automáticamente.

259. Consultas

**El Motor de Investigación podrá realizar consultas como:**

- ¿Qué componentes suelen producir este síntoma?

- ¿Qué variables diferencian estas hipótesis?

- ¿Qué evidencia suele ser más útil?

- ¿Qué reparaciones fueron confirmadas en casos similares?

- ¿Qué preguntas reducen mejor la incertidumbre?

Las respuestas servirán como apoyo.

Nunca reemplazarán la evidencia del caso actual.

260. Prevención de Contaminación

El sistema deberá impedir que información incorrecta degrade el conocimiento.

**No podrán incorporarse automáticamente:**

- casos incompletos;

- investigaciones abandonadas;

- hipótesis no confirmadas;

- evidencia insuficiente;

- datos contradictorios sin resolver.

La calidad tendrá prioridad sobre la cantidad.

261. Independencia Tecnológica

**El Grafo de Conocimiento deberá ser independiente:**

- del modelo de IA;

- del motor de base de datos;

- del backend;

- del frontend.

Podrá migrarse entre distintas tecnologías sin alterar su estructura lógica.

262. Requisitos del Grafo

**RKG-001**

Todo nodo deberá poseer un identificador único.

**RKG-002**

Toda relación deberá representar un significado explícito.

**RKG-003**

Las relaciones deberán mantener trazabilidad hacia su origen.

**RKG-004**

El conocimiento permanente solo podrá originarse en información validada.

**RKG-005**

El Grafo nunca reemplazará la evidencia del caso actual.

**RKG-006**

Las relaciones deberán poder evolucionar sin eliminar el historial.

**RKG-007**

El sistema deberá impedir relaciones duplicadas.

**RKG-008**

Toda actualización deberá registrarse para auditoría.

**RKG-009**

Las consultas al Grafo deberán ser independientes del modelo de IA.

**RKG-010**

La estructura deberá permitir incorporar nuevos tipos de nodos y relaciones sin rediseñar el sistema.

263. Evolución Futura

**En versiones posteriores el Grafo podrá incorporar:**

- relaciones probabilísticas basadas en evidencia histórica;

- conocimiento específico por fabricante;

- relaciones temporales (fallas que evolucionan con el tiempo);

- análisis predictivo de mantenimiento;

- grafos especializados para vehículos eléctricos e híbridos;

- integración con documentación técnica de fabricantes.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 18 —*

***Nota de arquitectura***

El Grafo de Conocimiento representa la estructura lógica del conocimiento de CarPlus. Mientras la Base de Conocimiento almacena información y el Sistema de IA razona sobre ella, el Grafo define cómo todo está conectado. Esta separación permite que el producto evolucione sin depender de un modelo de inteligencia artificial específico y convierte el conocimiento acumulado en un activo estratégico reutilizable, trazable y escalable.

**Revisión Editorial – Versión 1.2**

**Cambios realizados:**

Se recomienda interpretar la Fase 17 como una especificación técnica que complementa la Fase 3 (visión funcional de la IA), evitando considerarlas duplicadas.

Se revisó la coherencia general de la estructura. No se detectaron problemas relevantes en la secuencia de fases.

Se mantiene la repetición deliberada de algunos principios fundamentales para que cada fase pueda leerse de forma independiente.

Se propone continuar con las fases: Seguridad y Privacidad, Infraestructura y Despliegue, Testing y QA, Monitoreo y Observabilidad, Escalabilidad y Roadmap Técnico.

FASE 19 — SEGURIDAD Y PRIVACIDAD

264. Objetivo

264.1 Propósito

Esta fase establece los principios, requisitos y mecanismos de seguridad que protegerán la información administrada por CarPlus durante todo el ciclo de vida de una investigación.

El objetivo es garantizar la confidencialidad, integridad y disponibilidad de la información del usuario sin afectar la simplicidad de la experiencia.

264.2 Alcance

**Esta fase define:**

- autenticación;

- autorización;

- protección de datos;

- almacenamiento seguro;

- gestión de evidencia;

- privacidad;

- auditoría;

- cumplimiento normativo.

No define la implementación específica de cada tecnología.

265. Principios de Seguridad

La arquitectura de CarPlus deberá diseñarse conforme a los siguientes principios de seguridad:

- Seguridad desde el diseño (Security by Design).

- Privacidad desde el diseño (Privacy by Design).

- Mínimo privilegio.

- Defensa en profundidad.

- Trazabilidad completa.

- Transparencia hacia el usuario.

La seguridad deberá incorporarse desde la arquitectura y no agregarse posteriormente.

266. Autenticación

El sistema deberá proporcionar mecanismos que permitan identificar de forma segura a cada usuario, preservando la integridad del proceso de autenticación.

**En el MVP podrán utilizarse mecanismos como:**

- correo electrónico;

- proveedores OAuth;

- autenticación mediante Apple;

- autenticación mediante Google.

La arquitectura deberá permitir incorporar nuevos mecanismos sin modificar el resto del sistema.

267. Autorización

Toda solicitud deberá ejecutarse únicamente si el usuario posee permisos suficientes.

**El sistema deberá impedir que un usuario pueda acceder a:**

- investigaciones ajenas;

- vehículos ajenos;

- evidencia de terceros;

- informes de otros usuarios.

Toda autorización deberá validarse en el Backend.

Nunca únicamente en el Frontend.

268. Gestión de Sesiones

Las sesiones deberán cumplir los siguientes principios.

- expiración controlada;

- renovación segura;

- invalidación al cerrar sesión;

- protección frente a reutilización de credenciales.

Las credenciales nunca deberán almacenarse en texto plano.

269. Protección de Datos Personales

CarPlus recopilará únicamente la información necesaria para ejecutar la investigación.

**Ejemplos:**

- información del vehículo;

- conversaciones;

- evidencia multimedia;

- resultados de la investigación.

El sistema deberá evitar recopilar información innecesaria.

270. Protección de Evidencia

La evidencia multimedia constituye uno de los activos más sensibles de CarPlus y deberá protegerse durante todo su ciclo de vida.

Toda evidencia deberá almacenarse de forma segura.

**Cada archivo deberá mantener:**

- propietario;

- fecha;

- tipo;

- origen;

- integridad.

La evidencia nunca deberá ser pública por defecto.

271. Cifrado

Toda comunicación entre componentes deberá utilizar conexiones cifradas.

**Ejemplos:**

- aplicación ↔ backend;

- backend ↔ almacenamiento;

- backend ↔ proveedor de IA;

- backend ↔ base de datos.

La información sensible deberá permanecer cifrada durante su almacenamiento cuando corresponda.

272. Gestión de Archivos

Los archivos enviados por el usuario deberán validarse antes de procesarse.

**El sistema deberá verificar, entre otros aspectos:**

- formato;

- tamaño;

- integridad;

- contenido permitido.

Los archivos inválidos deberán rechazarse antes de ingresar al sistema.

273. Protección frente a Uso Malicioso

El sistema deberá incorporar mecanismos para reducir riesgos como:

- automatización abusiva;

- spam;

- cargas masivas;

- intentos reiterados de autenticación;

- abuso de recursos computacionales.

La protección deberá minimizar el impacto sobre usuarios legítimos.

274. Registro de Auditoría

Todas las acciones relevantes deberán registrarse para garantizar trazabilidad, auditoría y análisis posterior de incidentes:

**Ejemplos:**

- inicio de sesión;

- creación de investigaciones;

- carga de evidencia;

- generación de informes;

- eliminación de información;

- cambios administrativos.

El registro deberá ser inmutable.

275. Privacidad

**El usuario deberá conocer claramente:**

- qué información se almacena;

- para qué se utiliza;

- cuánto tiempo permanece almacenada;

- cuándo puede eliminarse.

La política de privacidad deberá ser fácilmente accesible.

276. Retención de Datos

La información deberá conservarse únicamente durante el tiempo necesario para cumplir los objetivos del producto y las obligaciones legales aplicables.

El sistema deberá permitir eliminar información cuando corresponda.

La eliminación deberá respetar las políticas de auditoría.

277. Uso de Datos para Aprendizaje

Los casos confirmados podrán utilizarse para mejorar el conocimiento del sistema.

Cuando corresponda, los datos utilizados para aprendizaje deberán anonimizarse o pseudonimizarse antes de incorporarse a la Base de Conocimiento.

La información personal no deberá utilizarse como insumo para el aprendizaje del sistema.

278. Cumplimiento Normativo

La arquitectura deberá facilitar el cumplimiento de regulaciones aplicables relacionadas con protección de datos personales.

**Entre ellas podrán considerarse:**

- Reglamento General de Protección de Datos (GDPR);

- legislación chilena vigente sobre protección de datos personales;

- futuras regulaciones aplicables en los mercados donde opere CarPlus.

279. Gestión de Incidentes

El sistema deberá disponer de procedimientos para responder ante incidentes de seguridad.

**Como mínimo deberán contemplarse:**

- identificación;

- contención;

- investigación;

- recuperación;

- documentación.

Cada incidente deberá quedar registrado para futuras mejoras.

280. Requisitos de Seguridad

**RSEC-001**

Toda comunicación deberá realizarse mediante canales cifrados.

**RSEC-002**

Todo usuario deberá autenticarse antes de acceder a información privada.

**RSEC-003**

Toda autorización deberá validarse en el Backend.

**RSEC-004**

La evidencia multimedia deberá almacenarse de forma segura.

**RSEC-005**

Los archivos enviados deberán validarse antes de procesarse.

**RSEC-006**

Toda acción relevante deberá registrarse en un sistema de auditoría.

**RSEC-007**

La arquitectura deberá minimizar la recopilación de datos personales.

**RSEC-008**

El sistema deberá permitir la eliminación de información conforme a las políticas definidas.

**RSEC-009**

Los datos utilizados para aprendizaje deberán proteger la privacidad de los usuarios.

**RSEC-010**

La seguridad deberá mantenerse independiente del proveedor de infraestructura o del modelo de IA utilizado.

281. Evolución Futura

**En futuras versiones podrán incorporarse:**

- autenticación multifactor (MFA);

- detección automática de comportamientos anómalos;

- cifrado administrado por el cliente;

- clasificación automática de información sensible;

- gestión avanzada de consentimiento;

- certificaciones de seguridad (ISO 27001, SOC 2).

Estas capacidades no forman parte del alcance del MVP.

*— Fin de la Fase 19 —*

***Nota de arquitectura***

La seguridad en CarPlus no constituye un componente aislado, sino una propiedad transversal del sistema. Todos los módulos —Frontend, Backend, Base de Datos, Sistema de IA, Base de Conocimiento y Grafo de Conocimiento— deben operar bajo principios comunes de protección, privacidad y trazabilidad. Esto permite que la plataforma evolucione sin comprometer la confianza de los usuarios ni la integridad de la información.

FASE 20 — INFRAESTRUCTURA Y DESPLIEGUE

282. Objetivo

282.1 Propósito

Esta fase establece la arquitectura de infraestructura necesaria para desplegar, ejecutar y mantener CarPlus en entornos de producción de forma segura, escalable y mantenible.

Su propósito es garantizar que la plataforma pueda operar de forma segura, escalable, resiliente y mantenible, independientemente del proveedor de infraestructura utilizado.

282.2 Alcance

**Esta fase define:**

- arquitectura de despliegue;

- ambientes;

- servicios;

- almacenamiento;

- redes;

- integración continua;

- entrega continua;

- recuperación ante desastres.

No define tecnologías específicas obligatorias.

283. Principios de Infraestructura

La infraestructura deberá diseñarse conforme a los siguientes principios fundamentales:

- Independencia del proveedor.

- Alta disponibilidad.

- Escalabilidad horizontal.

- Automatización.

- Observabilidad.

- Recuperación rápida.

- Seguridad por defecto.

- Infraestructura como código.

Toda infraestructura deberá poder reproducirse automáticamente.

284. Arquitectura General

La infraestructura se organizará en componentes independientes que colaboran para soportar el funcionamiento del producto:

Usuario

**↓**

Aplicación Móvil

**↓**

API Gateway

**↓**

Backend

**↓**

Servicios Internos

**↓**

Base de Datos / Almacenamiento Multimedia / Base de Conocimiento

**↓**

Proveedor de IA

Cada componente podrá evolucionar independientemente.

La topología lógica de entrada, cómputo, procesamiento asíncrono, persistencia y operación se representa en la Figura de arquitectura 06.

Figura de arquitectura 06. Infraestructura

**Descripción técnica. **La topología sigue la Fase 20: clientes, API Gateway, backend y servicios internos se despliegan de forma desacoplada; bases de datos, almacenamiento multimedia y conocimiento evolucionan por separado; tareas largas se procesan de forma asíncrona; configuración, secretos, backups y observabilidad son capacidades transversales. La representación permanece desacoplada de productos y proveedores concretos.

285. Ambientes

El sistema deberá mantener ambientes separados.

**Como mínimo existirán:**

- Desarrollo (Development)

- Pruebas (Testing)

- Staging

- Producción

Cada ambiente tendrá recursos independientes.

Los datos de producción nunca deberán utilizarse directamente durante el desarrollo.

286. Infraestructura como Código

Toda la infraestructura deberá poder definirse mediante código.

**Esto permitirá:**

- reproducibilidad;

- control de versiones;

- auditoría;

- automatización;

- recuperación rápida.

Las modificaciones manuales deberán evitarse.

287. Contenedores

Los servicios deberán diseñarse para ejecutarse mediante contenedores.

**Beneficios:**

- portabilidad;

- aislamiento;

- despliegue consistente;

- facilidad para escalar;

- simplificación del mantenimiento.

La arquitectura no dependerá de un sistema específico de contenedores.

288. Orquestación

La plataforma deberá permitir administrar múltiples instancias de cada servicio.

**La orquestación deberá facilitar:**

- escalamiento;

- recuperación automática;

- balanceo;

- actualizaciones graduales.

El mecanismo utilizado podrá cambiar sin modificar la arquitectura lógica.

289. API Gateway

Toda comunicación externa deberá ingresar por un único punto de acceso.

**Responsabilidades:**

- autenticación;

- autorización;

- rate limiting;

- registro de solicitudes;

- enrutamiento;

- versionado de la API.

Los servicios internos no deberán exponerse directamente.

290. Balanceo de Carga

El sistema deberá distribuir automáticamente las solicitudes entre múltiples instancias disponibles.

**Objetivos:**

- mejorar disponibilidad;

- reducir tiempos de respuesta;

- evitar sobrecarga.

El balanceador deberá detectar servicios no disponibles.

291. Almacenamiento

La infraestructura deberá separar claramente los distintos tipos de información.

**Ejemplos:**

**Base de Datos**

- usuarios;

- vehículos;

- investigaciones.

**Almacenamiento multimedia**

- imágenes;

- videos;

- audio.

**Base de Conocimiento**

- patrones;

- casos;

- relaciones.

Cada tipo de información podrá evolucionar independientemente.

292. CDN

Los archivos multimedia podrán distribuirse mediante una red de entrega de contenido (CDN).

**Beneficios:**

- menor latencia;

- reducción de carga;

- mejor experiencia internacional.

Esta capacidad queda preparada para futuras versiones.

293. Caché

El sistema podrá utilizar mecanismos de caché para reducir operaciones repetitivas.

**Ejemplos:**

- configuración;

- catálogos;

- información de vehículos;

- consultas frecuentes.

La caché nunca deberá convertirse en la fuente principal de verdad.

294. Procesamiento Asíncrono

Las tareas de larga duración deberán ejecutarse de forma asíncrona.

**Ejemplos:**

- análisis de imágenes;

- procesamiento de videos;

- generación de audio;

- aprendizaje;

- generación de reportes complejos.

El usuario deberá recibir retroalimentación mientras estas tareas se ejecutan.

295. Integración Continua

Todo cambio de código deberá atravesar un proceso automatizado de validación antes de avanzar entre ambientes:

**Como mínimo incluirá:**

- compilación;

- análisis estático;

- pruebas automatizadas;

- generación de artefactos.

Solo el código validado podrá avanzar al siguiente ambiente.

296. Despliegue Continuo

La plataforma deberá permitir desplegar nuevas versiones con mínima interrupción del servicio.

**Los despliegues deberán:**

- ser repetibles;

- permitir reversión (rollback);

- minimizar indisponibilidad.

El flujo de integración continua, despliegue continuo, promoción entre ambientes y continuidad operacional se detalla en la Figura de arquitectura 11.

Figura de arquitectura 11. Despliegue

**Descripción técnica. **Los cambios pasan por integración continua —compilación, análisis estático, pruebas y artefactos— y por despliegue continuo con reversión. Desarrollo, Testing, Staging y Producción utilizan recursos independientes. La infraestructura se define como código; configuración y secretos se separan del código; backups y recuperación protegen la continuidad operacional.

297. Gestión de Configuración

La configuración deberá mantenerse separada del código.

**Ejemplos:**

- claves;

- URLs;

- proveedores;

- parámetros.

Nunca deberá almacenarse información sensible dentro del repositorio.

298. Gestión de Secretos

Las credenciales deberán administrarse mediante un sistema especializado.

**Ejemplos:**

- tokens;

- claves API;

- certificados;

- contraseñas.

Las credenciales nunca deberán almacenarse en texto plano.

299. Backups

La plataforma deberá realizar respaldos automáticos.

**Como mínimo deberán respaldarse:**

- base de datos;

- investigaciones;

- configuración crítica.

Los respaldos deberán verificarse periódicamente.

300. Recuperación ante Desastres

La arquitectura deberá permitir recuperar el servicio de forma controlada tras un incidente grave, preservando la integridad de la información.

**El proceso deberá contemplar:**

- recuperación de datos;

- restauración de servicios;

- validación de integridad;

- reanudación del servicio.

Los procedimientos deberán documentarse.

301. Alta Disponibilidad

La infraestructura deberá minimizar puntos únicos de falla.

Siempre que sea posible deberán existir mecanismos redundantes para los componentes críticos.

La indisponibilidad de un servicio no deberá comprometer la integridad de los casos almacenados.

302. Portabilidad

La arquitectura deberá permitir migrar entre proveedores de infraestructura sin rediseñar el sistema.

El diseño evitará dependencias innecesarias con servicios propietarios.

303. Requisitos de Infraestructura

**RINF-001**

La infraestructura deberá soportar múltiples ambientes independientes.

**RINF-002**

Toda infraestructura deberá poder reproducirse automáticamente.

**RINF-003**

Los servicios deberán ejecutarse de forma desacoplada.

**RINF-004**

Toda configuración deberá mantenerse separada del código fuente.

**RINF-005**

Las credenciales deberán administrarse mediante un sistema seguro.

**RINF-006**

Los despliegues deberán permitir rollback.

**RINF-007**

La infraestructura deberá permitir escalamiento horizontal.

**RINF-008**

Los respaldos deberán ejecutarse automáticamente.

**RINF-009**

El sistema deberá recuperarse ante fallas críticas mediante procedimientos documentados.

**RINF-010**

La infraestructura deberá permanecer independiente del proveedor cloud utilizado.

304. Evolución Futura

**En futuras versiones podrán incorporarse:**

- despliegue multi-región;

- edge computing;

- autoescalado predictivo;

- despliegues canary;

- despliegues blue-green;

- optimización automática de costos;

- infraestructura híbrida.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 20 —*

***Nota de arquitectura***

La infraestructura representa la base operativa de CarPlus. Su función es proporcionar un entorno confiable para que los componentes definidos en las fases anteriores puedan ejecutarse sin depender de una tecnología, proveedor o plataforma específica. La separación entre arquitectura lógica e infraestructura permite que el producto evolucione, cambie de proveedor cloud o incorpore nuevos servicios sin alterar el comportamiento funcional definido por el PRD.

FASE 21 — TESTING Y ASEGURAMIENTO DE LA CALIDAD (QUALITY ASSURANCE)

305. Objetivo

305.1 Propósito

Esta fase establece la estrategia de pruebas que garantizará la calidad funcional, técnica y operativa de CarPlus a lo largo de todo su ciclo de desarrollo.

El objetivo es detectar errores tempranamente, reducir regresiones y asegurar que cada nueva versión mantenga el comportamiento esperado del producto.

305.2 Alcance

**Esta fase define:**

- estrategia de pruebas;

- niveles de testing;

- validación funcional;

- pruebas de inteligencia artificial;

- criterios de aceptación;

- calidad del software.

No define herramientas específicas de testing.

306. Principios de Calidad

La estrategia de calidad de CarPlus deberá regirse por los siguientes principios fundamentales:

- La calidad es responsabilidad de todo el equipo.

- Todo cambio debe ser verificable.

- Las pruebas deben automatizarse cuando sea posible.

- La prevención tiene prioridad sobre la corrección.

- La calidad debe medirse continuamente.

- Ningún cambio debe degradar funcionalidades existentes.

Las pruebas forman parte del desarrollo y no una etapa posterior.

307. Estrategia General

La estrategia de calidad combinará distintos niveles de pruebas complementarias para validar el producto desde diferentes perspectivas:

Pruebas Unitarias

**↓**

Pruebas de Integración

**↓**

Pruebas End-to-End

**↓**

Pruebas de IA

**↓**

Validación Manual

**↓**

Liberación

Cada nivel deberá validar responsabilidades distintas.

308. Pruebas Unitarias

Las pruebas unitarias validarán componentes individuales de forma aislada.

**Ejemplos:**

- validaciones;

- reglas de negocio;

- transformaciones de datos;

- cálculos;

- servicios internos.

Cada prueba deberá ejecutarse de manera independiente.

309. Pruebas de Integración

Las pruebas de integración verificarán la comunicación entre componentes.

**Ejemplos:**

- Frontend ↔ Backend;

- Backend ↔ Base de Datos;

- Backend ↔ IA;

- Backend ↔ Base de Conocimiento;

- Backend ↔ almacenamiento multimedia.

Estas pruebas asegurarán que la interacción entre servicios sea correcta.

310. Pruebas End-to-End

Las pruebas End-to-End validarán la experiencia completa del usuario.

**Ejemplo:**

Registrar vehículo

**↓**

Iniciar investigación

**↓**

Responder preguntas

**↓**

Adjuntar evidencia

**↓**

Analizar

**↓**

Generar informe

**↓**

Guardar caso

Todo el flujo deberá completarse correctamente.

311. Pruebas del Sistema de IA

El Sistema de IA deberá evaluarse mediante escenarios controlados que permitan medir la calidad y consistencia de su comportamiento.

**Se verificará, entre otros aspectos:**

- comprensión del contexto;

- consistencia;

- reducción de incertidumbre;

- explicación de resultados;

- adaptación de preguntas;

- reconocimiento de evidencia insuficiente.

La evaluación no deberá basarse únicamente en precisión.

312. Casos de Prueba

Cada funcionalidad deberá contar con casos de prueba documentados.

**Cada caso incluirá:**

- objetivo;

- precondiciones;

- pasos;

- resultado esperado;

- criterios de aprobación.

Los casos deberán mantenerse versionados.

313. Pruebas de Regresión

Toda modificación deberá comprobar que funcionalidades existentes continúan funcionando correctamente.

Las regresiones deberán detectarse antes del despliegue.

Las pruebas automatizadas tendrán prioridad.

314. Pruebas de Rendimiento

La plataforma deberá evaluarse bajo distintas cargas.

**Ejemplos:**

- múltiples investigaciones simultáneas;

- carga masiva de evidencia;

- generación concurrente de informes.

El objetivo es mantener una experiencia consistente.

315. Pruebas de Seguridad

La estrategia de calidad incluirá pruebas relacionadas con seguridad.

**Ejemplos:**

- autenticación;

- autorización;

- validación de archivos;

- protección de datos;

- gestión de sesiones.

Estas pruebas complementan los requisitos definidos en la Fase 19.

316. Pruebas de Usabilidad

La experiencia del usuario deberá evaluarse mediante pruebas con usuarios reales.

**Se observarán aspectos como:**

- facilidad de uso;

- comprensión del lenguaje;

- claridad de las preguntas;

- comprensión del informe;

- facilidad para adjuntar evidencia.

Los resultados servirán para mejorar la UX.

317. Validación de la Base de Conocimiento

Las actualizaciones de la Base de Conocimiento deberán validarse antes de incorporarse al sistema.

**Se comprobará:**

- consistencia;

- ausencia de duplicados;

- trazabilidad;

- calidad del conocimiento.

Ningún caso de baja calidad deberá incorporarse automáticamente.

318. Validación del Grafo de Conocimiento

Las nuevas relaciones incorporadas al Grafo deberán verificarse.

**Se validará:**

- integridad;

- relaciones válidas;

- ausencia de ciclos incorrectos;

- coherencia estructural.

El grafo deberá permanecer consistente.

319. Datos de Prueba

Las pruebas deberán ejecutarse utilizando datos controlados.

**Se utilizarán:**

- vehículos simulados;

- conversaciones de prueba;

- evidencia sintética;

- escenarios conocidos.

Los datos reales de usuarios no deberán utilizarse para pruebas ordinarias.

320. Automatización

Siempre que sea posible, las pruebas deberán ejecutarse automáticamente.

**La automatización permitirá:**

- detectar errores tempranos;

- reducir trabajo manual;

- aumentar la confiabilidad;

- facilitar despliegues frecuentes.

321. Criterios de Aceptación

Una funcionalidad podrá considerarse terminada únicamente cuando:

- cumpla los requisitos definidos;

- supere las pruebas correspondientes;

- no introduzca regresiones;

- respete los principios del producto;

- sea aprobada durante la revisión técnica.

322. Definition of Done

Una funcionalidad se considerará finalizada cuando cumpla, como mínimo:

- implementación completada;

- revisión de código aprobada;

- pruebas unitarias exitosas;

- pruebas de integración exitosas;

- documentación actualizada;

- requisitos satisfechos;

- despliegue exitoso en el ambiente correspondiente.

323. Calidad Continua

La calidad del producto deberá medirse de forma continua mediante indicadores que permitan detectar oportunidades de mejora y prevenir regresiones:

**Ejemplos:**

- cobertura de pruebas;

- errores detectados;

- errores corregidos;

- regresiones;

- tiempo promedio de resolución;

- estabilidad de las versiones.

Estas métricas servirán para mejorar el proceso de desarrollo.

324. Requisitos de Calidad

**RQA-001**

Toda funcionalidad deberá contar con pruebas documentadas.

**RQA-002**

Toda modificación deberá superar pruebas de regresión.

**RQA-003**

Las pruebas automatizadas deberán ejecutarse antes del despliegue.

**RQA-004**

El Sistema de IA deberá evaluarse mediante escenarios controlados que permitan medir la calidad y consistencia de su comportamiento.

**RQA-005**

Los datos de usuarios reales no deberán utilizarse para pruebas ordinarias.

**RQA-006**

Toda funcionalidad deberá cumplir sus criterios de aceptación antes de considerarse finalizada.

**RQA-007**

La Base de Conocimiento deberá validarse antes de actualizarse.

**RQA-008**

El Grafo de Conocimiento deberá mantener consistencia estructural.

**RQA-009**

Toda versión deberá registrar los resultados de sus pruebas.

**RQA-010**

La estrategia de calidad deberá evolucionar junto con el producto.

325. Evolución Futura

**En versiones posteriores podrán incorporarse:**

- generación automática de casos de prueba mediante IA;

- simulaciones masivas de investigaciones;

- validación automática del razonamiento de la IA;

- pruebas de resiliencia distribuidas;

- benchmarking entre modelos de IA;

- análisis predictivo de defectos.

Estas capacidades no forman parte del MVP.

*— Fin de la Fase 21 —*

***Nota de arquitectura***

La estrategia de calidad de CarPlus no busca únicamente detectar errores, sino garantizar que cada evolución del producto preserve sus principios fundamentales: investigación basada en evidencia, reducción de incertidumbre, explicabilidad y confianza. Las pruebas abarcan tanto el software tradicional como el comportamiento del Sistema de IA, la Base de Conocimiento y el Grafo de Conocimiento, asegurando que la plataforma evolucione de manera consistente, verificable y mantenible.

FASE 22 — OBSERVABILIDAD, MONITOREO Y OPERACIÓN

326. Objetivo

326.1 Propósito

Esta fase establece los mecanismos necesarios para supervisar el funcionamiento de CarPlus en tiempo real, detectar incidentes, analizar el comportamiento del sistema y facilitar su operación continua.

El objetivo es proporcionar la visibilidad necesaria para mantener la disponibilidad, el rendimiento y la confiabilidad de la plataforma a medida que evoluciona.

326.2 Alcance

**Esta fase define:**

- observabilidad;

- monitoreo;

- registro de eventos;

- métricas;

- alertas;

- trazabilidad;

- operación;

- respuesta a incidentes.

No define herramientas específicas de monitoreo.

327. Principios de Observabilidad

La estrategia de observabilidad deberá diseñarse conforme a los siguientes principios fundamentales:

- Visibilidad completa del sistema.

- Información accionable.

- Detección temprana.

- Baja intrusión.

- Trazabilidad extremo a extremo.

- Mejora continua.

Todo componente deberá exponer información suficiente para comprender su comportamiento.

328. Arquitectura de Observabilidad

La observabilidad deberá abarcar todos los componentes del sistema para proporcionar una visión integral de su estado operativo:

Frontend

**↓**

API Gateway

**↓**

Backend

**↓**

Servicios Internos

**↓**

**Base de Datos**

**↓**

Sistema de IA

**↓**

**Base de Conocimiento**

**↓**

Infraestructura

Cada componente deberá generar información operacional consistente.

La cadena de señales, correlación, visibilidad y operación que permite la trazabilidad completa se representa en la Figura de arquitectura 08.

Figura de arquitectura 08. Observabilidad

**Descripción técnica. **Frontend, API Gateway, backend, servicios internos, base de datos, Sistema de IA, Base de Conocimiento e infraestructura generan telemetría estructurada. Un identificador único permite seguir la investigación extremo a extremo. Logs, métricas y trazas alimentan dashboards, alertas, gestión de incidentes y postmortems respetando privacidad y protección de datos.

329. Logging

Todos los componentes deberán registrar los eventos relevantes de manera consistente para facilitar el diagnóstico y la trazabilidad.

**Los registros podrán incluir:**

- solicitudes recibidas;

- errores;

- advertencias;

- cambios de estado;

- eventos críticos;

- información de diagnóstico.

Los registros deberán mantener un formato uniforme.

330. Niveles de Registro

Los eventos registrados deberán clasificarse según su importancia.

**Como mínimo existirán los niveles:**

- Debug;

- Information;

- Warning;

- Error;

- Critical.

Cada nivel facilitará la priorización de incidentes.

331. Trazabilidad Distribuida

Cada investigación deberá poder seguirse a través de todos los componentes involucrados.

**La trazabilidad permitirá identificar:**

- origen de una solicitud;

- servicios utilizados;

- tiempos de procesamiento;

- errores ocurridos;

- resultado final.

Cada solicitud deberá poseer un identificador único.

332. Métricas Operacionales

La plataforma deberá recopilar métricas relacionadas con su funcionamiento.

**Ejemplos:**

- tiempo de respuesta;

- solicitudes por minuto;

- utilización de CPU;

- utilización de memoria;

- uso de almacenamiento;

- disponibilidad;

- tasa de errores.

Estas métricas permitirán evaluar el estado del sistema.

333. Métricas del Producto

Además de las métricas técnicas, deberán recopilarse indicadores relacionados con el uso del producto.

**Ejemplos:**

- investigaciones iniciadas;

- investigaciones finalizadas;

- informes generados;

- evidencia cargada;

- duración promedio de una investigación;

- frecuencia de uso.

Estas métricas facilitarán la evolución del producto.

334. Métricas del Sistema de IA

El Sistema de IA deberá exponer indicadores específicos.

**Ejemplos:**

- tiempo promedio de respuesta;

- cantidad de preguntas realizadas;

- duración de cada investigación;

- uso de herramientas;

- errores del proveedor de IA;

- solicitudes fallidas.

Las métricas permitirán evaluar el desempeño operativo sin comprometer la privacidad del usuario.

335. Dashboards

La información operacional deberá visualizarse mediante paneles de monitoreo.

**Los paneles podrán agrupar indicadores como:**

- disponibilidad;

- rendimiento;

- errores;

- utilización de recursos;

- estado de servicios;

- investigaciones activas.

La información deberá actualizarse continuamente.

336. Alertas

El sistema deberá generar alertas cuando se detecten condiciones anómalas.

**Ejemplos:**

- aumento de errores;

- indisponibilidad de servicios;

- tiempos de respuesta elevados;

- fallos de autenticación;

- almacenamiento próximo al límite.

Las alertas deberán clasificarse según su severidad.

337. Gestión de Incidentes

Cuando ocurra un incidente, el sistema deberá facilitar su gestión mediante un proceso estructurado que permita reducir su impacto y acelerar la recuperación.

**Como mínimo deberá contemplarse:**

- detección;

- clasificación;

- asignación;

- mitigación;

- resolución;

- análisis posterior.

Cada incidente deberá documentarse.

338. Análisis Posterior (Postmortem)

Todo incidente significativo deberá analizarse una vez resuelto.

**El análisis incluirá:**

- causa raíz;

- impacto;

- tiempo de resolución;

- acciones correctivas;

- acciones preventivas.

El objetivo será evitar recurrencias.

339. Disponibilidad del Servicio

La plataforma deberá monitorear continuamente la disponibilidad de sus componentes.

**Se supervisarán, entre otros:**

- Backend;

- Base de Datos;

- almacenamiento;

- proveedor de IA;

- API Gateway.

Las interrupciones deberán detectarse automáticamente.

340. Observabilidad del Sistema de IA

Las operaciones del Sistema de IA deberán registrarse respetando la privacidad del usuario.

**Podrán registrarse:**

- tiempos de respuesta;

- errores;

- consumo de recursos;

- utilización de modelos;

- fallos de comunicación.

No deberán almacenarse conversaciones sensibles con fines de monitoreo sin las medidas de protección definidas en la Fase 19.

341. Capacidad Operacional

**La operación deberá facilitar tareas administrativas como:**

- reinicio de servicios;

- revisión de registros;

- consulta de métricas;

- validación de despliegues;

- verificación de respaldos.

Estas tareas deberán realizarse sin afectar la integridad del sistema.

342. Continuidad Operacional

Los procedimientos operativos deberán documentarse para facilitar la continuidad del servicio.

**La documentación incluirá, cuando corresponda:**

- procedimientos de recuperación;

- escalamiento de incidentes;

- mantenimiento programado;

- actualización de servicios.

343. Requisitos de Observabilidad

**ROBS-001**

Todos los componentes deberán generar registros estructurados.

**ROBS-002**

Toda solicitud deberá poder rastrearse mediante un identificador único.

**ROBS-003**

El sistema deberá recopilar métricas operacionales continuamente.

**ROBS-004**

Las alertas deberán generarse automáticamente ante condiciones críticas.

**ROBS-005**

Todo incidente significativo deberá documentarse.

**ROBS-006**

El Sistema de IA deberá proporcionar métricas operacionales.

**ROBS-007**

Los paneles de monitoreo deberán reflejar el estado actual del sistema.

**ROBS-008**

La observabilidad deberá respetar los principios de privacidad definidos para la plataforma.

**ROBS-009**

Los procedimientos operativos deberán mantenerse documentados y actualizados.

**ROBS-010**

La estrategia de observabilidad deberá evolucionar junto con la arquitectura del sistema.

344. Evolución Futura

**En futuras versiones podrán incorporarse:**

- detección automática de anomalías mediante IA;

- mantenimiento predictivo de infraestructura;

- correlación automática de incidentes;

- análisis inteligente de registros;

- auto-remediación de fallos;

- observabilidad basada en OpenTelemetry u otros estándares.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 22 —*

***Nota de arquitectura***

La observabilidad constituye la capacidad del sistema para explicar su propio comportamiento durante la operación. En CarPlus, esta capacidad es transversal a toda la arquitectura e integra métricas, registros, trazabilidad y monitoreo para facilitar la detección de problemas, la mejora continua y la operación confiable de la plataforma. La información recopilada tiene fines operacionales y deberá gestionarse conforme a los principios de seguridad y privacidad establecidos previamente.

FASE 23 — ESCALABILIDAD Y EVOLUCIÓN DE LA PLATAFORMA

345. Objetivo

345.1 Propósito

Esta fase establece la estrategia mediante la cual CarPlus podrá aumentar su capacidad operativa a medida que crezcan la cantidad de usuarios, investigaciones, evidencia multimedia y conocimiento almacenado.

El objetivo es asegurar que la plataforma pueda evolucionar progresivamente sin requerir rediseños estructurales significativos.

345.2 Alcance

**Esta fase define:**

- escalabilidad horizontal;

- crecimiento de servicios;

- escalabilidad del almacenamiento;

- escalabilidad del Sistema de IA;

- crecimiento de la Base de Conocimiento;

- optimización de recursos;

- evolución arquitectónica.

No establece límites específicos de capacidad.

346. Principios de Escalabilidad

La arquitectura deberá diseñarse conforme a los siguientes principios de escalabilidad:

- Escalar antes de reconstruir.

- Componentes desacoplados.

- Independencia entre servicios.

- Crecimiento progresivo.

- Optimización continua.

- Eficiencia en costos.

- Evolución sin interrupciones.

La escalabilidad deberá formar parte del diseño inicial del sistema.

347. Estrategia General

El crecimiento de CarPlus deberá producirse de forma gradual, permitiendo ampliar la capacidad de la plataforma sin afectar su estabilidad ni su funcionamiento.

Mayor cantidad de usuarios

**↓**

Mayor carga del sistema

**↓**

Escalamiento de componentes específicos

**↓**

Mantenimiento del rendimiento

**↓**

Continuidad del servicio

No todos los componentes deberán escalar al mismo ritmo.

El crecimiento independiente de servicios, procesamiento, inteligencia, datos, multimedia, conocimiento y grafo se resume en la Figura de arquitectura 09.

Figura de arquitectura 09. Escalabilidad

**Descripción técnica. **La estrategia evita escalar toda la plataforma al mismo ritmo. API Gateway, conversación, evidencia, investigación e informes pueden aumentar capacidad de forma independiente. La base de datos, el almacenamiento multimedia, la Base de Conocimiento y el Grafo emplean mecanismos propios; el Sistema de IA puede cambiar de proveedor o distribuir solicitudes sin alterar la lógica del producto.

348. Escalabilidad Horizontal

Siempre que sea posible, el crecimiento deberá realizarse agregando nuevas instancias de un servicio en lugar de aumentar los recursos de una única máquina.

**Este enfoque permitirá:**

- mayor disponibilidad;

- mejor tolerancia a fallos;

- crecimiento progresivo;

- mantenimiento simplificado.

349. Escalabilidad Vertical

Cuando resulte conveniente, determinados componentes podrán incrementar temporalmente sus recursos computacionales.

Este mecanismo complementará, pero no reemplazará, la estrategia principal de escalamiento horizontal.

350. Escalabilidad por Servicios

Cada servicio podrá crecer de manera independiente.

**Ejemplos:**

- Conversation Service;

- Evidence Service;

- Report Generator;

- Investigation Engine;

- API Gateway.

La demanda de un servicio no deberá afectar innecesariamente a los demás.

351. Escalabilidad del Sistema de IA

La arquitectura deberá permitir modificar el proveedor o la capacidad del Sistema de IA sin alterar la lógica del producto ni el comportamiento esperado por el usuario.

**Será posible:**

- cambiar de modelo;

- utilizar múltiples modelos;

- distribuir solicitudes;

- incorporar nuevos proveedores.

El Sistema de IA permanecerá desacoplado del resto de la arquitectura.

352. Escalabilidad de la Base de Datos

El almacenamiento de datos deberá poder ampliarse progresivamente.

**La arquitectura deberá permitir, cuando sea necesario:**

- replicación;

- particionamiento;

- optimización de consultas;

- distribución de carga.

La integridad de los datos tendrá prioridad sobre el rendimiento.

353. Escalabilidad del Almacenamiento Multimedia

El volumen de imágenes, videos y audios crecerá continuamente.

El almacenamiento deberá diseñarse para admitir crecimiento prácticamente ilimitado mediante mecanismos de expansión progresiva.

La gestión del almacenamiento deberá permanecer independiente de la Base de Datos principal.

354. Escalabilidad de la Base de Conocimiento

La Base de Conocimiento deberá admitir un crecimiento constante sin afectar el rendimiento de las investigaciones.

El aumento del conocimiento no deberá incrementar significativamente el tiempo necesario para generar hipótesis o informes.

355. Escalabilidad del Grafo de Conocimiento

El Grafo de Conocimiento deberá soportar la incorporación continua de:

- vehículos;

- componentes;

- relaciones;

- patrones;

- casos confirmados.

El crecimiento del grafo no deberá comprometer la coherencia de sus relaciones.

356. Procesamiento Distribuido

Las tareas computacionalmente intensivas podrán distribuirse entre múltiples recursos.

**Ejemplos:**

- procesamiento multimedia;

- análisis de evidencia;

- aprendizaje;

- generación de informes.

La distribución deberá ser transparente para el usuario.

357. Optimización de Recursos

La infraestructura deberá utilizar los recursos disponibles de manera eficiente.

**Se buscará optimizar:**

- CPU;

- memoria;

- almacenamiento;

- ancho de banda;

- consumo del Sistema de IA.

La optimización no deberá comprometer la calidad de la investigación.

358. Optimización de Costos

El crecimiento del sistema deberá considerar la sostenibilidad económica.

**La arquitectura deberá facilitar:**

- escalamiento bajo demanda;

- utilización eficiente de recursos;

- reducción de servicios ociosos;

- selección dinámica de capacidades cuando corresponda.

Las decisiones de optimización nunca deberán reducir la calidad de los resultados entregados al usuario.

359. Evolución Funcional

La incorporación de nuevas funcionalidades deberá minimizar el impacto sobre los módulos existentes.

Las nuevas capacidades deberán integrarse mediante interfaces claramente definidas.

Siempre que sea posible, las modificaciones deberán ser compatibles con versiones anteriores.

360. Compatibilidad Evolutiva

La arquitectura deberá favorecer la incorporación futura de nuevos componentes.

**Ejemplos:**

- nuevos proveedores de IA;

- nuevos tipos de evidencia;

- nuevos idiomas;

- nuevos mercados;

- nuevos sistemas de autenticación;

- nuevos módulos especializados.

La evolución no deberá requerir rediseñar la plataforma.

361. Medición del Crecimiento

El crecimiento de la plataforma deberá evaluarse mediante indicadores objetivos que faciliten la planificación y la toma de decisiones técnicas:

**Ejemplos:**

- usuarios activos;

- investigaciones concurrentes;

- volumen de evidencia;

- tamaño de la Base de Conocimiento;

- relaciones del Grafo de Conocimiento;

- utilización de infraestructura.

Estos indicadores facilitarán la planificación de futuras expansiones.

362. Requisitos de Escalabilidad

**RESC-001**

La arquitectura deberá soportar escalamiento horizontal de los servicios principales.

**RESC-002**

Cada servicio deberá poder evolucionar de manera independiente.

**RESC-003**

El Sistema de IA deberá permanecer desacoplado del resto de la plataforma.

**RESC-004**

La Base de Datos deberá permitir mecanismos de expansión progresiva.

**RESC-005**

El almacenamiento multimedia deberá crecer independientemente de la Base de Datos.

**RESC-006**

La Base de Conocimiento deberá soportar crecimiento continuo sin degradar significativamente el rendimiento.

**RESC-007**

El Grafo de Conocimiento deberá mantener su consistencia durante el crecimiento.

**RESC-008**

La incorporación de nuevas funcionalidades deberá minimizar el impacto sobre los componentes existentes.

**RESC-009**

La arquitectura deberá optimizar el uso de recursos sin comprometer la calidad del producto.

**RESC-010**

La estrategia de escalabilidad deberá permitir la evolución tecnológica de la plataforma sin rediseños estructurales significativos.

363. Evolución Futura

**En versiones posteriores podrán incorporarse:**

- arquitectura multirregión;

- procesamiento distribuido global;

- balanceo geográfico inteligente;

- aprendizaje federado;

- múltiples Sistemas de IA ejecutándose simultáneamente;

- optimización automática de recursos mediante IA;

- incorporación de microservicios especializados.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 23 —*

***Nota de arquitectura***

La escalabilidad de CarPlus no consiste únicamente en soportar un mayor número de usuarios, sino en permitir que toda la plataforma —incluyendo el Frontend, Backend, Sistema de IA, Base de Datos, Base de Conocimiento y Grafo de Conocimiento— evolucione de manera independiente, eficiente y sostenible. La arquitectura está diseñada para crecer de forma incremental, preservando los principios definidos en las fases anteriores y reduciendo la necesidad de rediseños a medida que el producto madura.

FASE 24 — GOBIERNO TÉCNICO Y EVOLUCIÓN DEL PRODUCTO

364. Objetivo

364.1 Propósito

Esta fase establece los principios, procesos y mecanismos mediante los cuales la arquitectura, la documentación y los componentes técnicos de CarPlus evolucionarán de forma controlada a lo largo del tiempo.

El objetivo es asegurar que el crecimiento del producto preserve la consistencia, trazabilidad y mantenibilidad de la plataforma.

364.2 Alcance

**Esta fase define:**

- gobierno técnico;

- gestión de cambios;

- versionado;

- decisiones arquitectónicas;

- evolución de componentes;

- documentación;

- ciclo de vida tecnológico.

No define procesos administrativos de la organización.

365. Principios de Gobierno Técnico

La evolución técnica de CarPlus deberá regirse por los siguientes principios fundamentales:

- Evolución controlada.

- Trazabilidad de decisiones.

- Compatibilidad cuando sea posible.

- Documentación permanente.

- Transparencia técnica.

- Simplicidad arquitectónica.

- Mejora continua.

Toda decisión técnica deberá poder justificarse.

366. Arquitectura Viva

La arquitectura deberá considerarse un activo vivo, cuya documentación y diseño evolucionen de forma coordinada con el producto.

**Toda modificación relevante deberá reflejarse en:**

- documentación;

- diagramas;

- requisitos;

- modelos de datos;

- especificaciones.

La documentación deberá evolucionar junto con el software.

367. Gestión de Versiones

Los componentes principales deberán mantener un esquema claro de versionado.

**Entre ellos:**

- API;

- Base de Datos;

- Base de Conocimiento;

- Grafo de Conocimiento;

- Frontend;

- Backend;

- Sistema de IA.

El versionado permitirá administrar cambios de forma ordenada.

368. Versionado del Producto

**Cada versión del producto deberá identificar claramente:**

- funcionalidades incorporadas;

- mejoras;

- correcciones;

- cambios incompatibles;

- fecha de liberación.

El historial de versiones deberá mantenerse disponible.

369. Versionado de la API

La API deberá evolucionar sin afectar innecesariamente a los clientes existentes.

**Siempre que sea posible:**

- los cambios incompatibles crearán una nueva versión;

- las versiones anteriores permanecerán disponibles durante un período de transición;

- la documentación reflejará claramente las diferencias.

370. Evolución del Modelo de Datos

Las modificaciones del modelo de datos deberán planificarse cuidadosamente.

**Toda evolución deberá preservar:**

- integridad;

- trazabilidad;

- compatibilidad cuando corresponda;

- capacidad de migración.

Las migraciones deberán documentarse.

371. Evolución de la Base de Conocimiento

La Base de Conocimiento crecerá continuamente mediante nuevos casos confirmados.

**Cada actualización deberá:**

- mantener trazabilidad;

- registrar origen;

- indicar versión;

- permitir auditoría.

El conocimiento nunca deberá sobrescribirse sin mantener historial.

372. Evolución del Grafo de Conocimiento

Las modificaciones del Grafo deberán preservar la consistencia estructural.

Toda nueva relación deberá cumplir las reglas definidas en la Fase 18.

Las relaciones eliminadas deberán quedar registradas para fines históricos cuando corresponda.

373. Evolución del Sistema de IA

La arquitectura permitirá actualizar el Sistema de IA sin modificar la lógica principal del producto.

**Será posible:**

- cambiar modelos;

- cambiar proveedores;

- incorporar agentes especializados;

- introducir nuevas capacidades multimodales.

El comportamiento esperado del producto deberá permanecer consistente.

374. Architecture Decision Records (ADR)

Toda decisión arquitectónica significativa deberá documentarse mediante un registro formal de decisiones que preserve su contexto y justificación.

**Cada ADR incluirá, como mínimo:**

- identificador;

- contexto;

- problema;

- alternativas evaluadas;

- decisión adoptada;

- consecuencias.

Los ADR permitirán comprender la evolución técnica del producto.

375. Gestión de Cambios

Todo cambio importante deberá seguir un proceso estructurado.

**Como mínimo incluirá:**

- identificación del cambio;

- análisis de impacto;

- revisión técnica;

- implementación;

- validación;

- actualización documental.

Los cambios deberán minimizar riesgos para el sistema.

376. Deprecación

Cuando una funcionalidad deje de utilizarse, deberá existir un proceso formal de deprecación.

**Este proceso podrá incluir:**

- anuncio;

- período de transición;

- documentación;

- eliminación controlada.

Las funcionalidades no deberán eliminarse abruptamente cuando existan dependencias.

377. Gestión de Deuda Técnica

La deuda técnica deberá identificarse y documentarse.

**Cada elemento registrado deberá incluir:**

- descripción;

- impacto;

- prioridad;

- estrategia de resolución.

La deuda técnica deberá revisarse periódicamente.

378. Revisión Arquitectónica

La arquitectura deberá revisarse de forma periódica para verificar que continúa satisfaciendo los principios establecidos en este documento.

**La revisión podrá evaluar:**

- rendimiento;

- mantenibilidad;

- seguridad;

- escalabilidad;

- simplicidad;

- evolución tecnológica.

379. Gestión Documental

Toda documentación técnica deberá mantenerse sincronizada con el estado real del sistema.

**Se recomienda controlar mediante versiones:**

- PRD;

- diagramas;

- modelos;

- especificaciones;

- ADR;

- manuales técnicos.

La documentación obsoleta deberá actualizarse o archivarse.

380. Indicadores de Gobierno

El gobierno técnico deberá evaluarse mediante indicadores que permitan medir la calidad del proceso de evolución y apoyar la mejora continua:

- decisiones documentadas;

- deuda técnica pendiente;

- documentación actualizada;

- versiones activas;

- migraciones exitosas;

- incidencias por cambios.

Estos indicadores facilitarán la mejora continua del proceso.

381. Requisitos de Gobierno Técnico

**RGOV-001**

Toda decisión arquitectónica significativa deberá documentarse.

**RGOV-002**

La documentación deberá mantenerse alineada con el software.

**RGOV-003**

Los componentes principales deberán mantener un esquema de versionado.

**RGOV-004**

Las migraciones deberán planificarse y documentarse.

**RGOV-005**

La Base de Conocimiento deberá conservar historial de cambios.

**RGOV-006**

El Grafo de Conocimiento deberá mantener trazabilidad de su evolución.

**RGOV-007**

La API deberá gestionar cambios incompatibles mediante versionado.

**RGOV-008**

La deuda técnica deberá registrarse y revisarse periódicamente.

**RGOV-009**

Toda funcionalidad deprecada deberá seguir un proceso formal antes de eliminarse.

**RGOV-010**

La estrategia de gobierno deberá evolucionar junto con la plataforma.

382. Evolución Futura

**En futuras versiones podrán incorporarse:**

- gobierno automatizado mediante IA;

- validación automática de arquitectura;

- generación automática de ADR;

- control inteligente de deuda técnica;

- análisis predictivo del impacto de cambios;

- documentación técnica generada dinámicamente.

Estas capacidades quedan fuera del alcance del MVP.

*— Fin de la Fase 24 —*

***Nota de arquitectura***

El gobierno técnico proporciona el marco que permite a CarPlus evolucionar de forma sostenible. Mientras las fases anteriores describen la arquitectura, la implementación, la operación y la escalabilidad del sistema, esta fase establece las reglas para gestionar su evolución sin perder coherencia técnica. La combinación de versionado, trazabilidad, documentación y decisiones arquitectónicas documentadas garantiza que la plataforma pueda mantenerse y ampliarse durante su ciclo de vida.

**Revisión Editorial — Versión 2.0**

Esta revisión consolida las fases 1 a 24 y establece este documento como la especificación técnica principal de CarPlus.

**Mejoras editoriales recomendadas:**

- Mantener un único glosario al inicio del documento.

- Añadir una tabla de trazabilidad que relacione principios, requisitos funcionales (FR), requisitos no funcionales (NFR) y requisitos específicos de cada fase (RSEC, RINF, RQA, etc.).

- Incorporar un diagrama maestro que muestre la relación entre Frontend, Backend, API, Sistema de IA, Base de Conocimiento y Grafo de Conocimiento.

- Unificar la terminología utilizando siempre 'Sistema de IA', 'Motor de Investigación', 'Motor de Decisión', 'Base de Conocimiento' y 'Grafo de Conocimiento'.

- Revisar referencias cruzadas para que cada fase cite explícitamente las fases relacionadas cuando exista una dependencia.

- Generar un índice automático antes de la publicación final.

Estado recomendado: Documento apto para comenzar diseño detallado e implementación del MVP. Las siguientes modificaciones deberían corresponder a cambios reales del producto y no a ampliaciones generales de la arquitectura.

**Revisión Editorial — Versión 3.2**

En cumplimiento de la recomendación "Revisar referencias cruzadas para que cada fase cite explícitamente las fases relacionadas cuando exista una dependencia" (arriba), se detectó y corrigió una contradicción real entre la Fase 6 (Estado 7) y la Fase 7 (RI-009) respecto del comportamiento del caso tras generarse un informe. La corrección se documenta en el capítulo "Actualización Oficial — PRD v3.2" y se aplicó directamente en §27–§30 de la Fase 6, con ajustes de consistencia en la Fase 3 (§12.3) y la Fase 16 (§202, §206). El resto de las mejoras editoriales recomendadas arriba (glosario único, tabla de trazabilidad, diagrama maestro, índice automático) permanecen como recomendaciones abiertas, no bloqueantes para el inicio del MVP.

CAPÍTULO TRANSVERSAL — DESIGN SYSTEM DE CARPLUS

Página 1 de 1