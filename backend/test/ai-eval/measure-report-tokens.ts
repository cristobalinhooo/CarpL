/**
 * Script de medición puntual (no forma parte de ai:eval, se corre a mano
 * y se descarta) — Decisions Log: para subir `max_tokens` en
 * generateReport() con un margen real en vez de un número adivinado,
 * se necesita saber cuántos output tokens consume un informe "normal"
 * (5-8 hipótesis, ni el caso liviano de 2 ni el extremo de 36 usado en
 * la verificación en vivo anterior). Reusa el prompt/tool EXACTOS de
 * producción (buildReportGenerationPrompt/buildReportContextPrompt),
 * solo con max_tokens muy alto para no truncar la medición misma.
 *
 * Uso: npx ts-node --transpile-only test/ai-eval/measure-report-tokens.ts
 */
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import type { AiReportGenerationContext } from '../../src/ai/ai-provider.interface';
import {
  buildReportContextPrompt,
  buildReportGenerationPrompt,
} from '../../src/ai/prompts/report-generation-prompt';

// Copia exacta del schema de REPORT_TOOL en claude-ai-provider.ts (no
// exportado desde ahí) — solo para esta medición puntual.
const COST_RANGE_SCHEMA = {
  type: 'object',
  properties: {
    min: { type: 'number' },
    max: { type: 'number' },
    currency: { type: 'string' },
  },
  required: ['min', 'max', 'currency'],
} as const;

const EVIDENCE_REFERENCE_SCHEMA = {
  type: 'object',
  properties: {
    evidenceId: { type: ['string', 'null'] },
    description: { type: 'string' },
  },
  required: ['evidenceId', 'description'],
} as const;

const REPORT_TOOL: Anthropic.Tool = {
  name: 'submit_report',
  description: 'Entrega el informe final consolidado de la investigación.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      urgency: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
          },
          explanation: { type: 'string' },
          safetyWarning: { type: ['string', 'null'] },
        },
        required: ['level', 'explanation'],
      },
      hypotheses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hypothesisId: { type: 'string' },
            name: { type: 'string' },
            whatIsIt: { type: 'string' },
            whyItMightBeHappening: { type: 'string' },
            compatibility: {
              type: 'string',
              enum: [
                'VERY_COMPATIBLE',
                'COMPATIBLE',
                'PARTIALLY_COMPATIBLE',
                'LOW_COMPATIBILITY',
                'INSUFFICIENT_EVIDENCE',
              ],
            },
            supportingEvidence: {
              type: 'array',
              items: EVIDENCE_REFERENCE_SCHEMA,
            },
            contradictingEvidence: {
              type: 'array',
              items: EVIDENCE_REFERENCE_SCHEMA,
            },
            missingInformation: { type: 'array', items: { type: 'string' } },
            likelyPartsInvolved: { type: 'array', items: { type: 'string' } },
          },
          required: [
            'hypothesisId',
            'name',
            'whatIsIt',
            'whyItMightBeHappening',
            'compatibility',
            'supportingEvidence',
            'contradictingEvidence',
            'missingInformation',
            'likelyPartsInvolved',
          ],
        },
      },
      symptoms: { type: 'array', items: { type: 'string' } },
      whatToCheckFirst: { type: 'array', items: { type: 'string' } },
      costEstimate: {
        type: 'object',
        properties: {
          available: { type: 'boolean' },
          approximateRange: COST_RANGE_SCHEMA,
          relativeLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          disclaimer: { type: 'string' },
        },
        required: ['available'],
      },
      estimatedRepairTime: {
        type: 'object',
        properties: {
          available: { type: 'boolean' },
          approximateRange: {
            type: 'object',
            properties: { min: { type: 'number' }, max: { type: 'number' } },
            required: ['min', 'max'],
          },
          relativeLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          disclaimer: { type: 'string' },
        },
        required: ['available'],
      },
      limitations: { type: 'array', items: { type: 'string' } },
      referencedDocuments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            chunkId: { type: 'string' },
            citedIn: { type: 'string' },
          },
          required: ['chunkId', 'citedIn'],
        },
      },
      simplifiedExplanation: { type: 'string' },
      flags: {
        type: 'object',
        properties: {
          insufficientEvidence: { type: 'boolean' },
          contradictoryEvidence: { type: 'boolean' },
          multipleIndependentProblems: { type: 'boolean' },
        },
        required: [
          'insufficientEvidence',
          'contradictoryEvidence',
          'multipleIndependentProblems',
        ],
      },
    },
    required: [
      'summary',
      'urgency',
      'hypotheses',
      'symptoms',
      'whatToCheckFirst',
      'costEstimate',
      'estimatedRepairTime',
      'limitations',
      'referencedDocuments',
      'simplifiedExplanation',
      'flags',
    ],
  },
};

