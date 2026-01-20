import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Logo, LogoSchema } from 'src/schemas/logo.schema';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logo.name, schema: LogoSchema }]),
    MediaModule,
    JwtModule,
  ],
  providers: [LogoService],
  controllers: [LogoController],
  exports: [LogoService],
})
export class LogoModule {}
