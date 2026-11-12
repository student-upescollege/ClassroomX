import { IsString, IsNotEmpty, IsArray, IsIn, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatTurnDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AiChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  @IsOptional()
  history?: ChatTurnDto[];
}
