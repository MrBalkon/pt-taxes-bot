import { User } from 'src/entities/user.entity';

export enum NotificationAction {
  REQUEST_CREDENTIALS = 'REQUEST_CREDENTIALS',
  REQUEST_DATA = 'REQUEST_DATA',
  VIEW_PAYMENTS = 'VIEW_PAYMENTS',
  PAYMENTS_CREATED = 'PAYMENTS_CREATED',
  REQUEST_FIELDS = 'REQUEST_FIELDS',
  REQUEST_FIELD = 'REQUEST_FIELD',
  REQUEST_OPTIONS_FIELD_SUBMITION = 'REQUEST_OPTIONS_FIELD_SUBMITION',
  CALL_TASK = 'CALL_TASK',
}

export interface NotificationRequestDataData {
  fields: string[];
}

export interface NotificationExtra<T = any> {
  action?: NotificationAction;
  data?: T;
}

export interface NotificationServiceType {
  sendNotification(
    user: User,
    message: string,
    notificationBody: NotificationExtra,
  ): Promise<void>;
}
