import {
	Injectable,
	Logger,
	LoggerService,
	ValidationError,
  } from '@nestjs/common';
  import { plainToClass } from 'class-transformer';
  import { validateSync } from 'class-validator';
  import * as dotenv from 'dotenv';
  import { EnvSchemaDto } from '../config/env.schema.dto';
  import { IS_SENSITIVE_KEYS_LIST } from './decorators/is-sensitive.decorator';
  
  dotenv.config();
  
  export const filterSensitiveEnvs = <T>(instance: T): Record<string, any> => {
	const sensitiveParams = Reflect.getMetadata(IS_SENSITIVE_KEYS_LIST, instance);
	return Object.entries(instance).reduce((acc, [key, value]) => {
	  if (sensitiveParams.includes(key)) {
		return acc;
	  }
	  return {
		...acc,
		[key]: value,
	  };
	}, {});
  };
  
  export const validateEnvsAndPrint = <T>(
	schemaDTO: { new (): T },
	logger: LoggerService,
	shouldSkipValidation = false,
  ): T => {
	const dto = plainToClass(schemaDTO, process.env);
  
	// Skip params validation on unit test
	if (shouldSkipValidation) {
	  logger.log(
		'Skipping environment variables validation because of unit test environment.',
	  );
	  return dto;
	}
  
	const errors: ValidationError[] = validateSync(dto as unknown as object, {
	  whitelist: true,
	  forbidNonWhitelisted: false,
	});
  
	if (errors.length) {
	  const errorMessages = errors.reduce((acc, error) => {
		return [...acc, Object.values(error.constraints)[0]];
	  }, []);
  
	  throw new Error(
		`Error validating environment variables: ${JSON.stringify(
		  errorMessages,
		  null,
		  2,
		)}`,
	  );
	}
  
	const insensitiveEnvs = filterSensitiveEnvs(dto);
  
	logger.log(
	  `Environment variables: ${JSON.stringify(insensitiveEnvs, null, 2)} `,
	);
  
	return dto;
  };
  
  @Injectable()
  export class ConfigService {
	private config: EnvSchemaDto;
	private logger = new Logger(ConfigService.name);
  
	constructor() {
	  this.config = this.validateEnvs();
	}
  
	public get(key: string): any {
	  return this.config?.[key];
	}
  
	private validateEnvs = (): EnvSchemaDto => {
	  const shouldSkipValidation = process.env.TS_JEST ? true : false;
	  return validateEnvsAndPrint(
		EnvSchemaDto,
		this.logger,
		shouldSkipValidation,
	  );
	};
  }