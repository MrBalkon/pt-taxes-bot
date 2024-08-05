import { User } from "src/entities/user.entity"

export enum NotificationAction {
	REQUEST_CREDENTIALS = 'REQUEST_CREDENTIALS',
	REQUEST_DATA = "REQUEST_DATA",
}

export interface NotificationExtra {
	action?: NotificationAction
}

export interface NotificationServiceType {
	sendNotification(user: User, message: string, notificationBody: NotificationExtra): Promise<void>
}