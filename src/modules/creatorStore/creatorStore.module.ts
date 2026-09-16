import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorStoreController } from './creatorStore.controller';
import { CreatorStoreSharedService } from './creatorStore.shared.service';
import { CreatorStoreCreatorService } from './creatorStore.creator.service';
import {
  CreatorStore,
  CreatorStoreSchema,
} from '../../schemas/creatorStore.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { MediaModule } from '../media/media.module';
import { HistoryModule } from '../history/history.module';
import { EmailModule } from '../email/email.module';
import { AppConfigModule } from '../appConfig/appConfig.module';
import { CreatorStoreAdminService } from './creatorStore.admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreatorStore.name, schema: CreatorStoreSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MediaModule,
    HistoryModule,
    EmailModule,
    AppConfigModule,
  ],
  controllers: [CreatorStoreController],
  providers: [
    CreatorStoreSharedService,
    CreatorStoreCreatorService,
    CreatorStoreAdminService,
  ],
  exports: [
    CreatorStoreSharedService,
    CreatorStoreCreatorService,
    CreatorStoreAdminService,
  ],
})
export class CreatorStoreModule {}
