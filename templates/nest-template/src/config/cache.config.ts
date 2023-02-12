import * as redisStore from 'cache-manager-redis-store';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/common';

export class CacheConfig implements CacheOptionsFactory {
  createCacheOptions():
    | CacheModuleOptions<Record<string, any>>
    | Promise<CacheModuleOptions<Record<string, any>>> {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    };
  }
}
