import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { ExecuteService } from './execute.service';
import { GetDecodedToken } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

import { SubmitSolutionDto } from './dto/submission.dto';
import { ExecuteDto } from './dto/execute.dto';

@UseGuards(JwtGuard)
@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly executeService: ExecuteService,
  ) {}

  @Get('me')
  getme(@GetDecodedToken() user: { id: number; email: string }) {
    return this.studentService.getST(user);
  }

  @Get('classrooms')
  getClassrooms(@GetDecodedToken() user: { id: number; email: string }) {
    return this.studentService.getClassrooms(user);
  }

  @Get('classroom/:id')
  getClassroom(
    @Param() params: any,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.studentService.getClassroom(params, user);
  }

  @Get('session/:sessionId')
  getSession(
    @Param('sessionId') sessionId: string,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.studentService.getSession(sessionId, user);
  }

  @Post('execute')
  execute(@Body() body: ExecuteDto) {
    return this.executeService.run(
      body.language,
      body.code,
      body.stdin,
      body.functionName,
      body.parameters,
      body.returnType,
    );
  }

  @Post('session/:sessionId/submit')
  submitSolution(
    @Param('sessionId') sessionId: string,
    @Body() body: SubmitSolutionDto,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.studentService.submitSolution(sessionId, body, user);
  }

  @Post('session/:sessionId/proctor')
  logProctorEvents(
    @Param('sessionId') sessionId: string,
    @Body() body: { events: { type: string; timestamp: string }[] },
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    return this.studentService.logProctorEvents(sessionId, body.events, user);
  }
}
