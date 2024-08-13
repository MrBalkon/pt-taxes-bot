import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Module provide access to environment variables
 * Should be injected at first at root module
 */
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
