import { IsInt, IsString, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';

export class SubmitSolutionDto {
  @IsInt()
  questionId: number;

  @IsString()
  code: string;

  @IsString()
  language: string;

  @IsInt()
  @Min(0)
  score: number;

  @IsBoolean()
  isSuccessful: boolean;

  @IsOptional()
  @IsString()
  output?: string | null;

  @IsOptional()
  @IsString()
  error?: string | null;

  @IsOptional()
  @IsArray()
  testResults?: Array<{
    testCaseId: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    isHidden: boolean;
    error?: string;
  }> | null;
}
