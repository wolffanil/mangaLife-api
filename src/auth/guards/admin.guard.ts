import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument, UserRole } from 'src/user/schemas/user.model';

export class OnlyAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: UserDocument }>();

    const user = request?.user;

    if (user.role !== UserRole.ADMIN)
      throw new ForbiddenException('Ты не имеешь прав админа');

    return user.role === UserRole.ADMIN;
  }
}
