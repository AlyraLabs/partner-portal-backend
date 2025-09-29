import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface TemplateData {
  [key: string]: any;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor() {
    // Register common Handlebars helpers
    this.registerHelpers();
  }

  async renderTemplate(
    templateName: string,
    data: TemplateData,
  ): Promise<string> {
    try {
      const template = await this.getTemplate(templateName);

      // Add common template data
      const templateData = {
        ...data,
        currentYear: new Date().getFullYear(),
        timestamp: new Date().toLocaleString(),
      };

      return template(templateData);
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  private async getTemplate(
    templateName: string,
  ): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Load and compile template
    const templatePath = path.join(
      process.cwd(),
      'src',
      'email',
      'templates',
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateSource);

    // Cache the compiled template
    this.templateCache.set(templateName, compiledTemplate);

    return compiledTemplate;
  }

  private registerHelpers(): void {
    // Helper for formatting dates
    Handlebars.registerHelper('formatDate', (date: Date, format?: string) => {
      if (!date) return '';

      if (format === 'short') {
        return date.toLocaleDateString();
      }

      return date.toLocaleString();
    });

    // Helper for conditional rendering
    Handlebars.registerHelper(
      'ifEquals',
      function (arg1: any, arg2: any, options: any) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
    );

    // Helper for uppercase text
    Handlebars.registerHelper('uppercase', (text: string) => {
      return text ? text.toUpperCase() : '';
    });

    // Helper for truncating text
    Handlebars.registerHelper('truncate', (text: string, length: number) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    });
  }

  // Method to clear cache (useful for development)
  clearCache(): void {
    this.templateCache.clear();
    this.logger.log('Template cache cleared');
  }
}
