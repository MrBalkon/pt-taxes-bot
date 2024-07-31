import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './modules/config/config.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import * as path from 'path';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { DatabaseModule } from './modules/database/database.module';
import { BullConfigModule } from './modules/bull-config/bull-config.module';
import { TaskProcessingModule } from './modules/task-processing/task-processing.module';
import { UserModule } from './modules/user/user.module';
import { SeleniumModule } from './modules/selenium/selenium.module';
import { TaskSheduleModule } from './modules/task-schedule/task-schedule.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BullConfigModule,
    TaskProcessingModule,
    UserModule,
    SeleniumModule,
    TaskSheduleModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
