import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import Redis from 'ioredis';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService): BullRootModuleOptions {
        const host = config.get('REDIS_HOST');
        const port = config.get('REDIS_PORT');
        return {
          redis: {
			name: 'default',
            host,
            port,
            // username: config.get('REDIS_USERNAME'),
            password: config.get('REDIS_PASSWORD'),
            // keyPrefix: config.get('REDIS_KEY_PREFIX'),
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
            db: 0,
            showFriendlyErrorStack: true,
            // tls: {
            //   checkServerIdentity: () => {
            //     // skip certificate hostname validation
            //     return undefined;
            //   },
            // },
          },
        //   createClient: (_type, opts) => {
        //     return new Redis.Cluster([{ host, port }], {
        //       scaleReads: 'all',
        //       enableAutoPipelining: false,
        //       showFriendlyErrorStack: true,
        //       redisOptions: opts,
        //     });
        //   },
        };
      },
    }),
  ],
})
export class BullConfigModule {}