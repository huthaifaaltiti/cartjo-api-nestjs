import { Gender } from '../enums/gender.enum';
import { MediaPreview } from '../schemas/common.schema';

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
    profilePic?: MediaPreview;
    nationality?: string;
    gender?: Gender;
  };
}
