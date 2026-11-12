import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcSInDto, FcSUpDto, StSInDto, StSUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async facultySignup(dto: FcSUpDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.faculty.create({
        data: {
          email: dto.email,
          password: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          employeeID: dto.employeeID,
        },
      });

      return this.signToken(user.email, user.employeeID);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Creds Taken');
        }
      }
    }
  }

  async facultySignin(dto: FcSInDto) {
    const findUser = await this.prisma.faculty.findUnique({
      where: {
        email: dto.email,
      },
    });

    const user = await this.prisma.faculty.findUnique({
      where: {
        email: dto.email,
      },
      omit: {
        password: true,
      },
    });

    if (!findUser || !user) throw new ForbiddenException('Creds Invaild');

    const pwMatch = await argon.verify(findUser.password, dto.password);

    if (!pwMatch) throw new ForbiddenException('Creds Invalid');

    return this.signToken(user.email, user.employeeID);
  }

  async studentSignup(dto: StSUpDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.student.create({
        data: {
          email: dto.email,
          password: hash,
          sap: dto.sap,
          roll: dto.roll,
          firstName: dto.firstName,
          lastName: dto.lastName,
          // batchId: dto.batchId,
          // semester: dto.semester,

          batch: {
            connectOrCreate: {
              where: {
                semester_batchId: {
                  batchId: dto.batchId,
                  semester: dto.semester,
                },
              },
              create: {
                batchId: dto.batchId,
                semester: dto.semester,
              },
            },
          },
        },
      });

      return this.signToken(user.email, user.sap);
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Creds Taken');
        }
      }
    }
  }

  async studentSignin(dto: StSInDto) {
    const findUser = await this.prisma.student.findUnique({
      where: {
        email: dto.email,
      },
    });

    const user = await this.prisma.student.findUnique({
      where: {
        email: dto.email,
      },
      omit: {
        password: true,
      },
    });

    if (!findUser || !user) throw new ForbiddenException('Creds Invaild');

    const pwMatch = await argon.verify(findUser.password, dto.password);

    if (!pwMatch) throw new ForbiddenException('Creds Invalid');

    return this.signToken(user.email, user.sap);
  }

  async signToken(
    email: string,
    userId: number,
  ): Promise<{ access_token: string }> {
    const payload = {
      id: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
