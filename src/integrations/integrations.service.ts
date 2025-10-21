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

    // Check if string is already used by this user
    const existingIntegration = await this.integrationRepository.findOne({
      where: { userId, string: createIntegrationDto.string },
    });

    if (existingIntegration) {
      throw new BadRequestException(
        'Integration with this string already exists for this user',
      );
    }

    // Check if string is already taken globally (since it's unique)
    const existingGlobalString = await this.integrationRepository.findOne({
      where: { string: createIntegrationDto.string },
    });

    if (existingGlobalString) {
      throw new BadRequestException(
        'This string is already taken. Please choose another one.',
      );
    }

    // Create new integration
    const integration = this.integrationRepository.create({
      string: createIntegrationDto.string,
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

  async findByString(string: string): Promise<Integration | null> {
    return this.integrationRepository.findOne({
      where: { string },
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

    // Note: UpdateIntegrationDto currently has name and url fields
    // You may want to update it to only have fields that exist in your entity
    // For now, we'll just ignore fields that don't exist

    // Update integration (only with fields that exist in the entity)
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
      string: integration.string,
      apiKey: integration.apiKey,
      fee: integration.fee,
      rpm: integration.rpm,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }

  private toIntegrationPublicResponse(
    integration: Integration,
  ): IntegrationPublicResponse {
    const { apiKey: _apiKey, ...publicData } =
      this.toIntegrationResponse(integration);
    return publicData;
  }
}
