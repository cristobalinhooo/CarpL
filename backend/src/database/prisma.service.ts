import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Deliberadamente no se llama a `$connect()` en `onModuleInit`: Prisma
// conecta de forma perezosa en la primera consulta. Esto permite que el
// proceso arranque (liveness = ok) incluso si PostgreSQL está
// temporalmente inaccesible; la disponibilidad real de la base de datos
// se refleja en /health/ready (PrismaHealthIndicator), no bloqueando el
// arranque completo de la aplicación (§13.10).
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