// Caso "normal" representativo: 6 hipótesis (activas + descartadas +
// parcialmente confirmadas), conversación de ida y vuelta realista,
// sin evidencia adjunta (el caso más común hoy) — ni el liviano de 2
// hipótesis ni el extremo sintético de 36 usado en la verificación
// anterior.
const context: AiReportGenerationContext = {
  vehicle: {
    brand: 'Toyota',
    model: 'Corolla',
    version: 'XEI',
    year: 2018,
    engine: '2ZR-FE',
    displacement: '1.8L',
    fuelType: 'Bencina',
    transmission: 'CVT',
    traction: 'Delantera',
    mileage: 98000,
    vin: null,
  },
  problem: {
    title: 'Ruido y vibración al frenar',
    description:
      'El vehículo hace un ruido metálico chirriante al frenar, especialmente a baja velocidad, y se siente una vibración leve en el pedal cuando frena con fuerza. Empezó hace unas dos semanas y ha ido empeorando.',
  },
  conversation: [
    {
      sender: 'USER',
      message:
        'El vehículo hace un ruido metálico chirriante al frenar, especialmente a baja velocidad, y se siente una vibración leve en el pedal cuando frena con fuerza.',
    },
    {
      sender: 'AI',
      message:
        '¿El ruido ocurre en todas las frenadas o solo en algunas? ¿Y notas si viene de un lado específico (izquierdo/derecho, delantero/trasero)?',
    },
    {
      sender: 'USER',
      message:
        'Ocurre casi siempre, pero parece más fuerte del lado delantero derecho. La vibración la siento más en el pedal que en el volante.',
    },
    {
      sender: 'AI',
      message:
        '¿Cuándo fue el último cambio de pastillas de freno y hace cuánto revisaste los discos? ¿El ruido cambia si frenas suave vs. brusco?',
    },
    {
      sender: 'USER',
      message:
        'No recuerdo la última vez que cambiamos las pastillas, puede que hayan pasado más de 40.000 km. El ruido es peor frenando suave, casi desaparece si freno fuerte y rápido.',
    },
    {
      sender: 'AI',
      message:
        '¿Escuchas el ruido también cuando el vehículo está detenido y solo pisas el freno, o únicamente en movimiento? ¿Ha bajado el nivel del líquido de frenos?',
    },
    {
      sender: 'USER',
      message:
        'Solo en movimiento, detenido no hace nada. No he revisado el líquido de frenos, honestamente no sé cómo verlo.',
    },
    {
      sender: 'AI',
      message:
        'Entendido. Con el desgaste de tiempo que mencionas y el patrón del ruido, ¿notas algún tirón hacia un lado al frenar fuerte, o el auto frena derecho?',
    },
    {
      sender: 'USER',
      message:
        'Ahora que lo dices, sí, tira levemente hacia la derecha cuando freno fuerte en la carretera.',
    },
  ],
  hypotheses: [
    {
      id: 'h1',
      hypothesis:
        'Pastillas de freno delanteras derechas desgastadas al límite (indicador metálico rozando el disco)',
      confidence: 0.8,
      status: 'ACTIVE',
      reasoning:
        'El ruido metálico chirriante, el patrón de empeoramiento con más de 40.000 km sin cambio, y que sea peor frenando suave (el indicador roza más con presión ligera y sostenida) son consistentes con el indicador de desgaste de las pastillas.',
    },
    {
      id: 'h2',
      hypothesis:
        'Disco de freno delantero derecho deformado o con desgaste irregular',
      confidence: 0.65,
      status: 'ACTIVE',
      reasoning:
        'La vibración en el pedal (no en el volante) y el tirón hacia la derecha al frenar fuerte son compatibles con un disco alabeado o con espesor irregular en esa rueda, generando fuerza de frenado desigual entre lados.',
    },
    {
      id: 'h3',
      hypothesis: 'Caliper de freno delantero derecho parcialmente atascado',
      confidence: 0.4,
      status: 'ACTIVE',
      reasoning:
        'Un caliper que no libera del todo podría explicar el tirón hacia un lado y el ruido localizado, aunque no explica bien por qué el ruido casi desaparece al frenar fuerte — evidencia parcial, no descartado.',
    },
    {
      id: 'h4',
      hypothesis: 'Bajo nivel de líquido de frenos por fuga',
      confidence: 0.2,
      status: 'DISCARDED',
      reasoning:
        'Se descartó como causa principal: un nivel bajo de líquido explicaría un pedal esponjoso o largo recorrido, pero no un ruido metálico ni un patrón tan localizado a una rueda específica.',
    },
    {
      id: 'h5',
      hypothesis:
        'Polín o guía del caliper delantero derecho suelto/desgastado',
      confidence: 0.35,
      status: 'PARTIALLY_CONFIRMED',
      reasoning:
        'Consistente con el tirón hacia la derecha y el ruido intermitente, pero falta confirmar con inspección visual directa del carril de deslizamiento del caliper.',
    },
    {
      id: 'h6',
      hypothesis:
        'Desgaste desigual entre pastillas delanteras (derecha mucho más gastada que izquierda)',
      confidence: 0.55,
      status: 'ACTIVE',
      reasoning:
        'Explicaría por qué el síntoma se concentra de un lado y no es simétrico, algo esperable si el caliper derecho ya viene funcionando de forma subóptima (ver h3/h5) y desgasta esa pastilla más rápido.',
    },
  ],
  evidence: [],
  citedDocumentation: [],
};

async function main(): Promise<void> {
  const apiKey = process.env.AI_API_KEY_CLAUDE;
  const model = process.env.AI_MODEL ?? 'claude-sonnet-5';
  if (!apiKey) {
    console.error('Falta AI_API_KEY_CLAUDE en el entorno (.env)');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log(
    `Midiendo con modelo ${model}, 6 hipótesis, sin evidencia, sin doc citada...`,
  );

  const response = await client.messages.create({
    model,
    max_tokens: 8000, // alto a propósito, para no truncar la MEDICIÓN misma
    system: buildReportGenerationPrompt(),
    messages: [
      { role: 'user', content: buildReportContextPrompt(context, null) },
    ],
    tools: [REPORT_TOOL],
    tool_choice: { type: 'tool', name: 'submit_report' },
  });

  console.log('stop_reason:', response.stop_reason);
  console.log('usage:', JSON.stringify(response.usage, null, 2));

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (toolUse && toolUse.type === 'tool_use') {
    const input = toolUse.input as { hypotheses?: unknown[] };
    console.log('hipótesis devueltas:', input.hypotheses?.length);
    console.log(
      'tamaño JSON del input (chars):',
      JSON.stringify(toolUse.input).length,
    );
  }
}

void main();
