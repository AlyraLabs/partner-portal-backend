import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(AppConfigService);
  
  // Run migrations on startup
  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS with configuration
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });

  await app.listen(configService.app.port);
  
  console.log(`🚀 Application is running on: http://localhost:${configService.app.port}`);
  console.log(`📊 Environment: ${configService.app.nodeEnv}`);
}
bootstrap();
