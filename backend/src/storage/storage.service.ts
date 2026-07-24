import { createHash } from 'node:crypto';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  STORAGE_CLIENT,
  StorageSupabaseClient,
} from './storage-client.provider';

// Bucket privado dedicado a evidencia (§9.8/D-011 del Decisions Log) —
// se crea a mano en el dashboard de Supabase, el backend nunca lo crea
// (mismo criterio que "JWT Signing Keys" en D-004). Si una fase futura
// (Reports/PDF) necesita otro bucket, este valor pasa a ser un parámetro
// de los métodos — no se generaliza antes de que haga falta.
const EVIDENCE_BUCKET = 'evidence';

export interface UploadObjectResult {
  checksum: string;
}

/**
 * Único módulo que conoce Supabase Storage (§13.3). Sube/descarga
 * objetos y genera URLs firmadas — nunca expone la ruta cruda ni el
 * `service_role` key al cliente.
 */
@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_CLIENT) private readonly client: StorageSupabaseClient,
  ) {}

  async uploadObject(
    path: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<UploadObjectResult> {
    const { error } = await this.client.storage
      .from(EVIDENCE_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo subir el archivo a Storage: ${error.message}`,
      );
    }

    const checksum = createHash('sha256').update(buffer).digest('hex');
    return { checksum };
  }

  async downloadObject(path: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from(EVIDENCE_BUCKET)
      .download(path);

    if (error || !data) {
      throw new InternalServerErrorException(
        `No se pudo descargar el archivo de Storage: ${error?.message ?? 'sin datos'}`,
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getSignedUrl(path: string, expiresInSeconds = 900): Promise<string> {
    const { data, error } = await this.client.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new InternalServerErrorException(
        `No se pudo generar la URL firmada: ${error?.message ?? 'sin datos'}`,
      );
    }

    return data.signedUrl;
  }
}
