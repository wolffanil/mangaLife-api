import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  if (config.getOrThrow<string>('NODE_ENV') === 'development') {
    app.use(morgan('dev'));
  }

  app.use(helmet());
  app.use(cookieParser());

  // app.use(csurf());

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    allowedHeaders: [
      'set-cookie',
      'Content-Type',
      'Authorization',
      'recaptcha',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(config.getOrThrow<string>('PORT'));
}
bootstrap();
