import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Or specify the origin(s) you want to allow
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false, // check if header is allowed
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true});
  await app.listen(3003, '0.0.0.0');
}
bootstrap();
