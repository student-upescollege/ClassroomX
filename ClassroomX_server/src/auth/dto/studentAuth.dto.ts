import { Semester } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

// enum Semester {
//   ONE,
//   TWO,
//   THREE,
//   FOUR,
//   FIVE,
//   SIX,
//   SEVEN,
//   EIGHT,
// }

export class StSUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  sap: number;

  @IsString()
  @IsNotEmpty()
  roll: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNumber()
  @IsNotEmpty()
  batchId: number;

  @IsEnum(Semester)
  @IsNotEmpty()
  semester: Semester;
}

export class StSInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
