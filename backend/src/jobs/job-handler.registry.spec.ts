import { JobHandlerRegistry } from './job-handler.registry';
import { Job, JobType } from './jobs.types';

describe('JobHandlerRegistry', () => {
  it('devuelve undefined cuando no hay handler registrado para el tipo', () => {
    const registry = new JobHandlerRegistry();

    expect(registry.get(JobType.ANALYZE_EVIDENCE)).toBeUndefined();
  });

  it('devuelve el handler registrado para el tipo correspondiente', () => {
    const registry = new JobHandlerRegistry();
    const execute = jest.fn().mockResolvedValue(undefined);

    registry.register(JobType.GENERATE_REPORT, { execute });

    expect(registry.get(JobType.GENERATE_REPORT)).toEqual({ execute });
    expect(registry.get(JobType.ANALYZE_EVIDENCE)).toBeUndefined();
  });

  it('no confunde handlers de distintos tipos de job', async () => {
    const registry = new JobHandlerRegistry();
    const evidenceHandler = { execute: jest.fn().mockResolvedValue(undefined) };
    const reportHandler = { execute: jest.fn().mockResolvedValue(undefined) };

    registry.register(JobType.ANALYZE_EVIDENCE, evidenceHandler);
    registry.register(JobType.GENERATE_REPORT, reportHandler);

    const job = {} as Job;
    await registry.get(JobType.ANALYZE_EVIDENCE)?.execute(job);

    expect(evidenceHandler.execute).toHaveBeenCalledWith(job);
    expect(reportHandler.execute).not.toHaveBeenCalled();
  });
});
