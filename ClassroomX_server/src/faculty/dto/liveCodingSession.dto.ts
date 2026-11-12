import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class TestCaseDto {
  @IsString()
  input: string;

  @IsString()
  @IsNotEmpty()
  expectedOutput: string;

  @IsBoolean()
  isHidden: boolean;
}

export class CodingQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  score: number;

  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsString()
  @IsOptional()
  functionName?: string;

  @IsOptional()
  parameters?: any;

  @IsString()
  @IsOptional()
  returnType?: string;

  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  aiMaxUses?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];
}

export class CreateLiveCodingSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @IsInt()
  classroomId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodingQuestionDto)
  questions: CodingQuestionDto[];

  @IsNumber()
  @IsOptional()
  totalScore?: number;

  @IsBoolean()
  @IsOptional()
  showResultsImmediately?: boolean;
}
