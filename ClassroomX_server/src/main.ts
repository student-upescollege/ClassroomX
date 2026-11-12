import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for both local development and live production domains
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedLocal = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
      const clientUrl = process.env.CLIENT_URL;

      if (
        allowedLocal.includes(origin) ||
        (clientUrl && origin === clientUrl) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3001); // Change to port 3001 to match frontend expectation
}
bootstrap();
