import { Body, ForbiddenException, Injectable, NotFoundException, Param, BadRequestException } from '@nestjs/common';
import { GetDecodedToken } from 'src/auth/decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateClassroomDto, CreateLiveCodingSessionDto } from './dto';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';

@Injectable()
export class FacultyService {
  private model: ChatOpenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.model = new ChatOpenAI({
      modelName: this.config.get<string>('MODEL_NAME') ?? 'gpt-4o',
      openAIApiKey: this.config.get<string>('OPENAI_API_KEY'),
      temperature: 0.6,
    });
  }

  async getFC(@GetDecodedToken() user: { id: number; email: string }) {
    try {
      const faculty = await this.prisma.faculty.findUnique({
        where: {
          employeeID: user.id,
        },
        omit: {
          password: true,
        },
      });

      if (!faculty) throw new ForbiddenException('User Not Found');

      return faculty;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createClassroom(
    @Body() body: CreateClassroomDto,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    try {
      const faculty = await this.prisma.faculty.findUnique({ where: { employeeID: user.id } });
      if (!faculty) throw new ForbiddenException('Only faculty can create classrooms');

      const classroom = await this.prisma.classroom.create({
        data: {
          course: body.course,
          semester: body.semester,
          faculty: { connect: { employeeID: user.id } },
          batches: {
            create: body.batches.map((batch) => ({
              batch: {
                connectOrCreate: {
                  where: {
                    semester_batchId: {
                      semester: batch.semester,
                      batchId: batch.batchId,
                    },
                  },
                  create: { semester: batch.semester, batchId: batch.batchId },
                },
              },
            })),
          },
        },
        include: { batches: true },
      });

      if (!classroom) throw new Error('Something went wrong');

      return classroom;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getClassrooms(@GetDecodedToken() user: { id: number; email: string }) {
    try {
      const classrooms = await this.prisma.classroom.findMany({
        where: {
          facultyID: user.id,
        },
        include: {
          batches: true,
          sessions: {
            select: { id: true, title: true, isActive: true, endTime: true },
          },
        },
      });

      return classrooms;
    } catch (error) {
      console.log(error);
    }
  }

  async getClassroom(@Param() params: any) {
    try {
      const classroom = await this.prisma.classroom.findUnique({
        where: {
          id: Number(params.id),
        },
        include: {
          batches: true,
          sessions: {
            include: {
              questions: {
                include: {
                  testCases: true,
                },
              },
              faculty: {
                select: {
                  employeeID: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  students: true,
                  submissions: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!classroom) throw new Error('Not Found');
      return classroom;
    } catch (error) {
      console.log(error);
    }
  }

  async createLiveCodingSession(
    @Body() body: CreateLiveCodingSessionDto,
    @GetDecodedToken() user: { id: number; email: string },
  ) {
    try {
      // Calculate total score from all questions
      const totalScore = body.questions.reduce(
        (sum, question) => sum + question.score,
        0,
      );

      // Create the live coding session with nested questions and test cases
      const session = await this.prisma.liveCodingSession.create({
        data: {
          title: body.title,
          description: body.description,
          startTime: body.startTime,
          endTime: body.endTime,
          totalScore: totalScore,
          showResultsImmediately: body.showResultsImmediately ?? true,
          classroom: { connect: { id: body.classroomId } },
          faculty: { connect: { employeeID: user.id } },
          questions: {
            create: body.questions.map((question) => ({
              title: question.title,
              description: question.description ?? '',
              score: question.score,
              type: question.type ?? 'CODING',
              options: question.options ?? [],
              functionName: question.functionName ?? null,
              parameters: question.parameters ?? null,
              returnType: question.returnType ?? null,
              aiEnabled: question.type === 'CODING' ? (question.aiEnabled ?? false) : false,
              aiMaxUses: question.type === 'CODING' ? (question.aiMaxUses ?? 3) : 3,
              testCases: {
                create: question.testCases.map((testCase) => ({
                  input: testCase.input,
                  expectedOutput: testCase.expectedOutput,
                  isHidden: testCase.isHidden,
                })),
              },
            })),
          },
        },
        include: {
          questions: {
            include: {
              testCases: true,
            },
          },
          classroom: true,
          faculty: {
            select: {
              employeeID: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!session) throw new Error('Failed to create session');

      return session;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async toggleShowResults(sessionId: string, user: { id: number; email: string }) {
    try {
      const session = await this.prisma.liveCodingSession.findUnique({
        where: { id: Number(sessionId) },
      });

      if (!session) throw new NotFoundException('Session not found');
      if (session.facultyId !== user.id) throw new ForbiddenException('Not your session');

      const updated = await this.prisma.liveCodingSession.update({
        where: { id: Number(sessionId) },
        data: { showResultsImmediately: !session.showResultsImmediately },
        select: { id: true, showResultsImmediately: true },
      });

      return updated;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteSession(sessionId: string, user: { id: number; email: string }) {
    try {
      const session = await this.prisma.liveCodingSession.findUnique({
        where: { id: Number(sessionId) },
      });

      if (!session) throw new NotFoundException('Session not found');
      if (session.facultyId !== user.id) throw new ForbiddenException('Not your session');

      await this.prisma.liveCodingSession.delete({ where: { id: Number(sessionId) } });

      return { message: 'Session deleted' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteClassroom(classroomId: string, user: { id: number; email: string }) {
    try {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: Number(classroomId) },
      });

      if (!classroom) throw new NotFoundException('Classroom not found');
      if (classroom.facultyID !== user.id) throw new ForbiddenException('Not your classroom');

      await this.prisma.classroom.delete({ where: { id: Number(classroomId) } });

      return { message: 'Classroom deleted' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async saveQuestionToBank(body: {
    bankTag: string;
    bankLabel?: string;
    bankDescription?: string;
    question: {
      title: string;
      description: string;
      type: string;
      difficulty: string;
      defaultScore: number;
      tags: string[];
      options?: string[];
      functionName?: string;
      parameters?: any;
      returnType?: string;
      authorLabel?: string;
      testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
    };
  }) {
    const { bankTag, bankLabel, bankDescription, question } = body;

    const bank = await this.prisma.questionBank.upsert({
      where: { tag: bankTag },
      update: {},
      create: {
        tag: bankTag,
        label: bankLabel || bankTag,
        description: bankDescription || '',
      },
    });

    const created = await this.prisma.bankQuestion.create({
      data: {
        bankId: bank.id,
        title: question.title,
        description: question.description,
        type: question.type as any,
        difficulty: question.difficulty as any,
        defaultScore: question.defaultScore,
        tags: question.tags ?? [],
        options: question.options ?? [],
        functionName: question.functionName ?? null,
        parameters: question.parameters ?? undefined,
        returnType: question.returnType ?? null,
        authorLabel: question.authorLabel ?? null,
        testCases: { create: question.testCases },
      },
    });

    return { bank, question: created };
  }

  async getQuestionBanks() {
    return this.prisma.questionBank.findMany({
      include: {
        questions: {
          include: { testCases: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteQuestionBank(bankId: string) {
    const id = Number(bankId);
    const bank = await this.prisma.questionBank.findUnique({ where: { id } });
    if (!bank) throw new NotFoundException('Bank not found');
    await this.prisma.questionBank.delete({ where: { id } });
    return { message: 'Bank deleted' };
  }

  async deleteBankQuestion(questionId: string) {
    const id = Number(questionId);
    const question = await this.prisma.bankQuestion.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    await this.prisma.bankQuestion.delete({ where: { id } });
    return { message: 'Question deleted' };
  }

  async generateQuestion(description: string, type: 'CODING' | 'MCQ') {
    if (!description || !description.trim()) {
      throw new BadRequestException(
        'Please provide a problem description first so the AI has context to generate a question.',
      );
    }

    const PARAM_TYPE = z.enum(['number', 'string', 'boolean', 'number[]', 'string[]', 'number[][]', 'string[][]']);

    const codingSchema = z.object({
      title:        z.string().describe('Short, clear title for the question'),
      description:  z.string().describe('Well-formatted problem statement with constraints and 1-2 examples'),
      functionName: z.string().describe('camelCase JavaScript function name the student must implement'),
      returnType:   PARAM_TYPE.describe('Return type of the function'),
      parameters:   z.array(z.object({
        name: z.string().describe('Parameter name'),
        type: PARAM_TYPE.describe('Parameter type'),
      })).describe('Function parameters'),
      testCase1: z.object({ input: z.string().describe('JSON array of arguments — one element per parameter. Single number: [5]. Single array param: [[1,2,3]]. Array+number: [[1,2,3],5]. NEVER bare [1,2,3] for a list param.'), expectedOutput: z.string().describe('Exact return value as string, no quotes') }).describe('Visible test case — simple example (isHidden will be false)'),
      testCase2: z.object({ input: z.string().describe('JSON array of arguments — one element per parameter. Single number: [5]. Single array param: [[1,2,3]]. Array+number: [[1,2,3],5]. NEVER bare [1,2,3] for a list param.'), expectedOutput: z.string().describe('Exact return value as string, no quotes') }).describe('Visible test case — simple example (isHidden will be false)'),
      testCase3: z.object({ input: z.string().describe('JSON array of arguments — one element per parameter. Single number: [5]. Single array param: [[1,2,3]]. Array+number: [[1,2,3],5]. NEVER bare [1,2,3] for a list param.'), expectedOutput: z.string().describe('Exact return value as string, no quotes') }).describe('Hidden test case — edge case (isHidden will be true)'),
      testCase4: z.object({ input: z.string().describe('JSON array of arguments — one element per parameter. Single number: [5]. Single array param: [[1,2,3]]. Array+number: [[1,2,3],5]. NEVER bare [1,2,3] for a list param.'), expectedOutput: z.string().describe('Exact return value as string, no quotes') }).describe('Hidden test case — edge case (isHidden will be true)'),
    });

    const mcqSchema = z.object({
      title:        z.string().describe('The question text — a complete sentence ending with ?'),
      description:  z.string().describe('Optional code snippet or context; empty string if not needed'),
      options:      z.array(z.string()).length(4).describe('Exactly 4 distinct answer options'),
      correctIndex: z.number().int().min(0).max(3).describe('0-based index of the correct option (0=A, 1=B, 2=C, 3=D)'),
    });

    const systemPrompt =
      type === 'CODING'
        ? `You are an expert programming instructor creating a coding question for a live coding exam platform.
The student will write a function to solve the problem. You define the function signature and test cases.

Rules:
- Generate exactly 4 test cases: first 2 with isHidden false (simple visible examples), last 2 with isHidden true (edge cases)
- Input is a JSON array where each element is one argument passed to the function, in parameter order
- A single number param:        [5]
- A single array param:         [[3,1,4,1,5]]      ← outer [] = args list, inner [] = the array value
- A single 2D array param:      [[[1,2],[3,4]]]
- Two params (array + number):  [[3,1,4,1,5],7]
- Two array params:             [[1,2,3],[4,5,6]]
- NEVER write a bare array like [3,1,4,1,5] for a list param — always wrap it: [[3,1,4,1,5]]
- expectedOutput must be the exact string the function returns (no extra text, no quotes around strings)
- functionName must be a valid camelCase JavaScript identifier
- description should include constraints (e.g. array length limits, value ranges) and 1-2 examples`
        : `You are an expert instructor creating a multiple-choice question for a coding/CS exam.

Rules:
- title is the question itself (a complete sentence ending with ?)
- Provide exactly 4 distinct, plausible options — only one is correct
- Make distractors realistic (common misconceptions, off-by-one values, similar-sounding terms)
- description can include a code snippet or context if needed, or be an empty string`;

    const userPrompt =
      type === 'CODING'
        ? `Problem description: ${description.trim()}\n\nGenerate the coding question.`
        : `Topic/description: ${description.trim()}\n\nGenerate the MCQ question.`;

    try {
      if (type === 'CODING') {
        const structured = this.model.withStructuredOutput(codingSchema, { name: 'coding_question', method: 'functionCalling' });
        const result = await structured.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ]);
        return {
          type: 'CODING',
          title: result.title,
          description: result.description,
          functionName: result.functionName,
          returnType: result.returnType,
          parameters: result.parameters,
          testCases: [
            { ...result.testCase1, isHidden: false },
            { ...result.testCase2, isHidden: false },
            { ...result.testCase3, isHidden: true },
            { ...result.testCase4, isHidden: true },
          ],
        };
      } else {
        const structured = this.model.withStructuredOutput(mcqSchema, { name: 'mcq_question', method: 'functionCalling' });
        const result = await structured.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ]);
        return {
          type: 'MCQ',
          title: result.title,
          description: result.description,
          options: result.options,
          correctLetter: String.fromCharCode(65 + result.correctIndex),
        };
      }
    } catch (err: any) {
      console.error('AI generation error:', err?.message ?? err);
      throw new BadRequestException('AI generation failed. Please try again or fill the question manually.');
    }
  }

  async getSessionProctorLogs(sessionId: string) {
    const id = Number(sessionId);
    const logs = await this.prisma.proctorLog.findMany({
      where: { sessionId: id },
      select: {
        type: true,
        createdAt: true,
        content: true,
        student: { select: { sap: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by student, then by event type with timestamps
    const byStudent = new Map<number, {
      sap: number; firstName: string; lastName: string;
      events: { type: string; entries: { timestamp: string; content: string | null }[] }[];
    }>();

    for (const log of logs) {
      const sap = log.student.sap;
      if (!byStudent.has(sap)) {
        byStudent.set(sap, {
          sap,
          firstName: log.student.firstName,
          lastName: log.student.lastName,
          events: [],
        });
      }
      const entry = byStudent.get(sap)!;
      let ev = entry.events.find(e => e.type === log.type);
      if (!ev) { ev = { type: log.type, entries: [] }; entry.events.push(ev); }
      ev.entries.push({ timestamp: log.createdAt.toISOString(), content: log.content ?? null });
    }

    return Array.from(byStudent.values()).map(s => ({
      ...s,
      totalViolations: s.events.reduce((sum, e) => sum + e.entries.length, 0),
    }));
  }

  async getSessionSubmissions(sessionId: string) {
    try {
      const id = Number(sessionId);

      // Fetch session with questions
      const session = await this.prisma.liveCodingSession.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          totalScore: true,
          isActive: true,
          questions: {
            select: {
              id: true,
              title: true,
              score: true,
            },
          },
        },
      });

      if (!session) throw new Error('Session not found');

      // Fetch all submissions for this session
      const submissions = await this.prisma.codeSubmission.findMany({
        where: { sessionId: id },
        include: {
          student: {
            select: {
              sap: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          question: {
            select: {
              id: true,
              title: true,
              score: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Fetch all students enrolled in this session's classroom batches
      const sessionRecord = await this.prisma.liveCodingSession.findUnique({ where: { id }, select: { classroomId: true } });
      const classroomWithStudents = await this.prisma.classroom.findUnique({
        where: { id: sessionRecord!.classroomId },
        select: {
          batches: {
            select: {
              batch: {
                select: {
                  students: {
                    select: { sap: true, firstName: true, lastName: true, email: true },
                  },
                },
              },
            },
          },
        },
      });

      const allStudents = classroomWithStudents?.batches.flatMap(b => b.batch.students) ?? [];

      return {
        session,
        submissions,
        allStudents,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
