import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Faculty } from '@prisma/client';
import { GetDecodedToken } from 'src/auth/decorator';
import { FcSInDto } from 'src/auth/dto';
import { JwtGuard } from 'src/auth/guard';
import { FacultyService } from './faculty.service';
import { CreateClassroomDto, CreateLiveCodingSessionDto } from './dto';

@UseGuards(JwtGuard)
@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Get('me')
  getme(@GetDecodedToken() user: { id: number; email: string }) {
    return this.facultyService.getFC(user);
  }

  @Post('create')
  createClassroom(
    @Body() body: CreateClassroomDto,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.facultyService.createClassroom(body, user);
  }

  @Get('classrooms')
  getClassrooms(@GetDecodedToken() user: { id: number; email: string }) {
    return this.facultyService.getClassrooms(user);
  }

  @Get('classroom/:id')
  getClassroom(@Param() params: any) {
    return this.facultyService.getClassroom(params);
  }

  @Post('create-session')
  createLiveCodingSession(
    @Body() body: CreateLiveCodingSessionDto,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.facultyService.createLiveCodingSession(body, user);
  }

  @Get('session/:id/submissions')
  getSessionSubmissions(@Param('id') id: string) {
    return this.facultyService.getSessionSubmissions(id);
  }

  @Get('session/:id/proctor-logs')
  getSessionProctorLogs(@Param('id') id: string) {
    return this.facultyService.getSessionProctorLogs(id);
  }

  @Patch('session/:id/toggle-results')
  toggleShowResults(
    @Param('id') id: string,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.facultyService.toggleShowResults(id, user);
  }

  @Delete('session/:id')
  deleteSession(
    @Param('id') id: string,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.facultyService.deleteSession(id, user);
  }

  @Delete('classroom/:id')
  deleteClassroom(
    @Param('id') id: string,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.facultyService.deleteClassroom(id, user);
  }

  @Post('question-bank/ai-generate')
  generateQuestion(@Body() body: { description: string; type: 'CODING' | 'MCQ' }) {
    return this.facultyService.generateQuestion(body.description, body.type);
  }

  @Post('question-bank/save')
  saveQuestionToBank(@Body() body: any) {
    return this.facultyService.saveQuestionToBank(body);
  }

  @Get('question-banks')
  getQuestionBanks() {
    return this.facultyService.getQuestionBanks();
  }

  @Delete('question-bank/question/:id')
  deleteBankQuestion(@Param('id') id: string) {
    return this.facultyService.deleteBankQuestion(id);
  }

  @Delete('question-bank/:id')
  deleteQuestionBank(@Param('id') id: string) {
    return this.facultyService.deleteQuestionBank(id);
  }
}
