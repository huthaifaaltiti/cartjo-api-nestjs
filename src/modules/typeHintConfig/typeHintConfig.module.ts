import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '../jwt/jwt.module';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from 'src/schemas/typeHintConfig.schema';
import { TypeHintConfigService } from './typeHintConfig.service';
import { TypeHintConfigController } from './typeHintConfig.controller';
import { ProductModule } from '../product/product.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
    ]),
    JwtModule,
    forwardRef(() => ProductModule)
  ],
  providers: [TypeHintConfigService],
  controllers: [TypeHintConfigController],
  exports: [TypeHintConfigService],
})
export class TypeHintConfigModule {}
