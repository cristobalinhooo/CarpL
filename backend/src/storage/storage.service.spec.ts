import { createHash } from 'node:crypto';
import { InternalServerErrorException } from '@nestjs/common';
import type { StorageSupabaseClient } from './storage-client.provider';
import { StorageService } from './storage.service';

interface FakeBucketApi {
  upload: jest.Mock;
  download: jest.Mock;
  createSignedUrl: jest.Mock;
}

describe('StorageService', () => {
  let bucketApi: FakeBucketApi;
  let client: { storage: { from: jest.Mock } };
  let service: StorageService;

  beforeEach(() => {
    bucketApi = {
      upload: jest.fn(),
      download: jest.fn(),
      createSignedUrl: jest.fn(),
    };
    client = { storage: { from: jest.fn().mockReturnValue(bucketApi) } };
    service = new StorageService(client as unknown as StorageSupabaseClient);
  });

  describe('uploadObject', () => {
    it('sube al bucket "evidence" y devuelve el checksum SHA-256 del buffer', async () => {
      bucketApi.upload.mockResolvedValue({ error: null });
      const buffer = Buffer.from('contenido de prueba');

      const result = await service.uploadObject(
        'investigations/inv-1/evidence/ev-1',
        buffer,
        'image/jpeg',
      );

      expect(client.storage.from).toHaveBeenCalledWith('evidence');
      expect(bucketApi.upload).toHaveBeenCalledWith(
        'investigations/inv-1/evidence/ev-1',
        buffer,
        { contentType: 'image/jpeg', upsert: false },
      );
      expect(result.checksum).toBe(
        createHash('sha256').update(buffer).digest('hex'),
      );
    });

    it('lanza InternalServerErrorException si Supabase devuelve error', async () => {
      bucketApi.upload.mockResolvedValue({
        error: { message: 'bucket no existe' },
      });

      await expect(
        service.uploadObject('path', Buffer.from('x'), 'image/jpeg'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('downloadObject', () => {
    it('devuelve un Buffer con el contenido del archivo', async () => {
      const originalBytes = new Uint8Array([1, 2, 3, 4]);
      bucketApi.download.mockResolvedValue({
        data: { arrayBuffer: () => Promise.resolve(originalBytes.buffer) },
        error: null,
      });

      const result = await service.downloadObject('path');

      expect(result).toBeInstanceOf(Buffer);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    it('lanza InternalServerErrorException si Supabase devuelve error', async () => {
      bucketApi.download.mockResolvedValue({
        data: null,
        error: { message: 'no encontrado' },
      });

      await expect(service.downloadObject('path')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('getSignedUrl', () => {
    it('devuelve la URL firmada con el expiresIn por defecto (900s)', async () => {
      bucketApi.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed.example/path' },
        error: null,
      });

      const result = await service.getSignedUrl('path');

      expect(bucketApi.createSignedUrl).toHaveBeenCalledWith('path', 900);
      expect(result).toBe('https://signed.example/path');
    });

    it('lanza InternalServerErrorException si Supabase devuelve error', async () => {
      bucketApi.createSignedUrl.mockResolvedValue({
        data: null,
        error: { message: 'no autorizado' },
      });

      await expect(service.getSignedUrl('path')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
