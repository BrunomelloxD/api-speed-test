import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { server } from '../common/config/env.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy so req.ip returns the real client IP behind reverse proxies
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // Parse application/octet-stream as raw Buffer (speed test upload)
  app.use(raw({ type: 'application/octet-stream', limit: '110mb' }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false,
  });

  app.enableShutdownHooks();

  if (server.config.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(server.config.name)
      .setDescription(`API documentation for the ${server.config.name} application`)
      .setVersion('1.0')
      .build();

    const documentFactory = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger-api', app, documentFactory);
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(server.config.port);
}
bootstrap();
