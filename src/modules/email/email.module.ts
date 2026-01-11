import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { BullModule } from '@nestjs/bull';
import { EmailTemplateSeeder } from './seeders/email-template.seeder';
import { MongooseModule } from '@nestjs/mongoose';
<<<<<<< HEAD
import { EmailTemplate, EmailTemplateSchema } from 'src/schemas/email-template.schema';
import { EmailService } from './email.service';
import { Queues } from 'src/enums/queues.enum';
=======
import {
  EmailTemplate,
  EmailTemplateSchema,
} from 'src/schemas/email-template.schema';
import { EmailService } from './email.service';
import { Queues } from 'src/enums/queues.enum';
import { EmailLogService } from './EmailLogService.service';
import { EmailLog, EmailLogSchema } from 'src/schemas/email-log.schema';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: Queues.EMAIL_QUEUE,
    }),
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
<<<<<<< HEAD
=======
      { name: EmailLog.name, schema: EmailLogSchema },
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
<<<<<<< HEAD
  providers: [EmailService, EmailProcessor, EmailTemplateSeeder],
=======
  providers: [
    EmailService,
    EmailProcessor,
    EmailTemplateSeeder,
    EmailLogService,
  ],
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  exports: [EmailService],
})
export class EmailModule {}
