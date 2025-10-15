import { User } from '../../entities/user.entity';

export type UserResponse = Pick<
  User,
  'id' | 'email' | 'isActive' | 'createdAt' | 'updatedAt'
>;
