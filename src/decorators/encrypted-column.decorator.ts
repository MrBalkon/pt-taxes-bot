import { Column, ColumnOptions } from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';

export const EncryptedColumn = (options: ColumnOptions) => {
  return Column({
    ...options,
    transformer: new EncryptionTransformer({
      key: process.env.DB_ENCRYPT_KEY,
      algorithm: 'aes-256-cbc',
      ivLength: 16,
    }),
  });
};
