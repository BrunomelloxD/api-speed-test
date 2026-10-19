import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { server } from '../common/config/env.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  configureApp(app);

  app.enableShutdownHooks();

  if (server.config.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(server.config.name)
      .setDescription(
        `API documentation for the ${server.config.name} application`,
      )
      .setVersion('1.0')
      .build();

    const documentFactory = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger-api', app, documentFactory);
  }

  await app.listen(server.config.port);
}
void bootstrap();
