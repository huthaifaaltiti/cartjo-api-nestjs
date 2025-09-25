import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: errors => {
        const messages = errors.map(error => {
          return {
            property: error.property,
            message: Object.values(error.constraints).join(', '),
          };
        });
        return new BadRequestException({
          isSuccess: false,
          statusCode: 400,
          message: 'Validation Failed',
          details: messages,
        });
      },
    }),
  );

  // NestJS-style global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 8000);
}

server();
