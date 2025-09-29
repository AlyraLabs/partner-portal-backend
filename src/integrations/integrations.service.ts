import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../entities';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import {
  IntegrationResponse,
  IntegrationPublicResponse,
} from './types/integration-response.type';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private readonly MAX_INTEGRATIONS_PER_USER = 5;

  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  async create(
    userId: string,
    createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationResponse> {
    // Check if user has reached the maximum number of integrations
    const existingIntegrationsCount = await this.integrationRepository.count({
      where: { userId },
    });

    if (existingIntegrationsCount >= this.MAX_INTEGRATIONS_PER_USER) {
      throw new BadRequestException(
        `Maximum number of integrations (${this.MAX_INTEGRATIONS_PER_USER}) reached`,
      );
    }

    // Check if integration name is already used by this user
    const existingIntegration = await this.integrationRepository.findOne({
      where: { userId, name: createIntegrationDto.name },
    });

    if (existingIntegration) {
      throw new BadRequestException(
        'Integration with this name already exists',
      );
    }

    // Determine unique string
    let uniqueString: string;
    if (createIntegrationDto.useNameAsUniqueString) {
      // Use name as unique string (normalize it)
      uniqueString = this.normalizeUniqueString(createIntegrationDto.name);
    } else {
      // Use provided custom string
      uniqueString = this.normalizeUniqueString(
        createIntegrationDto.customUniqueString!,
      );
    }

    // Check if unique string is already taken globally
    const existingUniqueString = await this.integrationRepository.findOne({
      where: { uniqueString },
    });

    if (existingUniqueString) {
      throw new BadRequestException(
        'This unique string is already taken. Please choose another one.',
      );
    }

    // Create new integration
    const integration = this.integrationRepository.create({
      name: createIntegrationDto.name,
      url: createIntegrationDto.url,
      uniqueString,
      fee: 25.0,
      rpm: 200,
      userId,
    });

    const savedIntegration = await this.integrationRepository.save(integration);

    this.logger.log(
      `Integration created: ${savedIntegration.id} for user ${userId}`,
    );

    return this.toIntegrationResponse(savedIntegration);
  }

  async findAll(userId: string): Promise<IntegrationPublicResponse[]> {
    const integrations = await this.integrationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return integrations.map((integration) =>
      this.toIntegrationPublicResponse(integration),
    );
  }

  async findOne(
    userId: string,
    integrationId: string,
  ): Promise<IntegrationResponse> {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return this.toIntegrationResponse(integration);
  }

  async findByUniqueString(uniqueString: string): Promise<Integration | null> {
    return this.integrationRepository.findOne({
      where: { uniqueString },
      relations: ['user'],
    });
  }

  async findByApiKey(apiKey: string): Promise<Integration | null> {
    return this.integrationRepository.findOne({
      where: { apiKey },
      relations: ['user'],
    });
  }

  async update(
    userId: string,
    integrationId: string,
    updateIntegrationDto: UpdateIntegrationDto,
  ): Promise<IntegrationResponse> {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Check if name is being changed and already exists
    if (
      updateIntegrationDto.name &&
      updateIntegrationDto.name !== integration.name
    ) {
      const existingIntegration = await this.integrationRepository.findOne({
        where: { userId, name: updateIntegrationDto.name },
      });

      if (existingIntegration) {
        throw new BadRequestException(
          'Integration with this name already exists',
        );
      }
    }

    // Update integration
    Object.assign(integration, updateIntegrationDto);
    const updatedIntegration =
      await this.integrationRepository.save(integration);

    this.logger.log(`Integration updated: ${integrationId} for user ${userId}`);

    return this.toIntegrationResponse(updatedIntegration);
  }

  async regenerateApiKey(
    userId: string,
    integrationId: string,
  ): Promise<IntegrationResponse> {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Generate new API key
    integration.apiKey = integration['generateApiKey']();
    const updatedIntegration =
      await this.integrationRepository.save(integration);

    this.logger.log(
      `API key regenerated for integration: ${integrationId} for user ${userId}`,
    );

    return this.toIntegrationResponse(updatedIntegration);
  }

  async remove(userId: string, integrationId: string): Promise<void> {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    await this.integrationRepository.remove(integration);

    this.logger.log(`Integration deleted: ${integrationId} for user ${userId}`);
  }

  async validateApiKey(apiKey: string): Promise<Integration> {
    const integration = await this.findByApiKey(apiKey);

    if (!integration) {
      throw new ForbiddenException('Invalid API key');
    }

    return integration;
  }

  private toIntegrationResponse(integration: Integration): IntegrationResponse {
    return {
      id: integration.id,
      name: integration.name,
      url: integration.url,
      uniqueString: integration.uniqueString,
      apiKey: integration.apiKey,
      fee: integration.fee,
      rpm: integration.rpm,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }

  private normalizeUniqueString(input: string): string {
    // Convert to lowercase, replace spaces and special chars with underscores
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private toIntegrationPublicResponse(
    integration: Integration,
  ): IntegrationPublicResponse {
    const { apiKey: _apiKey, ...publicData } = this.toIntegrationResponse(integration);
    return publicData;
  }
}
