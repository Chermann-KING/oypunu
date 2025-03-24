import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../../users/dto/register.dto';
import { LoginDto } from '../../users/dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this._authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this._authService.login(loginDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this._authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerificationEmail(@Body() body: { email: string }) {
    return this._authService.resendVerificationEmail(body.email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this._authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this._authService.resetPassword(body.token, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }
}
