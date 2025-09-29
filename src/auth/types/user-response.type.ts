import { User } from '../../entities/user.entity';

export type UserResponse = Pick<
  User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;
