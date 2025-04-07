import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function server() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
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

  await app.listen(process.env.PORT ?? 3000);
}

server();
