import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getRedisConfig = async (
  configService: ConfigService,
): Promise<CacheModuleOptions> => ({
  store: await redisStore({
    url: configService.getOrThrow<string>('REDIS_URI'),
  }),
  max: 100,
});
