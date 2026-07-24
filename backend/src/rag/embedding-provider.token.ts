// Token en archivo propio, separado de `rag.module.ts` a propósito — mismo
// motivo que `ANTHROPIC_CLIENT` vive en `anthropic-client.provider.ts` y no
// en `ai.module.ts`: si el módulo importara a los servicios y los
// servicios importaran el token desde el módulo, se forma una dependencia
// circular real entre dos archivos que rompe la inyección en tiempo de
// ejecución (el símbolo llega `undefined` al decorador `@Inject`, aunque
// los tests unitarios que instancian la clase a mano no lo detectan).
export const EMBEDDING_PROVIDER = Symbol('EMBEDDING_PROVIDER');
