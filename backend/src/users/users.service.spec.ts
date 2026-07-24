import type { User } from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';

interface FakePrisma {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
}

describe('UsersService', () => {
  let prisma: FakePrisma;
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new UsersService(prisma as unknown as PrismaService);
  });

  describe('findOrCreateBySupabaseId', () => {
    it('devuelve el usuario existente sin crear uno nuevo', async () => {
      const existing = {
        id: '1',
        supabaseAuthId: 'sb-1',
        email: 'a@a.com',
        fullName: 'A',
        profileImage: null,
      } as User;
      prisma.user.findUnique.mockResolvedValue(existing);

      const result = await service.findOrCreateBySupabaseId('sb-1', {
        email: 'a@a.com',
        fullName: 'A',
      });

      expect(result).toBe(existing);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('crea el usuario con los datos del JWT si no existe todavía', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const created = {
        id: '2',
        supabaseAuthId: 'sb-2',
        email: 'b@b.com',
        fullName: 'B',
        profileImage: null,
      } as User;
      prisma.user.create.mockResolvedValue(created);

      const result = await service.findOrCreateBySupabaseId('sb-2', {
        email: 'b@b.com',
        fullName: 'B',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { supabaseAuthId: 'sb-2', email: 'b@b.com', fullName: 'B' },
      });
      expect(result).toBe(created);
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt en vez de borrar la fila', async () => {
      prisma.user.update.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await service.softDelete('1');

      // `expect.any(Date)` es intencionalmente `any` en los tipos de Jest;
      // no hay forma de tipar esto de forma estricta sin perder el matcher.
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });
  });

  describe('updateProfile', () => {
    it('solo envía los campos presentes en el DTO', async () => {
      prisma.user.update.mockResolvedValue({});

      await service.updateProfile('1', { fullName: 'Nuevo Nombre' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { fullName: 'Nuevo Nombre' },
      });
    });
  });
});
