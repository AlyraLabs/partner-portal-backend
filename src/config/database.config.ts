import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from './config.service';

export const createDatabaseConfig = (
  configService: AppConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.database.host,
  port: configService.database.port,
  username: configService.database.username,
  password: configService.database.password,
  database: configService.database.database,
  entities: ['dist/entities/*.js'],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: configService.database.logging,
  ssl: configService.isProduction ? { rejectUnauthorized: false } : false,
});
