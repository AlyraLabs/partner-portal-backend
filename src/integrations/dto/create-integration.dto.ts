import {
  IsString,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  url?: string;

  @IsBoolean()
  useNameAsUniqueString: boolean;

  @ValidateIf((o: CreateIntegrationDto) => !o.useNameAsUniqueString)
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  customUniqueString?: string;
}
