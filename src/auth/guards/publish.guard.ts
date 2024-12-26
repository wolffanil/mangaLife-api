import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument, UserRole } from 'src/user/schemas/user.model';

export class OnlyPublishGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: UserDocument }>();

    const user = request?.user;

    if (user.role !== UserRole.PUBLISH)
      throw new ForbiddenException('Ты не имеишь прав публикаций');

    return user.role === UserRole.PUBLISH;
  }
}
