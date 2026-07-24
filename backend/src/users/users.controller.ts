import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  profileImage: string | null;
}

function toProfile(user: {
  id: string;
  email: string;
  fullName: string;
  profileImage: string | null;
}): UserProfileResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    profileImage: user.profileImage,
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): UserProfileResponse {
    return toProfile(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileResponse> {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return toProfile(updated);
  }

  @Delete('me')
  async deleteMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ deleted: true }> {
    await this.usersService.softDelete(user.id);
    return { deleted: true };
  }
}
