import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './shared/http-exception.filter';
import { ValidationError } from 'class-validator';
import { ActivityChunk } from './activitychunk/entities/activitychunk.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Desktop Tracker API')
    .setDescription('The Desktop Tracker API description')
    .setVersion('1.0')
    .addTag('desktop-tracker')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [ActivityChunk],
    });
  SwaggerModule.setup('docs', app, documentFactory());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const appNameError = errors.find(
          (error) => error.property === 'appName',
        );

        if (appNameError?.constraints?.isNotEmpty) {
          return new UnprocessableEntityException(
            'appName is missing or empty. Please provide a valid value',
          );
        }

        const messages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        );

        return new BadRequestException(messages);
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() =>
    console.log(
      'Server is running under: ' + (process.env.PORT ?? 3000) + ' port',
    ),
  )
  .catch((e) => console.error(e));
