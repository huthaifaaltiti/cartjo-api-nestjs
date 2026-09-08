import { User } from '../schemas/user.schema';

export type SessionUser = Omit<User, 'password' | 'passwordMetadata'> & {
  _id: unknown;
};

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}
