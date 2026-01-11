<<<<<<< HEAD
import { Module } from '@nestjs/common';
=======
import { forwardRef, Module } from '@nestjs/common';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '../jwt/jwt.module';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from 'src/schemas/typeHintConfig.schema';
import { TypeHintConfigService } from './typeHintConfig.service';
import { TypeHintConfigController } from './typeHintConfig.controller';
<<<<<<< HEAD
=======
import { ProductModule } from '../product/product.module';
import { ShowcaseModule } from '../showcase/showcase.module';
import { TypeHintsSeeder } from 'src/database/seeders/type-hints.seeder';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
    ]),
    JwtModule,
<<<<<<< HEAD
  ],
  providers: [TypeHintConfigService],
=======
    forwardRef(() => ProductModule),
    forwardRef(() => ShowcaseModule),
  ],
  providers: [TypeHintConfigService, TypeHintsSeeder],
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  controllers: [TypeHintConfigController],
  exports: [TypeHintConfigService],
})
export class TypeHintConfigModule {}
