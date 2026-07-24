// Tipos planos, sin importar `@prisma/client` a propósito — mismo
// principio de independencia de proveedor que `vehicle-data-provider/`
// y `ai/` (§9.8: "Embedding Provider (configurable, desacoplado del
// proveedor de IA conversacional)").

export interface EmbeddingProvider {
  readonly name: string;
  /** Dimensión del vector que devuelve `embed()` — debe calzar con la
   * columna `vector(N)` de `DocumentChunk.embedding`. */
  readonly dimension: number;
  embed(text: string): Promise<number[]>;
}
