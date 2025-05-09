export interface CreateOrUdpdateFieldAnswer {
  fieldSystemName: string;
  fieldValue: any;
  month?: number;
  year?: number;
}

export interface UserMetaFieldsRequestExtended {
  systemName: string;
  required: boolean;
}

type UserMetaFieldsRequestValue = UserMetaFieldsRequestExtended | string;

export type UserMetaFieldsRequest = UserMetaFieldsRequestValue;

export interface UserMetaFieldsIdsRequestExtended {
  id: number;
  required: boolean;
}

export type UserMetaFieldsIdsRequest =
  | UserMetaFieldsIdsRequestExtended
  | number;
