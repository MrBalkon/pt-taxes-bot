import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPackageFeature } from 'src/entities/subscription-feature.entity';
import { SubscriptionPackage, SubscriptionPeriodType } from 'src/entities/subscription-package.entity';
import { UserSubscription } from 'src/entities/user-subscription.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { NotificaitonService } from '../notification/notification.service';
import { NotificationAction } from '../notification/notification.types';
import { UserService } from '../user/user.service';
import { FeatureService } from '../feature/feature.service';
import { TaskProcessingQueueService } from '../task-processing-queue/task-processing-queue.service';
import { TaskProcessingJobName } from '../task-processing-queue/task-processing.types';

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectRepository(SubscriptionPackage)
		private readonly subscriptionPackageRepository: Repository<SubscriptionPackage>,
		@InjectRepository(SubscriptionPackageFeature)
		private readonly subscriptionPackageFeatureRepository: Repository<SubscriptionPackageFeature>,
		@InjectRepository(UserSubscription)
		private readonly userSubscriptionRepository: Repository<UserSubscription>,
		private readonly notificationService: NotificaitonService,
		private readonly userService: UserService,
		private readonly featuresService: FeatureService,
		@InjectDataSource() private connection: DataSource,
		private taskProcessingQueueService: TaskProcessingQueueService,
	) {}

	async getUniquePeriodTypes() {
		return this.subscriptionPackageRepository.createQueryBuilder('package')
			.select('DISTINCT package.periodType')
			.getRawMany();
	}

	async getSubscriptionPackagesGroupedByName() {
		const packages = await this.subscriptionPackageRepository.createQueryBuilder('package')
			.select(`
				package.name as "name",
				JSON_AGG(package.periodType) as "periodType"
			`)
			.groupBy('package.name')
			.execute() as { name: string, periodType: string[] }[];

		return packages;
	}

	async getSubscriptionPackagesByName(name: string) {
		return this.subscriptionPackageRepository.createQueryBuilder('package')
			.leftJoinAndSelect('package.subscriptionPackageFeatures', 'subscriptionPackageFeatures')
			.leftJoinAndSelect('subscriptionPackageFeatures.feature', 'feature')
			.where('package.name = :name', { name })
			.getMany();
	}

	async getSubscriptionPackages() {
		return this.subscriptionPackageRepository.find();
	}

	async getSubscriptionPackagesByPeriodType(periodType: SubscriptionPeriodType) {
		return this.subscriptionPackageRepository.findBy({ periodType });
	}

	async getUnactiveSubscriptionsWithFeatures() {
		// get subscription with endDate < now and existing related features
		const endDate = DateTime.now().toJSDate();

		return this.userSubscriptionRepository.createQueryBuilder('subscription')
			.select('subscription.id')
			.leftJoinAndSelect('subscription.subscriptionPackage', 'subscriptionPackage')
			.leftJoinAndSelect('subscriptionPackage.subscriptionPackageFeatures', 'subscriptionPackageFeatures')
			.leftJoinAndSelect('subscriptionPackageFeatures.feature', 'feature')
			.where('subscription.endDate < :endDate', { endDate })
			.groupBy('subscription.id')
			.having('COUNT(feature.id) > 0')
			.getMany();
	}

	async findActiveUserSubscription(userId: number) {
		const endDate = DateTime.now().toJSDate();

		const userSubscription = await this.userSubscriptionRepository
			.createQueryBuilder('userSubscription')
			.where('userSubscription.userId = :userId', { userId })
			.andWhere('userSubscription.startDate <= :endDate', { endDate })
			.andWhere('userSubscription.endDate >= :endDate', { endDate })
			.getOne();

		return userSubscription;
	}

	async findActiveUserSubscriptionByTelegramId(telegramId: string) {
		const endDate = DateTime.now().toJSDate();

		const userSubscription = await this.userSubscriptionRepository.createQueryBuilder('subscription')
			.leftJoinAndSelect('subscription.subscription', 'subscriptionPackage')
			.leftJoin('subscription.user', 'user')
			.where('user.telegramId = :telegramId', { telegramId })
			.andWhere('subscription.startDate <= :endDate', { endDate })
			.andWhere('subscription.endDate >= :endDate', { endDate })
			.getOne();

		return userSubscription;
	}

	async getUserSubscriptionPackageFeatures(userId: number) {
		// do it using one query
		const userSubscription = await this.findActiveUserSubscription(userId);

		if (!userSubscription) {
			return [];
		}

		const subscriptionPackageFeatures = await this.subscriptionPackageFeatureRepository.createQueryBuilder('subscriptionPackageFeature')
			.leftJoinAndSelect('subscriptionPackageFeature.subscriptionPackage', 'subscriptionPackage')
			.leftJoinAndSelect('subscriptionPackageFeature.feature', 'feature')
			.where('subscriptionPackage.id = :subscriptionPackageId', { subscriptionPackageId: userSubscription.subscriptionPackageId })
			.getMany();

		return subscriptionPackageFeatures.map((subscriptionPackageFeature) => subscriptionPackageFeature.feature);
	}

	async createUserSubscription(userId: number, subscriptionPackageId: number, manager: EntityManager = this.connection.manager) {
		const subscriptionPackage = await this.subscriptionPackageRepository.createQueryBuilder('package')
			.leftJoinAndSelect('package.subscriptionPackageFeatures', 'subscriptionPackageFeatures')
			.leftJoinAndSelect('subscriptionPackageFeatures.feature', 'feature')
			.where('package.id = :subscriptionPackageId', { subscriptionPackageId })
			.getOne();

		if (!subscriptionPackage) {
			throw new NotFoundException('Subscription package not found');
		}

		const startDate = DateTime.now().toJSDate();
		const endDate = DateTime.now().plus({ [subscriptionPackage.periodType]: 1 }).toJSDate();

		const userSubscription = this.userSubscriptionRepository.create({
			userId,
			subscriptionPackageId: subscriptionPackageId,
			startDate,
			endDate,
		});

		await manager.transaction(async (manager) => {
			await manager.save(UserSubscription, userSubscription);

			const user = await this.userService.getUserById(userId, manager);
			const features = subscriptionPackage.subscriptionPackageFeatures.map((feature) => feature.feature);

			await this.featuresService.grantAccessToFeatures(userId, features.map((feature) => feature.id), manager);

			const featureNames = features.map((feature) => feature.name).join(', ');

			await this.notificationService.sendNotification(
				user,
				`You have been granted access to features ${featureNames}.\n Please, wait for our system to process your request and prepare your tasks`,
			);
		})

		await this.taskProcessingQueueService.addQueueJob({
			type: TaskProcessingJobName.TASK_MANAGER,
			userId,
			data: undefined
		})
	}

	async deleteSubscriptionAcesses(userSubscription: UserSubscription, manager: EntityManager = this.connection.manager) {
		await manager.transaction(async (manager) => {
			const user = await this.userService.getUserById(userSubscription.userId, manager);
			const features = await this.getUserSubscriptionPackageFeatures(userSubscription.userId);

			await this.featuresService.deleteAccessToFeatures(userSubscription.userId, features.map((feature) => feature.id), manager);

			const featureNames = features.map((feature) => feature.name).join(', ');
			await this.notificationService.sendNotification(user, `Your subscription has been canceled. Access to features ${featureNames} has been revoked`);
		});
	}

	async cancelSubscription(userSubscriptionId: number, manager: EntityManager = this.connection.manager) {
		const endDate = DateTime.now().toJSDate();
		const userSubscription = await this.findActiveUserSubscription(userSubscriptionId);

		await manager.transaction(async (manager) => {;
			await manager.update(UserSubscription, userSubscription.id, { endDate });

			await this.deleteSubscriptionAcesses(userSubscription, manager);
		});
	}
}