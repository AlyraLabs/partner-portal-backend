import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from './config.service';
import { User } from '../entities/user.entity';
import { Integration } from '../entities/integration.entity';

export const createDatabaseConfig = (
  configService: AppConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.database.host,
  port: configService.database.port,
  username: configService.database.username,
  password: configService.database.password,
  database: configService.database.database,
  entities: [User, Integration],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: configService.database.logging,
  ssl: configService.isProduction ? { rejectUnauthorized: false } : false,
});
