export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    username?: string;
    role: string;
    firstName?: string;
    lastName?: string;
    profilePic?: any;
  };
}