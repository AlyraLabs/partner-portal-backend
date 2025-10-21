import { Integration } from '../../entities';

export type IntegrationResponse = Pick<
  Integration,
  'id' | 'string' | 'apiKey' | 'fee' | 'rpm' | 'createdAt' | 'updatedAt'
>;

export type IntegrationPublicResponse = Omit<IntegrationResponse, 'apiKey'>;
