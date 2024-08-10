import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { DeepPartial, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PaymentService {
	constructor(
		@InjectRepository(Payment)
		private readonly paymentRepository: Repository<Payment>,
	) {}

	async createPayemnt(payment: DeepPartial<Payment>): Promise<Payment> {
		return this.paymentRepository.save(payment)
	}

	async createPayments(payments: DeepPartial<Payment>[]): Promise<Payment[]> {
		return this.paymentRepository.save(payments)
	}

	async getPaymentsByTaskAndUserId(taskId: number, userId: number): Promise<Payment[]> {
		return this.paymentRepository.find({ where: { taskId, userId } })
	}

	async getPaymentsByUserId(userId: number): Promise<Payment[]> {
		return this.paymentRepository.find({ where: { userId } })
	}

	async paymentsSync(taskId: number, userId: number, payements: DeepPartial<Payment>[]) {
		// get all payments for this task and user
		const existingPayments = await this.getPaymentsByTaskAndUserId(taskId, userId)

		// find payments that are not in the new list
		const paymentsToDelete = existingPayments.filter((existingPayment) => {
			return !payements.find((newPayment) => newPayment.id === existingPayment.id)
		})

		// find payments that are not in the old list
		const paymentsToCreate = payements.filter((newPayment) => {
			return !existingPayments.find((existingPayment) => newPayment.id === existingPayment.id)
		})

		// delete old payments
		await this.paymentRepository.remove(paymentsToDelete)

		// create new payments
		await this.createPayments(paymentsToCreate)

		return {
			paymentsToDelete,
			paymentsToCreate,
		}
	}
}