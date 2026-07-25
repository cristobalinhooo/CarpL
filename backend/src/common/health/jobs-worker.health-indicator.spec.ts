import { HealthCheckError } from '@nestjs/terminus';
import { JobsWorkerHealthIndicator } from './jobs-worker.health-indicator';

describe('JobsWorkerHealthIndicator', () => {
  function buildIndicator(lastSuccessfulPollAt: Date, pollIntervalMs = 2000) {
    const jobsWorker = {
      getLastSuccessfulPollAt: jest.fn().mockReturnValue(lastSuccessfulPollAt),
      getPollIntervalMs: jest.fn().mockReturnValue(pollIntervalMs),
    };
    const indicator = new JobsWorkerHealthIndicator(jobsWorker as never);
    return { indicator, jobsWorker };
  }

  it('reporta saludable cuando el último poll fue reciente', () => {
    const { indicator } = buildIndicator(new Date());

    const result = indicator.isHealthy('jobsWorker');

    expect(result.jobsWorker.status).toBe('up');
  });

  it('lanza HealthCheckError cuando el último poll excede 3x el intervalo', () => {
    const pollIntervalMs = 1000;
    const staleDate = new Date(Date.now() - pollIntervalMs * 3 - 1);
    const { indicator } = buildIndicator(staleDate, pollIntervalMs);

    expect(() => indicator.isHealthy('jobsWorker')).toThrow(HealthCheckError);
  });
});
