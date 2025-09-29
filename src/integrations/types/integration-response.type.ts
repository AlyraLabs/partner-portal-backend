import { Integration } from '../../entities';

export type IntegrationResponse = Pick<
  Integration,
  | 'id'
  | 'name'
  | 'url'
  | 'uniqueString'
  | 'apiKey'
  | 'fee'
  | 'rpm'
  | 'createdAt'
  | 'updatedAt'
>;

export type IntegrationPublicResponse = Omit<IntegrationResponse, 'apiKey'>;
