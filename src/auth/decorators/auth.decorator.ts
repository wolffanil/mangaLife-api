import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { TypeRole } from '../auth.interface';
import { OnlyPublishGuard } from '../guards/publish.guard';

export const Auth = (role: TypeRole = 'user') =>
  applyDecorators(
    role === 'admin'
      ? UseGuards(JwtAuthGuard, OnlyAdminGuard)
      : role === 'publish'
        ? UseGuards(JwtAuthGuard, OnlyPublishGuard)
        : UseGuards(JwtAuthGuard),
  );
