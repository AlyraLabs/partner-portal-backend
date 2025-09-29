import { AppConfigService } from './config.service';

export const createAppConfig = (configService: AppConfigService) => ({
  port: configService.app.port,
  nodeEnv: configService.app.nodeEnv,
  cors: configService.app.cors,
});
