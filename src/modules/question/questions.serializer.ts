import { UserMetaFieldsRequest } from './question.types';

class FieldsSerializer {
  serializeUserFieldsRequest(fieldsRequest: UserMetaFieldsRequest): string {
    if (typeof fieldsRequest === 'string') {
      return fieldsRequest;
    }
    return fieldsRequest.systemName;
  }
}

export const fieldsSerializer = new FieldsSerializer();
