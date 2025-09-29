import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseConfig,
  JwtConfig,
  AppConfig,
  MailgunConfig,
} from './config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get database(): DatabaseConfig {
    return {
      host: this.configService.get<string>('DB_HOST') || 'localhost',
      port: this.configService.get<number>('DB_PORT') || 5432,
      username: this.configService.get<string>('DB_USERNAME') || 'postgres',
      password: this.configService.get<string>('DB_PASSWORD') || 'password',
      database: this.configService.get<string>('DB_NAME') || 'partner_portal',
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
    };
  }

  get jwt(): JwtConfig {
    return {
      secret:
        this.configService.get<string>('JWT_SECRET') ||
        'your-super-secret-jwt-key-here',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    };
  }

  get app(): AppConfig {
    return {
      port: this.configService.get<number>('PORT') || 3000,
      nodeEnv: this.configService.get<string>('NODE_ENV') || 'development',
      cors: {
        origin: this.configService.get<string>('CORS_ORIGIN') || '*',
        credentials:
          this.configService.get<boolean>('CORS_CREDENTIALS') || false,
      },
    };
  }

  get isDevelopment(): boolean {
    return this.app.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.app.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.app.nodeEnv === 'test';
  }

  get mailgun(): MailgunConfig {
    return {
      apiKey: this.configService.get<string>('MAILGUN_API_KEY') || '',
      domain: this.configService.get<string>('MAILGUN_DOMAIN') || '',
      fromEmail:
        this.configService.get<string>('MAILGUN_FROM_EMAIL') ||
        'noreply@example.com',
      fromName:
        this.configService.get<string>('MAILGUN_FROM_NAME') || 'Partner Portal',
    };
  }
}
