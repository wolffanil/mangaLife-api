import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ValidationException } from './validation.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  if (config.getOrThrow<string>('NODE_ENV') === 'development') {
    app.use(morgan('dev'));
  }

  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.use(cookieParser());

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
      exceptionFactory: (errors) => {
        const formatErrors = (errors, parentPath = '') => {
          return errors.flatMap((error) => {
            if (error.children?.length) {
              return formatErrors(
                error.children,
                `${parentPath}${error.property}.`,
              );
            }

            return {
              field: `${parentPath}${error.property}`,
              message: Object.values(error.constraints).at(-1),
            };
          });
        };

        const formattedErrors = formatErrors(errors);
        return new ValidationException(formattedErrors);
      },
    }),
  );

  await app.listen(config.getOrThrow<string>('PORT'));
}
bootstrap();
