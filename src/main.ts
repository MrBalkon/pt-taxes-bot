import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { init as initSentry } from '@sentry/node';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { ConfigService } from './modules/config/config.service';
import { resolveDynamicProviders } from 'nestjs-dynamic-providers';

async function bootstrap() {
  await resolveDynamicProviders();
  const app = await NestFactory.create(AppModule);

  const config: ConfigService = app.get(ConfigService);

  initSentry({
    dsn: config.get('SENTRY_DSN'),
  });

  app.useLogger(config.get('LOG_LEVEL'));

  app.useGlobalPipes(new ValidationPipe());

  app.use(json({ limit: '100mb' }));
  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(config.get('PORT'));
}
bootstrap();