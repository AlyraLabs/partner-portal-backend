import { Injectable, Logger } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { AppConfigService } from '../config/config.service';
import { TemplateService } from './template.service';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private mg: any;

  constructor(
    private configService: AppConfigService,
    private templateService: TemplateService,
  ) {
    const mailgunConfig = this.configService.mailgun;

    if (!mailgunConfig.apiKey || !mailgunConfig.domain) {
      this.logger.warn(
        'Mailgun configuration is incomplete. Email service will not work properly.',
      );
      return;
    }

    const mailgun = new Mailgun(formData);
    this.mg = mailgun.client({
      username: 'api',
      key: mailgunConfig.apiKey,
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.mg) {
        this.logger.error('Mailgun is not properly configured');
        return false;
      }

      const mailgunConfig = this.configService.mailgun;

      const data = {
        from: `${mailgunConfig.fromName} <${mailgunConfig.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html),
      };

      const result = await this.mg.messages.create(mailgunConfig.domain, data);

      this.logger.log(
        `Email sent successfully to ${emailData.to}. Message ID: ${result.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.to}:`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = await this.templateService.renderTemplate('password-reset', {
      userName,
      resetUrl,
    });

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - Partner Portal',
      html,
    });
  }

  async sendPasswordResetConfirmationEmail(
    email: string,
    userName: string,
  ): Promise<boolean> {
    const html = await this.templateService.renderTemplate(
      'password-reset-confirmation',
      {
        userName,
      },
    );

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Successful - Partner Portal',
      html,
    });
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
