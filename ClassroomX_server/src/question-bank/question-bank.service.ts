import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionBankService {
  constructor(private prisma: PrismaService) {}

  async getBanks() {
    return this.prisma.questionBank.findMany({
      select: {
        id: true,
        tag: true,
        label: true,
        description: true,
        _count: { select: { questions: true } },
      },
      orderBy: { tag: 'asc' },
    });
  }

  async getBankQuestions(tag: string, difficulty?: string) {
    const bank = await this.prisma.questionBank.findUnique({ where: { tag } });
    if (!bank) throw new NotFoundException(`Bank "${tag}" not found`);

    return this.prisma.bankQuestion.findMany({
      where: {
        bankId: bank.id,
        ...(difficulty ? { difficulty: difficulty as any } : {}),
      },
      include: {
        testCases: true,
      },
      orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
    });
  }

  async getQuestion(id: number) {
    const q = await this.prisma.bankQuestion.findUnique({
      where: { id },
      include: { testCases: true, bank: { select: { tag: true, label: true } } },
    });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }
}
