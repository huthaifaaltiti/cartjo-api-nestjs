import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MediaModule } from '../media/media.module';
import { EmailModule } from '../email/email.module';
import { AuthJwtModule } from '../auth-jwt/auth-jwt.module';
import { User, UserSchema } from '../../schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MediaModule,
    AuthJwtModule,
    EmailModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
