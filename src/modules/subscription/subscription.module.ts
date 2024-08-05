import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPackage } from 'src/entities/subscription-package.entity';
import { SubscriptionPackageFeature } from 'src/entities/subscription-feature.entity';
import { UserSubscription } from 'src/entities/user-subscription.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { FeatureModule } from '../feature/feature.module';
import { TaskProcessingQueueModule } from '../task-processing-queue/task-processing.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([SubscriptionPackage, SubscriptionPackageFeature, UserSubscription]),
		NotificationModule,
		UserModule,
		FeatureModule,
		TaskProcessingQueueModule,
	],
	controllers: [],
	providers: [SubscriptionService],
	exports: [SubscriptionService],
})
export class SubscriptionModule {};