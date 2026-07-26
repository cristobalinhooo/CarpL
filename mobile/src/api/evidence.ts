import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `backend/src/evidence/dto/create-evidence.dto.ts`
 * y los modelos Prisma `Evidence`/`Attachment`/`Job`. `upload()` sube
 * un archivo real y encola un análisis real de Claude Vision (costo
 * real solo para `IMAGE` — D-011 del backend, `VIDEO`/`AUDIO` nunca
 * generan `analysisJson`) — ver el plan de esta fase.
 */
export type EvidenceType = 'IMAGE' | 'VIDEO' | 'AUDIO';
export type JobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export interface Attachment {
  id: string;
  evidenceId: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  uploadedAt: string;
  signedUrl: string;
}

export interface EvidenceJob {
  id: string;
  jobType: 'ANALYZE_EVIDENCE' | 'GENERATE_REPORT';
  status: JobStatus;
  attempts: number;
  lastError: string | null;
}

export interface EvidenceAnalysis {
  variables?: string[];
  summary?: string | null;
}

export interface Evidence {
  id: string;
  investigationId: string;
  evidenceType: EvidenceType;
  description: string | null;
  analysisJson: EvidenceAnalysis | null;
  uploadedAt: string;
  job: EvidenceJob | null;
  attachments: Attachment[];
}

export interface UploadEvidenceInput {
  evidenceType: EvidenceType;
  description?: string;
  file: {
    uri: string;
    mimeType: string;
    fileName: string;
  };
}

export async function upload(
  investigationId: string,
  input: UploadEvidenceInput,
  accessToken: string,
): Promise<{ evidence: Evidence; jobId: string }> {
  // El objeto {uri, type, name} es un atajo que solo entiende el
  // `FormData` nativo de React Native (iOS/Android) — en web
  // (`react-native-web`) `FormData` es la implementación real del
  // DOM y lo ignora, produciendo un multipart sin archivo real
  // (confirmado en vivo: el backend nunca recibía el archivo).
  // `fetch(uri).blob()` sí funciona igual en ambas plataformas —
  // Expo también sabe resolver URIs `file://` locales — así que se
  // usa ese único camino para los dos.
  const fileResponse = await fetch(input.file.uri);
  const fileBlob = await fileResponse.blob();

  const formData = new FormData();
  formData.append('evidenceType', input.evidenceType);
  if (input.description) {
    formData.append('description', input.description);
  }
  formData.append('file', fileBlob, input.file.fileName);

  return apiFetch(`/investigations/${investigationId}/evidence`, {
    method: 'POST',
    body: formData,
    accessToken,
  });
}

export function findAll(
  investigationId: string,
  accessToken: string,
): Promise<Evidence[]> {
  return apiFetch(`/investigations/${investigationId}/evidence`, { accessToken });
}
