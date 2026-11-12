import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { QuestionBankService } from './question-bank.service';

@UseGuards(JwtGuard)
@Controller('question-bank')
export class QuestionBankController {
  constructor(private service: QuestionBankService) {}

  @Get('banks')
  getBanks() {
    return this.service.getBanks();
  }

  @Get('banks/:tag/questions')
  getBankQuestions(
    @Param('tag') tag: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.service.getBankQuestions(tag, difficulty);
  }

  @Get('questions/:id')
  getQuestion(@Param('id') id: string) {
    return this.service.getQuestion(Number(id));
  }
}
