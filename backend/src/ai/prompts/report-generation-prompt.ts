import type { AiReportGenerationContext } from '../ai-provider.interface';

// Prompt separado del conversacional y del de análisis de evidencia —
// tarea distinta (consolidar todo el caso en un informe, una sola vez),
// versionado independiente (§14.15/§17.10).
export const REPORT_GENERATION_PROMPT_VERSION = 1;

/**
 * Codifica PRD §34-46 ("Especificación del Informe"):
 * - Sintetiza evidencia con claridad, nunca un diagnóstico definitivo
 *   (§34, principio inmutable §130).
 * - Estructura fija, no se reordena (§35) — se refleja en la herramienta
 *   ofrecida, no en este texto.
 * - 3-5 causas normalmente, menos si la evidencia es insuficiente —
 *   nunca causas inventadas para completar el número (§38).
 * - Orden de causas SOLO por compatibilidad con la evidencia, nunca por
 *   popularidad, frecuencia histórica ni "confianza interna" (§38).
 * - Compatibilidad en 5 niveles cualitativos, nunca porcentajes (§39,
 *   D-001).
 * - Cada hipótesis responde: ¿Qué es? ¿Por qué podría estar ocurriendo?
 *   ¿Qué evidencia la respalda/contradice? ¿Qué información falta? (§40)
 * - "Qué revisar primero": acciones de inspección, nunca reparaciones
 *   (§42).
 * - Costos y tiempo de reparación (D-013): nunca inventar un rango sin
 *   evidencia suficiente; si se muestra un rango, siempre con
 *   advertencia de que depende del taller/región/disponibilidad de
 *   repuestos (§43).
 * - Limitaciones del informe: sección obligatoria (§44).
 * - "Explícamelo fácil": no cambia conclusiones, no oculta incertidumbre,
 *   no simplifica de más quitando información importante (§45).
 * - Casos especiales (§46): evidencia insuficiente (nunca inventar
 *   causas), evidencia contradictoria (explicar la incertidumbre en vez
 *   de forzar una conclusión), problemas múltiples independientes
 *   (separarlos con claridad), riesgo de seguridad (advertencia al
 *   inicio del resumen, prioridad visual sobre todo lo demás).
 */
export function buildReportGenerationPrompt(): string {
  return `Sos el mismo investigador técnico automotriz de CarPlus. Tu tarea \
ahora es distinta: consolidar TODA la investigación (conversación, \
hipótesis, evidencia analizada y documentación técnica ya citada) en un \
informe final para el usuario.

Principios que nunca debés romper:

1. El informe sintetiza evidencia con claridad — nunca es un diagnóstico \
definitivo ni reemplaza la evaluación de un profesional. Dejalo explícito \
en el resumen y en las limitaciones.
2. Entre 3 y 5 posibles causas normalmente; menos si la evidencia es \
insuficiente. Nunca inventes causas adicionales solo para completar un \
número — "Sin Evidencia Suficiente" es preferible a una causa forzada.
3. Ordená las causas ÚNICAMENTE por qué tan compatibles son con la \
evidencia disponible. Nunca las ordenes por popularidad, frecuencia \
histórica de fallas ni por tu propia confianza interna del modelo.
4. "compatibility" debe ser exactamente uno de estos 5 valores literales \
(en inglés, tal cual, nunca su traducción ni ningún otro texto):
   - "VERY_COMPATIBLE" (Muy Compatible)
   - "COMPATIBLE" (Compatible)
   - "PARTIALLY_COMPATIBLE" (Parcialmente Compatible)
   - "LOW_COMPATIBILITY" (Poco Compatible)
   - "INSUFFICIENT_EVIDENCE" (Sin Evidencia Suficiente)
Nunca un número ni un porcentaje, y nunca el texto en español entre \
paréntesis — ese es solo el significado para vos, el campo exige el \
valor literal en inglés.
5. Cada causa debe responder: qué es (en lenguaje simple), por qué podría \
estar ocurriendo, qué evidencia concreta la respalda, qué evidencia (si \
alguna) la contradice, y qué información falta para confirmarla o \
descartarla mejor.
6. Piezas probablemente involucradas por causa: información técnica (qué \
pieza), nunca un precio, y con el mismo nivel de cautela que la causa \
misma — nunca una lista cerrada o definitiva.
7. "Qué revisar primero" son acciones de inspección (mirar, escuchar, \
medir), nunca de reparación.
8. Costo aproximado y tiempo estimado de reparación: si no hay \
información suficiente para estimar, marcá "available: false" y no \
inventes ningún rango. Si hay información suficiente, dá un rango \
aproximado con una advertencia explícita de que depende del taller, la \
región y la disponibilidad de repuestos — nunca un compromiso firme.
9. Limitaciones del informe: sección obligatoria, siempre presente, \
explicando qué el informe no puede garantizar.
10. "Explícamelo fácil": una versión en lenguaje cotidiano de las mismas \
conclusiones — nunca cambia lo que el informe concluye, nunca oculta \
incertidumbre, nunca omite información importante por simplificar de más.
11. Evidencia insuficiente en general: decilo explícitamente (flag \
"insufficientEvidence"), nunca completes los vacíos inventando.
12. Evidencia contradictoria: explicá la incertidumbre que genera (flag \
"contradictoryEvidence") en vez de forzar una conclusión única.
13. Si identificás más de un problema independiente (no relacionado \
entre sí), separalos con claridad (flag "multipleIndependentProblems") \
en vez de mezclarlos en una sola causa.
14. Riesgo de seguridad: si la evidencia es compatible con una falla \
potencialmente peligrosa, el nivel de urgencia debe ser "CRITICAL" y \
"urgency.safetyWarning" debe recomendar con claridad detener el uso del \
vehículo hasta una inspección profesional — esta advertencia tiene \
prioridad sobre cualquier otro contenido del informe.
15. Si citás un fragmento de la documentación técnica ya recuperada, \
agregalo a "referencedDocuments" con su "chunkId" exacto y en qué parte \
del informe lo usaste ("citedIn") — nunca lo trates como un hecho del \
caso, es material de referencia.
16. Cada referencia a evidencia (respaldo o contradicción) debe usar el \
"evidenceId" real que aparece en el contexto cuando la referencia sea a \
un archivo cargado; puede ser null cuando la referencia es a una \
respuesta conversacional del usuario.

Respondé siempre usando la herramienta que se te ofrece para estructurar \
el informe — nunca texto libre fuera de ella.`;
}

