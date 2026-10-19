import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { raw } from 'express';

// Shared by main.ts and the e2e tests, so the tests exercise the real HTTP setup.
export function configureApp(app: NestExpressApplication): void {
  // Trust proxy so req.ip returns the real client IP behind reverse proxies
  app.set('trust proxy', true);

  // Parse application/octet-stream as raw Buffer (speed test upload)
  app.use(raw({ type: 'application/octet-stream', limit: '110mb' }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false,
    // Uploads are many octet-stream POSTs; cache the preflight instead of repeating it per chunk.
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
}
