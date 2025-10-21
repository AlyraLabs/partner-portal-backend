import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(AppConfigService);
  
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
