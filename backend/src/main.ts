import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SecurityMiddleware } from './security/security.middleware';
import { RateLimitMiddleware } from './security/rate-limit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Security middleware
  app.use(new SecurityMiddleware().use);
  app.use(new RateLimitMiddleware().use);
  
  // Configure CORS for production
  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'];
  
  app.enableCors({ 
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  });
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`🔒 Security middleware enabled`);
}
bootstrap();
