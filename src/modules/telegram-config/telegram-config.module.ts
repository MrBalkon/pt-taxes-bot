import { Module, NotFoundException } from '@nestjs/common';
import { Postgres } from '@telegraf/session/pg';
import { PostgresAdapter } from 'kysely';
import { TelegrafModule, TelegrafModuleOptions } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { TelegramModule } from '../telegram/telegram.module';
import { TelegramService } from './telegram.service';
import { QuestionModule } from '../question/question.module';

const store = (config: ConfigService) => {
  return Postgres<PostgresAdapter>({
    database: config.get('DB_DATABASE'),
    host: config.get('DB_HOST'),
    user: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    port: config.get('DB_PORT'),
    onInitError(err) {
      throw new NotFoundException(`Config value in not found`, err);
    },
  });
};

@Module({
  imports: [
    QuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService): TelegrafModuleOptions {
        return {
          botName: 'test',
          middlewares: [session({ store: store(config) })],
          token: config.get('TELEGRAM_BOT_TOKEN'),
          include: [TelegramModule],
        };
      },
    }),
  ],
  controllers: [],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegamConfigModule {}
