import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { JobsWorker } from '../../jobs/jobs.worker';

// Margen sobre el intervalo de polling normal antes de considerar al
// worker "silencioso" — tolera algún ciclo lento sin generar falsos
// positivos, pero detecta un worker realmente trabado.
const STALE_POLL_MULTIPLIER = 3;

/**
 * §13.10 exige verificar explícitamente la disponibilidad del worker de
 * `jobs` — un proceso vivo pero con el timer de polling trabado dejaría
 * Evidencia/Informes colgados sin que `/health/ready` lo reflejara.
 */
@Injectable()
export class JobsWorkerHealthIndicator extends HealthIndicator {
  constructor(private readonly jobsWorker: JobsWorker) {
    super();
  }

  isHealthy(key: string): HealthIndicatorResult {
    const lastPollAt = this.jobsWorker.getLastSuccessfulPollAt();
    const staleAfterMs =
      this.jobsWorker.getPollIntervalMs() * STALE_POLL_MULTIPLIER;
    const msSinceLastPoll = Date.now() - lastPollAt.getTime();

    if (msSinceLastPoll > staleAfterMs) {
      throw new HealthCheckError(
        'El worker de jobs dejó de hacer polling',
        this.getStatus(key, false, {
          lastSuccessfulPollAt: lastPollAt.toISOString(),
        }),
      );
    }

    return this.getStatus(key, true, {
      lastSuccessfulPollAt: lastPollAt.toISOString(),
    });
  }
}
