import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FcSInDto, FcSUpDto, StSInDto, StSUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/faculty')
  signupFC(@Body() dto: FcSUpDto) {
    return this.authService.facultySignup(dto);
  }

  @Post('signin/faculty')
  signinFC(@Body() dto: FcSInDto) {
    return this.authService.facultySignin(dto);
  }

  @Post('signup/student')
  signupST(@Body() dto: StSUpDto) {
    return this.authService.studentSignup(dto);
  }

  @Post('signin/student')
  signinST(@Body() dto: StSInDto) {
    return this.authService.studentSignin(dto);
  }
}
