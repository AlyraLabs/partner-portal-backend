import { UserResponse } from '../types/user-response.type';

export interface AuthRequest extends Request {
  user: UserResponse;
}
