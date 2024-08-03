import { User } from "src/entities/user.entity"

export enum NotificationAction {
	REQUEST_CREDENTIALS = 'REQUEST_CREDENTIALS',
}

export interface NotificationExtra {
	action?: NotificationAction
}

export interface NotificationServiceType {
	sendNotification(user: User, message: string, notificationBody: NotificationExtra): Promise<void>
}