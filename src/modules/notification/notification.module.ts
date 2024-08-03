import { Module } from '@nestjs/common';
import { NotificaitonService } from './notification.service';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';

@Module({
	imports: [TelegamConfigModule],
	controllers: [],
	providers: [NotificaitonService],
})
export class NotificationModule {};