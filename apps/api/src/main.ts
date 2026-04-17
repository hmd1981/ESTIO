import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Default Express JSON limit is small; worker payloads may include large prompt + extra keys.
  app.useBodyParser('json', { limit: '5mb' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      // LAN dev (e.g. phone/laptop → http://192.168.x.x:3000 with API on same host)
      /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
      // Apex + subdomains (e.g. https://estio.org, https://www.estio.org, https://admin.estio.org).
      // A bare /\.estio\.org$/ does NOT match https://estio.org (no dot before "estio" in the host).
      /^https?:\/\/([a-z0-9-]+\.)*estio\.org(:\d+)?$/i,
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
