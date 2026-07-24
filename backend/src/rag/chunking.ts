const DEFAULT_MAX_CHARS = 1000;

/**
 * Split simple por párrafos, con fallback a corte duro cuando un párrafo
 * solo excede `maxChars` — sin dependencia de tokenizer real (el corpus
 * está vacío en esta fase, no hace falta una estrategia sofisticada
 * todavía). Nunca devuelve fragmentos vacíos.
 */
export function chunkText(
  text: string,
  maxChars: number = DEFAULT_MAX_CHARS,
): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
    } else {
      for (let i = 0; i < paragraph.length; i += maxChars) {
        chunks.push(paragraph.slice(i, i + maxChars));
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

/** Aproximación de tokens (~4 caracteres/token en inglés), documentada
 * como estimación — sin dependencia de un tokenizer real todavía. */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
