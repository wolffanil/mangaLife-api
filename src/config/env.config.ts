import { ConfigModuleOptions } from '@nestjs/config';

export const getEnvConfig = (): ConfigModuleOptions => ({
  envFilePath: '.env',
  isGlobal: true,
});
