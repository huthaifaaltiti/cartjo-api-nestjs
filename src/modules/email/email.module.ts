import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    BullModule.registerQueueAsync({
      name: Queues.EMAIL_QUEUE,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        limiter: {
          max: config.get<number>('EMAIL_RATE_LIMIT_MAX', 14),
          duration: config.get<number>('EMAIL_RATE_LIMIT_DURATION', 1000),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
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
