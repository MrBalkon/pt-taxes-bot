import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { FeatureAccess } from 'src/entities/feature-access.entity';
import { Feature } from 'src/entities/feature.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { NotificaitonService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { NotificationAction } from '../notification/notification.types';

@Injectable()
export class FeatureService {
	constructor(
		@InjectRepository(Feature)
		private readonly featureRepository: Repository<Feature>,
		@InjectRepository(FeatureAccess)
		private readonly featureAccessRepository: Repository<FeatureAccess>,
		private notificaitonService: NotificaitonService,
		private userService: UserService,
		@InjectDataSource() private connection: DataSource
	) {}

	async getFeatures() {
		return this.featureRepository.find();
	}

	async getFeaturesByUserId(userId: number) {
		return this.featureRepository.createQueryBuilder('feature')
			.leftJoin('feature.featureAccesses', 'featureAccesses')
			.where('featureAccesses.userId = :userId', { userId })
			.getMany();
	}

	async getFeaturesByUserTelegramId(telegramId: string) {
		return this.featureRepository.createQueryBuilder('feature')
			.leftJoin('feature.featureAccesses', 'featureAccesses')
			.leftJoin('featureAccesses.user', 'user')
			.where('user.telegramId = :telegramId', { telegramId })
			.getMany();
	}

	async deleteAccessToAllFeatures(userId: number) {
		await this.featureAccessRepository.delete({ userId });
	}

	async deleteAccessToAllFeaturesByTelegramId(telegramId: string) {
		const user = await this.userService.getUserByTelegramId(telegramId);
		if (!user) {
			throw new BadRequestException();
		}
		await this.featureAccessRepository.delete({ userId: user.id });
	}

	async grantAcessToFeature(userId: number, featureId: number) {
		const existingAccess = await this.featureAccessRepository.findOneBy({ userId, featureId });
		if (existingAccess) {
			throw new BadRequestException();
		}
		const feature = await this.featureRepository.findOneBy({ id: featureId });
		await this.featureAccessRepository.save({ userId, featureId });
		const user = await this.userService.getUserById(userId);
		await this.notificaitonService.sendNotification(user, `You have been granted access to feature ${feature.name}. Please, fill needed information`, {
			action: NotificationAction.REQUEST_CREDENTIALS
		});
	}

	async grantAccessToFeatures(userId: number, featureIds: number[], manager: EntityManager = this.connection.manager) {
		await manager.save(FeatureAccess, featureIds.map((featureId) => ({ userId, featureId })));
	}

	async deleteAccessToFeatures(userId: number, featureIds: number[], manager: EntityManager = this.connection.manager) {
		await manager.delete(FeatureAccess, { userId, featureId: In(featureIds) });
	}
}