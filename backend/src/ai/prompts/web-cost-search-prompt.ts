import type { AiReportGenerationContext } from '../ai-provider.interface';

// Prompt aislado para la llamada previa y separada de generateReport()
// (ver Decisions Log) que busca costo/tiempo de reparación reales para
// Chile usando el tool de búsqueda web de Anthropic — nunca se usa en
// el chat conversacional (generateResponse()), para no sumar costo de
// búsqueda a cada turno. Corre ANTES del prompt principal
// (report-generation-prompt.ts), que sigue forzando su propio tool sin
// cambios; el resultado de esta búsqueda se inyecta ahí como una
// sección más de contexto, nunca reemplaza su lógica.
export const WEB_COST_SEARCH_PROMPT_VERSION = 1;

export function buildWebCostSearchPrompt(): string {
  return `Eres un asistente que busca en internet el costo aproximado y \
el tiempo estimado de reparación para un problema automotriz \
específico, EN CHILE. Tienes acceso a un tool de búsqueda web — \
úsalo si te ayuda a encontrar algo específico y confiable.

Reglas estrictas:
1. Solo reporta un hallazgo si es específico para Chile (talleres, \
repuesterías, marketplaces chilenos, o fuentes que claramente aplican \
a Chile) y proviene de una fuente que citarías con confianza.
2. Nunca uses precios ni tiempos de otro país, ni tu conocimiento \
general sin respaldo de la búsqueda, para completar la respuesta.
3. Si no encuentras algo específico y confiable para Chile, dilo \
explícitamente — "No encontré información confiable para Chile" es \
la respuesta correcta y preferible a inventar o aproximar.
4. Responde en un máximo de dos párrafos breves: uno sobre costo (en \
pesos chilenos, CLP, si lo encuentras), otro sobre tiempo estimado de \
reparación. Sin listas ni explicaciones largas — esto es contexto \
interno para otro proceso, no una respuesta para el usuario final.`;
}

export function buildWebCostSearchContext(
  context: AiReportGenerationContext,
): string {
  const { vehicle, hypotheses } = context;

  const vehicleLine = [
    vehicle.brand,
    vehicle.model,
    vehicle.version,
    String(vehicle.year),
  ]
    .filter((part): part is string => Boolean(part))
    .join(' ');

  // Prioriza hipótesis no descartadas — si todas fueron descartadas,
  // usa igual la lista completa: mejor contexto parcial que ninguno.
  const activeHypotheses = hypotheses.filter((h) => h.status !== 'DISCARDED');
  const candidates =
    activeHypotheses.length > 0 ? activeHypotheses : hypotheses;

  // Una investigación con muchos turnos acumula revisiones repetidas de
  // la misma hipótesis (mismo texto, distinta confianza) — sin deduplicar
  // esto puede inflar el prompt de búsqueda a decenas de líneas
  // redundantes, con riesgo real de agotar AI_REPORT_SEARCH_TIMEOUT_MS
  // (visto en vivo con una investigación de 36 hipótesis). Se queda con
  // la confianza más alta por texto único y se acota a las 5 causas más
  // probables — más que suficiente para orientar la búsqueda.
  const bestByText = new Map<string, (typeof candidates)[number]>();
  for (const hypothesis of candidates) {
    const existing = bestByText.get(hypothesis.hypothesis);
    if (!existing || hypothesis.confidence > existing.confidence) {
      bestByText.set(hypothesis.hypothesis, hypothesis);
    }
  }
  const hypothesesLines = [...bestByText.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((h) => `- ${h.hypothesis}`);

  return [
    `Vehículo: ${vehicleLine}`,
    '',
    'Posibles causas identificadas durante la investigación:',
    ...hypothesesLines,
    '',
    'Busca el costo aproximado y el tiempo estimado de reparación para ' +
      'estas causas en Chile.',
  ].join('\n');
}
