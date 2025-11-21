import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { EmailTemplateSeeder } from './modules/email/seeders/email-template.seeder';
import { LoggingPipe } from './pipes/logging.pipe';
import { CustomValidationPipe } from './pipes/customValidation.pipe';
// import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function server() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = process.env.CORS_ORIGINS_DOMAINS?.split(',') ?? [];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  app.useGlobalPipes(new LoggingPipe());
  app.useGlobalPipes(new CustomValidationPipe());

  // NestJS-style global exception filter
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Seed email templates
  const seeder = app.get(EmailTemplateSeeder);
  await seeder.seed();

  await app.listen(process.env.PORT ?? 8000);
}

server();
