import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { BullModule } from '@nestjs/bull';
import { EmailTemplateSeeder } from './seeders/email-template.seeder';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailTemplate,
  EmailTemplateSchema,
} from 'src/schemas/email-template.schema';
import { EmailService } from './email.service';
import { Queues } from 'src/enums/queues.enum';
import { EmailLogService } from './EmailLogService.service';
import { EmailLog, EmailLogSchema } from 'src/schemas/email-log.schema';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: Queues.EMAIL_QUEUE,
    }),
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  providers: [
    EmailService,
    EmailProcessor,
    EmailTemplateSeeder,
    EmailLogService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
