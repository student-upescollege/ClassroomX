import { Semester } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

class BatchDto {
  @IsInt()
  batchId: number;

  @IsEnum(Semester)
  semester: Semester;
}

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  course: string;

  @IsEnum(Semester)
  semester: Semester;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchDto)
  batches: BatchDto[];
}
