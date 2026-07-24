import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

export interface CreateUserInput {
  supabaseAuthId: string;
  email: string;
  fullName: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySupabaseId(supabaseAuthId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { supabaseAuthId } });
  }

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input });
  }

  /**
   * Red de seguridad para `SupabaseJwtGuard`: si un JWT válido no tiene
   * fila local todavía (p. ej. identidad creada fuera de
   * `POST /auth/register`), se provisiona con lo disponible en el propio
   * JWT en vez de rechazar la request.
   */
  async findOrCreateBySupabaseId(
    supabaseAuthId: string,
    fallback: { email: string; fullName: string },
  ): Promise<User> {
    const existing = await this.findBySupabaseId(supabaseAuthId);
    if (existing) return existing;

    return this.create({ supabaseAuthId, ...fallback });
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.profileImage !== undefined
          ? { profileImage: dto.profileImage }
          : {}),
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
