import { UserThrottlerGuard } from './user-throttler.guard';

describe('UserThrottlerGuard', () => {
  // El constructor de `ThrottlerGuard` exige varias dependencias que no
  // hacen falta para probar `getTracker` en aislamiento — se castea sin
  // instanciarlas, mismo criterio que otros tests de este proyecto que
  // solo ejercitan un método puntual de una clase con dependencias
  // pesadas en el constructor.
  const guard = Object.create(
    UserThrottlerGuard.prototype,
  ) as UserThrottlerGuard;

  // `getTracker` es `protected` — se invoca vía índice para no exponerlo
  // públicamente en la clase real solo por conveniencia de test.
  function getTracker(req: unknown): Promise<string> {
    return (
      guard as unknown as { getTracker(req: unknown): Promise<string> }
    ).getTracker(req);
  }

  it('trackea por request.user.id cuando existe (poblado por SupabaseJwtGuard)', async () => {
    const tracker = await getTracker({
      user: { id: 'user-123' },
      ip: '203.0.113.5',
    });
    expect(tracker).toBe('user-123');
  });

  it('cae a la IP cuando no hay usuario autenticado (rutas @Public())', async () => {
    const tracker = await getTracker({ user: undefined, ip: '203.0.113.5' });
    expect(tracker).toBe('203.0.113.5');
  });

  it('cae a "unknown" si no hay ni usuario ni IP (caso extremo)', async () => {
    const tracker = await getTracker({ user: undefined, ip: undefined });
    expect(tracker).toBe('unknown');
  });
});
