import { Injectable } from '@nestjs/common';
import type { EmbeddingProvider } from '../embedding-provider.interface';

/**
 * Sin proveedor real todavía (mismo criterio que `NullVehicleDataProvider`):
 * devuelve un vector cero determinístico, sin ninguna llamada de red. Esto
 * permite que el pipeline real de inserción/consulta contra `pgvector`
 * corra de verdad (SQL real, no mockeado) sin depender de una API externa
 * ni costo — con el corpus vacío de esta fase, el resultado de cualquier
 * búsqueda sigue siendo "sin resultados" de todas formas.
 */
@Injectable()
export class NullEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'null';
  readonly dimension = 1536;

  embed(_text: string): Promise<number[]> {
    return Promise.resolve(new Array<number>(this.dimension).fill(0));
  }
}
