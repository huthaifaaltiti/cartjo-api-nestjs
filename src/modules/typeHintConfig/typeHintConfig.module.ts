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
import { ShowcaseModule } from '../showcase/showcase.module';
import { TypeHintsSeeder } from 'src/database/seeders/type-hints.seeder';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
    ]),
    JwtModule,
    forwardRef(() => ProductModule),
    forwardRef(() => ShowcaseModule),
  ],
  providers: [TypeHintConfigService, TypeHintsSeeder],
  controllers: [TypeHintConfigController],
  exports: [TypeHintConfigService],
})
export class TypeHintConfigModule {}
