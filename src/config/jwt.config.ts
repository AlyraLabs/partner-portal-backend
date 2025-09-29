import { JwtModuleOptions } from '@nestjs/jwt';
import { AppConfigService } from './config.service';

export const createJwtConfig = (
  configService: AppConfigService,
): JwtModuleOptions => ({
  secret: configService.jwt.secret,
  signOptions: {
    expiresIn: configService.jwt.expiresIn,
  },
});
