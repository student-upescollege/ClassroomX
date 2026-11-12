import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetDecodedToken } from 'src/auth/decorator';
import { AiAssistantService } from './ai-assistant.service';
import { AiChatDto } from './dto/chat.dto';

@UseGuards(JwtGuard)
@Controller('student/session')
export class AiAssistantController {
  constructor(private aiService: AiAssistantService) {}

  @Get(':sessionId/question/:questionId/ai-usage')
  getUsage(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.aiService.getUsage(Number(sessionId), Number(questionId), user.id);
  }

  @Post(':sessionId/question/:questionId/ai-chat')
  chat(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @Body() body: AiChatDto,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.aiService.chat(
      Number(sessionId),
      Number(questionId),
      user.id,
      body.message,
      body.history ?? [],
    );
  }
}