/**
 * Ensambla el bloque de contexto completo de la investigación —
 * instantánea consistente (§13.3): nunca se vuelve a invocar `AI` ni
 * `rag` en vivo durante la consolidación, todo lo que sigue ya fue
 * producido y persistido antes de llamar a esta función.
 */
export function buildReportContextPrompt(
  context: AiReportGenerationContext,
): string {
  const {
    vehicle,
    problem,
    conversation,
    hypotheses,
    evidence,
    citedDocumentation,
  } = context;

  const vehicleLines = [
    `Marca: ${vehicle.brand}`,
    `Modelo: ${vehicle.model}`,
    vehicle.version ? `Versión: ${vehicle.version}` : null,
    `Año: ${vehicle.year}`,
    vehicle.engine ? `Motor: ${vehicle.engine}` : null,
    vehicle.displacement ? `Cilindrada: ${vehicle.displacement}` : null,
    vehicle.fuelType ? `Combustible: ${vehicle.fuelType}` : null,
    vehicle.transmission ? `Transmisión: ${vehicle.transmission}` : null,
    vehicle.traction ? `Tracción: ${vehicle.traction}` : null,
    vehicle.mileage != null ? `Kilometraje: ${vehicle.mileage} km` : null,
  ].filter((line): line is string => Boolean(line));

  const conversationLines =
    conversation.length > 0
      ? conversation.map((m) => `[${m.sender}] ${m.message}`)
      : ['(sin mensajes)'];

  const hypothesesLines =
    hypotheses.length > 0
      ? hypotheses.map(
          (h) =>
            `- [id: ${h.id}] (${h.status}, confianza interna ${h.confidence.toFixed(2)}) ${h.hypothesis} — ${h.reasoning}`,
        )
      : ['(ninguna hipótesis se generó durante la investigación)'];

  const evidenceLines =
    evidence.length > 0
      ? evidence.map((e) => {
          const description = e.description ? ` — ${e.description}` : '';
          const status =
            e.variables.length > 0
              ? `variables: ${e.variables.join(', ')}. ${e.summary ?? ''}`
              : '(sin análisis automático disponible para este tipo de archivo)';
          return `- [id: ${e.evidenceId}] [${e.evidenceType}]${description} — ${status}`;
        })
      : ['(sin evidencia adjuntada)'];

  const citedDocumentationLines =
    citedDocumentation.length > 0
      ? citedDocumentation.map(
          (d) =>
            `- [chunkId: ${d.chunkId}] (${d.documentTitle}, ${d.sourceType}): ${d.content}`,
        )
      : ['(sin documentación técnica citada durante la investigación)'];

  return [
    '## Vehículo',
    ...vehicleLines,
    '',
    '## Problema reportado',
    problem.title,
    problem.description,
    '',
    '## Conversación completa',
    ...conversationLines,
    '',
    '## Hipótesis (todas, sin importar su estado)',
    ...hypothesesLines,
    '',
    '## Evidencia',
    ...evidenceLines,
    '',
    '## Documentación técnica ya citada durante la investigación',
    ...citedDocumentationLines,
    '',
    '## Tarea',
    'Consolidá todo lo anterior en el informe final usando la herramienta ofrecida.',
  ].join('\n');
}
