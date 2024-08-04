import { Module } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from 'src/entities/feature.entity';
import { FeatureAccess } from 'src/entities/feature-access.entity';
import { Not } from 'typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { FeatureController } from './feature.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Feature, FeatureAccess]), NotificationModule, UserModule],
	controllers: [FeatureController],
	providers: [FeatureService],
	exports: [FeatureService]
})
export class FeatureModule {};