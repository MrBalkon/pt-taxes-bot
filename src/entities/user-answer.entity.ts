import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { User } from './user.entity';
import { UserField } from './user-field.entity';
import { EncryptedColumn } from 'src/decorators/encrypted-column.decorator';
import { EncryptionTransformer } from 'typeorm-encrypted';

export type FieldValueType = any

@Entity('user-answers')
export class UserAnswer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'field_id' })
	fieldId: number;

	@Column('varchar', { name: 'user_id' })
	userId: number;

	@Column('jsonb', {
		name: 'field_value',
		nullable: true,
		transformer: [
			{
				to(value: object): string {
				  return JSON.stringify(value);
				},
				from(value: string): string {
				  try {
					return JSON.parse(value);
				  } catch {
					return value;
				  }
				},
			},
			new EncryptionTransformer({
				key: process.env.DB_ENCRYPT_KEY,
				algorithm: 'aes-256-cbc',
				ivLength: 16,
				iv: process.env.DB_ENCRYPT_IV,
		  })
		]
	})
	fieldValue: any;

	@Column('int', { name: 'year', nullable: true })
	year: number;

	// not only month, but also quarter
	// TODO rename to date_parameter
	@Column('int', { name: 'month', nullable: true })
	month: number;

	@ManyToOne(() => UserField, userField => userField.answers)
	@JoinColumn({ name: "field_id" })
	field: UserField;

	@ManyToOne(() => User, user => user.answers)
	@JoinColumn({ name: "user_id" })
	user: User;

	@Column('varchar', { name: 'error', nullable: true })
	error?: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}