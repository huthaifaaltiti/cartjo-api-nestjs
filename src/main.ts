import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
<<<<<<< HEAD
import { BadRequestException, ValidationPipe } from '@nestjs/common';
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { AppModule } from './app.module';
import { EmailTemplateSeeder } from './modules/email/seeders/email-template.seeder';
import { LoggingPipe } from './pipes/logging.pipe';
import { CustomValidationPipe } from './pipes/customValidation.pipe';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
<<<<<<< HEAD
// import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function server() {
=======
import { AppEnvironments } from './enums/appEnvs.enum';
import { join } from 'path';
import { TypeHintsSeeder } from './database/seeders/type-hints.seeder';
import { ShowcaseSeeder } from './database/seeders/showcases.seeder';
import { runSeeders } from './database/seeders/run-seeders.seeder';

async function server() {
  const isDev = process.env.NODE_ENV !== AppEnvironments.PRODUCTION;

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

<<<<<<< HEAD
  // General logging pipe for incoming requests
  app.useGlobalPipes(new LoggingPipe());

  app.useGlobalPipes(new CustomValidationPipe());

  // NestJS-style global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Seed email templates
  const seeder = app.get(EmailTemplateSeeder);
  await seeder.seed();
=======
  // serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
  });

  app.useGlobalPipes(new CustomValidationPipe());

  if (isDev) {
    // General logging pipe for incoming requests
    app.useGlobalPipes(new LoggingPipe());
    // NestJS-style global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());
  }

  // Run seeders
  if (process.env.RUN_SEEDS === 'true') {
    const seeders = [EmailTemplateSeeder, TypeHintsSeeder, ShowcaseSeeder];
    await runSeeders(app, seeders);
  }
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

  await app.listen(process.env.PORT ?? 8000);
}

server();
