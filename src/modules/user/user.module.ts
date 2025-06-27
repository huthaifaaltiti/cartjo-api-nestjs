import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { User, UserSchema } from 'src/schemas/user.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '../jwt/jwt.module';
import { MediaModule } from '../media/media.module';
import { Modules } from 'src/enums/appModules.enum';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MulterModule.register(createMulterOptions(Modules.USER)),
    MediaModule,
    JwtModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
