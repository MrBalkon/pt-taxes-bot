import { Injectable } from '@nestjs/common';
import { TelegramService } from '../telegram-config/telegram.service';
import { User } from 'src/entities/user.entity';
import { NotificationExtra } from './notification.types';

@Injectable()
export class NotificaitonService {
  constructor(private readonly telegramService: TelegramService) {}

  async sendNotification(
    user: User,
    message: string,
    notificationBody?: NotificationExtra,
  ) {
    if (user.telegramId !== null) {
      await this.telegramService.sendNotification(
        user,
        message,
        notificationBody,
      );
    }
  }
}
