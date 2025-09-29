# Configuration Module

This module provides a comprehensive configuration system for the Partner Portal Backend application with type safety, validation, and environment-specific settings.

## Features

- 🔧 **Type-safe configuration** with TypeScript interfaces
- ✅ **Environment validation** with custom validation logic
- 🌍 **Environment-specific settings** (development, production, test)
- 🔒 **Secure defaults** with fallback values
- 📝 **Centralized configuration** management

## Structure

```
src/config/
├── config.module.ts          # Main configuration module
├── config.service.ts         # Typed configuration service
├── config.interface.ts       # TypeScript interfaces
├── config.validation.ts      # Environment validation
├── database.config.ts        # Database configuration
├── jwt.config.ts            # JWT configuration
├── app.config.ts            # Application configuration
├── index.ts                 # Barrel exports
└── README.md               # This documentation
```

## Configuration Interfaces

### DatabaseConfig
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}
```

### JwtConfig
```typescript
interface JwtConfig {
  secret: string;
  expiresIn: string;
}
```

### AppConfig
```typescript
interface AppConfig {
  port: number;
  nodeEnv: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}
```

## Environment Variables

### Required Variables
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time

### Optional Variables
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development, production, test)
- `CORS_ORIGIN` - CORS origin (default: *)
- `CORS_CREDENTIALS` - CORS credentials (default: false)

## Usage

### In Services
```typescript
import { AppConfigService } from '../config/config.service';

@Injectable()
export class MyService {
  constructor(private configService: AppConfigService) {}

  someMethod() {
    const dbHost = this.configService.database.host;
    const jwtSecret = this.configService.jwt.secret;
    const isDev = this.configService.isDevelopment;
  }
}
```

### In Modules
```typescript
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  // ...
})
export class MyModule {}
```

## Configuration Factory Functions

### Database Configuration
```typescript
import { createDatabaseConfig } from './config/database.config';

TypeOrmModule.forRootAsync({
  useFactory: (configService: AppConfigService) => 
    createDatabaseConfig(configService),
  inject: [AppConfigService],
})
```

### JWT Configuration
```typescript
import { createJwtConfig } from './config/jwt.config';

JwtModule.registerAsync({
  useFactory: (configService: AppConfigService) => 
    createJwtConfig(configService),
  inject: [AppConfigService],
})
```

## Environment-Specific Behavior

### Development
- Database synchronization enabled
- SQL logging enabled
- CORS allows all origins
- Detailed error messages

### Production
- Database synchronization disabled
- SQL logging disabled
- SSL enabled for database
- Optimized CORS settings

### Test
- Separate test database configuration
- Minimal logging
- Fast startup configuration

## Validation

The configuration system validates:
- Required environment variables are present
- Port numbers are within valid range (1-65535)
- NODE_ENV is one of: development, production, test
- Database connection parameters are valid

## Security Features

- Sensitive data (passwords, secrets) are never logged
- Environment variables are validated before use
- Production-specific security settings
- Secure defaults for all configuration options

## Best Practices

1. **Never hardcode sensitive values** - Always use environment variables
2. **Use the AppConfigService** - Provides type safety and validation
3. **Set appropriate defaults** - Ensure the app works without all env vars
4. **Validate in production** - Use the validation system
5. **Use environment-specific configs** - Different settings per environment

## Example .env File

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=partner_portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*
CORS_CREDENTIALS=false
```
