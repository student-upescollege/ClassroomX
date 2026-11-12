import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ParameterDto {
  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class ExecuteDto {
  @IsString()
  language: string;

  @IsString()
  code: string;

  @IsString()
  stdin: string;

  @IsOptional()
  @IsString()
  functionName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  parameters?: ParameterDto[];

  @IsOptional()
  @IsString()
  returnType?: string;
}
