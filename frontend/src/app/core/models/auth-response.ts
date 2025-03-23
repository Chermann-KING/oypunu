import { User } from './user';
import { AuthTokens } from './auth-tokens';

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
