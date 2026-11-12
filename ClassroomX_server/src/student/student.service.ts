import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GetDecodedToken } from 'src/auth/decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getST(@GetDecodedToken() user: { id: number; email: string }) {
    console.log(user);
    try {
      const student = await this.prisma.student.findUnique({
        where: {
          sap: user.id,
        },
        omit: {
          password: true,
        },
      });

      if (!student) throw new ForbiddenException('User Not Found');

      return student;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getClassrooms(@GetDecodedToken() user: { id: number; email: string }) {
    try {
      const student = await this.prisma.student.findUnique({
        where: { sap: user.id },
      });

      if (!student) {
        throw new ForbiddenException('Student not found');
      }

      const classrooms = await this.prisma.batchOnClassroom.findMany({
        where: {
          batchId: student.batchId,
          semester: student.semester,
        },
        include: {
          classroom: {
            include: {
              sessions: {
                include: {
                  submissions: {
                    where: {
                      studentId: student.sap,
                    },
                    include: {
                      question: {
                        select: {
                          id: true,
                          title: true,
                          score: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return classrooms;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getClassroom(@Param() params: any, user: { id: number; email: string }) {
    try {
      const student = await this.prisma.student.findUnique({
        where: { sap: user.id },
      });

      if (!student) {
        throw new ForbiddenException('Student not found');
      }

      const classroom = await this.prisma.classroom.findUnique({
        where: {
          id: Number(params.id),
        },
        include: {
          sessions: {
            include: {
              submissions: {
                where: {
                  studentId: student.sap,
                },
                include: {
                  question: {
                    select: {
                      id: true,
                      title: true,
                      score: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!classroom) throw new NotFoundException('Classroom not found');

      return classroom;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getSession(sessionId: string, user: { id: number; email: string }) {
    try {
      const sessionIdNum = parseInt(sessionId);
      
      if (isNaN(sessionIdNum)) {
        throw new BadRequestException('Invalid session ID');
      }

      // Verify student exists
      const student = await this.prisma.student.findUnique({
        where: { sap: user.id },
      });

      if (!student) {
        throw new ForbiddenException('Student not found');
      }

      // Fetch session with all necessary data
      const session = await this.prisma.liveCodingSession.findUnique({
        where: { id: sessionIdNum },
        include: {
          questions: {
            include: {
              testCases: true,
            },
          },
          classroom: true,
          submissions: {
            where: {
              studentId: student.sap,
            },
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  score: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Verify student has access to this session (check if student's batch is enrolled in the classroom)
      const hasAccess = await this.prisma.batchOnClassroom.findFirst({
        where: {
          classroomId: session.classroomId,
          batchId: student.batchId,
          semester: student.semester,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this session');
      }

      // // Check if session is active
      // if (!session.isActive) {
      //   throw new BadRequestException('This session is not active');
      // }

      // // Check if session has ended
      // if (session.endTime && new Date(session.endTime) < new Date()) {
      //   throw new BadRequestException('This session has ended');
      // }

      // Auto-register student to session if not already registered
      await this.prisma.studentSession.upsert({
        where: {
          sessionId_studentId: {
            sessionId: sessionIdNum,
            studentId: student.sap,
          },
        },
        update: {},
        create: {
          sessionId: sessionIdNum,
          studentId: student.sap,
        },
      });

      return session;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async submitSolution(
    sessionId: string,
    body: {
      questionId: number;
      code: string;
      language: string;
      score: number;
      isSuccessful: boolean;
      output?: string | null;
      error?: string | null;
      testResults?: any[] | null;
    },
    user: { id: number; email: string },
  ) {
    try {
      const sessionIdNum = parseInt(sessionId);
      
      if (isNaN(sessionIdNum)) {
        throw new BadRequestException('Invalid session ID');
      }

      // Verify student exists
      const student = await this.prisma.student.findUnique({
        where: { sap: user.id },
      });

      if (!student) {
        throw new ForbiddenException('Student not found');
      }

      // Verify session exists and is active
      const session = await this.prisma.liveCodingSession.findUnique({
        where: { id: sessionIdNum },
        include: {
          questions: {
            where: { id: body.questionId },
            include: {
              testCases: true,
            },
          },
        },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (!session.isActive) {
        throw new BadRequestException('This session is not active');
      }

      if (session.endTime && new Date(session.endTime) < new Date()) {
        throw new BadRequestException('This session has ended');
      }

      // Verify question exists in this session
      const question = session.questions.find(q => q.id === body.questionId);
      if (!question) {
        throw new NotFoundException('Question not found in this session');
      }

      // Verify student has access to this session
      const hasAccess = await this.prisma.batchOnClassroom.findFirst({
        where: {
          classroomId: session.classroomId,
          batchId: student.batchId,
          semester: student.semester,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this session');
      }

      // Get previous submission to track score changes
      const previousSubmission = await this.prisma.codeSubmission.findUnique({
        where: {
          sessionId_studentId_questionId: {
            sessionId: sessionIdNum,
            studentId: student.sap,
            questionId: body.questionId,
          },
        },
      });

      const previousScore = previousSubmission?.score || 0;

      // Create or update the submission with score and test results
      const submission = await this.prisma.codeSubmission.upsert({
        where: {
          sessionId_studentId_questionId: {
            sessionId: sessionIdNum,
            studentId: student.sap,
            questionId: body.questionId,
          },
        },
        update: {
          code: body.code,
          language: body.language,
          score: body.score,
          isSuccessful: body.isSuccessful,
          output: body.output,
          error: body.error,
          testResults: body.testResults ?? undefined,
          updatedAt: new Date(),
        },
        create: {
          sessionId: sessionIdNum,
          studentId: student.sap,
          questionId: body.questionId,
          code: body.code,
          language: body.language,
          score: body.score,
          isSuccessful: body.isSuccessful,
          output: body.output,
          error: body.error,
          testResults: body.testResults ?? undefined,
        },
        include: {
          question: {
            select: {
              title: true,
              score: true,
            },
          },
        },
      });

      // Update leaderboard entry
      const scoreDifference = body.score - previousScore;
      
      await this.prisma.leaderboardEntry.upsert({
        where: {
          sessionId_studentId: {
            sessionId: sessionIdNum,
            studentId: student.sap,
          },
        },
        update: {
          totalScore: {
            increment: scoreDifference,
          },
        },
        create: {
          sessionId: sessionIdNum,
          studentId: student.sap,
          totalScore: body.score,
        },
      });

      return {
        success: true,
        message: 'Solution submitted successfully',
        submission: {
          id: submission.id,
          questionId: submission.questionId,
          questionTitle: submission.question.title,
          language: submission.language,
          score: submission.score,
          isSuccessful: submission.isSuccessful,
          submittedAt: submission.createdAt,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logProctorEvents(
    sessionId: string,
    events: { type: string; timestamp: string; content?: string }[],
    user: { id: number; email: string },
  ) {
    const id = Number(sessionId);
    if (!events?.length) return { logged: 0 };

    const validTypes = [
      'TAB_SWITCH',
      'COPY',
      'PASTE',
      'CUT',
      'WINDOW_BLUR',
      'NO_FACE_DETECTED',
      'MULTIPLE_FACES',
      'VOICE_DETECTED',
      'FULLSCREEN_EXIT',
    ];
    const rows = events
      .filter((e) => validTypes.includes(e.type))
      .map((e) => ({
        sessionId: id,
        studentId: user.id,
        type: e.type as any,
        content: e.content ? e.content.slice(0, 75000) : null,
        createdAt: new Date(e.timestamp),
      }));

    if (!rows.length) return { logged: 0 };

    try {
      await this.prisma.proctorLog.createMany({ data: rows });
    } catch (err: any) {
      if (
        err?.message?.includes('invalid input value for enum') ||
        err?.message?.includes('ProctorEventType') ||
        err?.code === '22P02'
      ) {
        try {
          await this.prisma.$executeRawUnsafe(`ALTER TYPE "ProctorEventType" ADD VALUE IF NOT EXISTS 'NO_FACE_DETECTED';`);
          await this.prisma.$executeRawUnsafe(`ALTER TYPE "ProctorEventType" ADD VALUE IF NOT EXISTS 'MULTIPLE_FACES';`);
          await this.prisma.$executeRawUnsafe(`ALTER TYPE "ProctorEventType" ADD VALUE IF NOT EXISTS 'VOICE_DETECTED';`);
          await this.prisma.$executeRawUnsafe(`ALTER TYPE "ProctorEventType" ADD VALUE IF NOT EXISTS 'FULLSCREEN_EXIT';`);
          await this.prisma.proctorLog.createMany({ data: rows });
        } catch (healErr) {
          console.error('Failed to auto-heal proctor event enum in database:', healErr);
        }
      } else {
        console.error('Error logging proctor events:', err);
      }
    }
    return { logged: rows.length };
  }
}
