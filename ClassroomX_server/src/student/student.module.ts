import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { ExecuteService } from './execute.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService, ExecuteService],
})
export class StudentModule {}
