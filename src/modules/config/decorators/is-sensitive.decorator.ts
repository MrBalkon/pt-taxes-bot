export const IS_SENSITIVE_KEYS_LIST = 'is-sensitive-keys-metadata';

/**
 * This decorator indicates if field is sensitive (sensitive fields cannot be logged)
 */
export const IsSensitive = (): PropertyDecorator => {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(
      IS_SENSITIVE_KEYS_LIST,
      [
        ...(Reflect.getMetadata(IS_SENSITIVE_KEYS_LIST, target) ?? []),
        propertyKey,
      ],
      target,
    );
  };
};