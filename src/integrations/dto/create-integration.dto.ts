import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  string: string;

  // TDDO: add wallets integration
}
