export type MetaFieldPermanent<T> = T;
export type MetaFieldPermanentObjectArray<T> = T[];
export type MetaFieldValue<T> =
  | MetaFieldPermanent<T>
  | MetaFieldPermanentObjectArray<T>;

export type MetaFieldPeriodic<T> = {
  [year: string]: {
    [dateField: string]: MetaFieldValue<T>;
  };
};

export type MetaField<T> = MetaFieldValue<T> | MetaFieldPeriodic<T>;

export type MetaFields<T> = Record<string, MetaField<T>>;
