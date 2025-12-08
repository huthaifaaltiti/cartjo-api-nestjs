import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteUserParamDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  id: string;
}
