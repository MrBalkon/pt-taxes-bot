import { Transform, Type } from 'class-transformer';
import {
	IsBoolean,
	IsDefined,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	IsUrl,
	ValidateIf,
} from 'class-validator';
import { IsSensitive } from './decorators/is-sensitive.decorator';

enum LogLevel {
	ERROR = 'error',
	WARNING = 'warn',
	LOG = 'log',
	DEBUG = 'debug',
}

export class EnvSchemaDto {
	@IsDefined()
	@IsNotEmpty()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	PORT: number;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	TELEGRAM_BOT_TOKEN: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	DB_HOST: string;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	DB_USERNAME: string;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	DB_PASSWORD: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	DB_DATABASE: string;

	@IsDefined()
	@IsNotEmpty()
	@Type(() => Number)
	@IsInt()
	DB_PORT: number;

	@IsDefined()
	@IsNotEmpty()
	@Type(() => Boolean)
	@IsBoolean()
	DB_LOGGING: boolean;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	DB_ENCRYPT_KEY: string;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	DB_ENCRYPT_IV: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	REDIS_HOST: string;

	@IsDefined()
	@IsNotEmpty()
	@Type(() => Number)
	@IsInt()
	REDIS_PORT: number;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	REDIS_USERNAME: string;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	REDIS_PASSWORD: string;

	@IsSensitive()
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	REDIS_KEY_PREFIX: string;

	@IsOptional()
	@IsNotEmpty()
	@Type(() => Number)
	@IsInt()
	QUEUE_CONCURRENCY: number;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	SELENIUM_HUB_URL: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	SELENIUM_DOWNLOAD_PATH: string;

	@IsSensitive()
	@ValidateIf((_, value) => {
		return !!value;
	})
	@IsUrl()
	SENTRY_DSN: string;

	@IsOptional()
	@Transform(({ value }) => value.split(','))
	@IsEnum(LogLevel, { each: true })
	LOG_LEVEL: LogLevel;
}