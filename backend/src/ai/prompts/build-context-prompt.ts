import type { AiConversationContext } from '../ai-provider.interface';

/**
 * Ensambla el bloque de contexto por turno (§14.5: investigation context,
 * hypothesis state, task) a partir de datos ya persistidos + el mensaje
 * nuevo del usuario, que `MessagesService` agrega al final de
 * `conversation` en memoria antes de llamar al proveedor — sin bloque de
 * evidencia ni de documentación recuperada todavía (Fases 6 y 5b).
 */
export function buildContextPrompt(context: AiConversationContext): string {
  const { vehicle, problem, conversation, hypotheses } = context;

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
    '## Tarea',
    'Analizá el último mensaje del usuario y respondé usando la herramienta ' +
      'ofrecida: tu próxima pregunta o mensaje, actualizaciones de hipótesis ' +
      'si corresponde, y tu recomendación de estado.',
  ].join('\n');
}
