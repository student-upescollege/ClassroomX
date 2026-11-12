import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FacultyService } from './faculty/faculty.service';
import { FacultyModule } from './faculty/faculty.module';
import { StudentModule } from './student/student.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    FacultyModule,
    StudentModule,
    QuestionBankModule,
    AiAssistantModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
