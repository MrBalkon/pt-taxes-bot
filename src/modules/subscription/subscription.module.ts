import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPackage } from 'src/entities/subscription-package.entity';
import { SubscriptionPackageFeature } from 'src/entities/subscription-feature.entity';
import { UserSubscription } from 'src/entities/user-subscription.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { FeatureModule } from '../feature/feature.module';
import { TaskProcessingQueueModule } from '../task-processing-queue/task-processing-queue.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([SubscriptionPackage, SubscriptionPackageFeature, UserSubscription]),
		NotificationModule,
		UserModule,
		FeatureModule,
		forwardRef(() => TaskProcessingQueueModule),
	],
	controllers: [],
	providers: [SubscriptionService],
	exports: [SubscriptionService],
})
export class SubscriptionModule {};