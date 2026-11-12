import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET') || '',
    });
  }

  async validate(payload: { id: number; email: string }) {
    // const faculty = await this.prisma.faculty.findUnique({
    //   where: {
    //     employeeID: payload.id,
    //   },
    //   omit: {
    //     password: true,
    //   },
    // });

    // if (faculty) return { user: faculty };

    // const student = await this.prisma.student.findUnique({
    //   where: {
    //     sap: payload.id,
    //   },
    //   omit: {
    //     password: true,
    //   },
    // });

    const user = payload;

    return user;
  }
}
