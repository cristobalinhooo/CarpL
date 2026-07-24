import { Module } from '@nestjs/common';
import { storageClientProvider } from './storage-client.provider';
import { StorageService } from './storage.service';

@Module({
  providers: [storageClientProvider, StorageService],
  exports: [StorageService],
})
export class StorageModule {}
