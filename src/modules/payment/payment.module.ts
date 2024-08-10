import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Payment])],
	controllers: [],
	providers: [PaymentService],
	exports: [PaymentService],
})
export class PaymentModule {};