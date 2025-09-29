import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';
import { AppConfigService } from '../config/config.service';

@Module({
  providers: [EmailService, TemplateService, AppConfigService],
  exports: [EmailService, TemplateService],
})
export class EmailModule {}
