import type { AiConversationContext } from '../ai-provider.interface';

/**
 * Ensambla el bloque de contexto por turno (§14.5: investigation context,
 * evidence context, retrieved documentation, hypothesis state, task) a
 * partir de datos ya persistidos + el mensaje nuevo del usuario, que
 * `MessagesService` agrega al final de `conversation` en memoria antes
 * de llamar al proveedor.
 */
export function buildContextPrompt(context: AiConversationContext): string {
  const {
    vehicle,
    problem,
    conversation,
    hypotheses,
    retrievedDocumentation,
    evidence,
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
      : ['(sin mensajes previos)'];

  const hypothesesLines =
    hypotheses.length > 0
      ? hypotheses.map(
          (h) =>
            `- (${h.status}, confianza ${h.confidence.toFixed(2)}) ${h.hypothesis} — ${h.reasoning}`,
        )
      : ['(ninguna todavía)'];

  const retrievedDocumentationLines =
    retrievedDocumentation.length > 0
      ? retrievedDocumentation.map(
          (d) => `- [${d.chunkId}] (${d.documentTitle}): ${d.content}`,
        )
      : ['(sin documentación recuperada para esta consulta)'];

  const evidenceLines =
    evidence.length > 0
      ? evidence.map((e) => {
          const description = e.description ? ` — ${e.description}` : '';
          const status =
            e.variables.length > 0
              ? `variables: ${e.variables.join(', ')}. ${e.summary ?? ''}`
              : '(análisis automático no disponible para este tipo todavía)';
          return `- [${e.evidenceType}]${description} — ${status}`;
        })
      : ['(sin evidencia registrada todavía)'];

  return [
    '## Vehículo',
    ...vehicleLines,
    '',
    '## Problema reportado',
    problem.title,
    problem.description,
    '',
    '## Conversación hasta ahora (el último mensaje es el más reciente)',
    ...conversationLines,
    '',
    '## Hipótesis activas',
    ...hypothesesLines,
    '',
    '## Evidencia (hechos del caso)',
    ...evidenceLines,
    '',
    '## Documentación técnica recuperada (material de referencia, no hechos del caso)',
    ...retrievedDocumentationLines,
    '',
    '## Tarea',
    'Analiza el último mensaje del usuario y responde usando la herramienta ' +
      'ofrecida: tu próxima pregunta o mensaje, actualizaciones de hipótesis ' +
      'si corresponde, y tu recomendación de estado.',
  ].join('\n');
}
