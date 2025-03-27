import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Res,
  Query,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../../users/dto/register.dto';
import { LoginDto } from '../../users/dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest, Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface SocialAuthRequest extends ExpressRequest {
  user: {
    user: {
      id: string;
    };
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private _authService: AuthService,
    private _configService: ConfigService,
  ) {}

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

  /* Routes d'authentification sociale */

  // Google Authentication
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Cette route sert de point d'entrée pour l'auth Google
    // Le middleware AuthGuard redirige vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Request() req: SocialAuthRequest, @Res() res: Response) {
    const { user } = req;
    // Génère un token temporaire pour stocker dans le localStorage
    const socialAuthToken = this._authService.generateSocialAuthToken(user);

    // Redirige vers le frontend avec le token
    return res.redirect(
      `${this._configService.get('CLIENT_URL')}/social-auth-success?token=${socialAuthToken}`,
    );
  }

  // Facebook Authentication
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Cette route sert de point d'entrée pour l'auth Facebook
    // Le middleware AuthGuard redirige vers Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookAuthCallback(
    @Request() req: SocialAuthRequest,
    @Res() res: Response,
  ) {
    const { user } = req;
    // Génère un token temporaire pour stocker dans le localStorage
    const socialAuthToken = this._authService.generateSocialAuthToken(user);

    // Redirige vers le frontend avec le token
    return res.redirect(
      `${this._configService.get('CLIENT_URL')}/social-auth-success?token=${socialAuthToken}`,
    );
  }

  // Twitter Authentication
  @Get('twitter')
  @UseGuards(AuthGuard('twitter'))
  async twitterAuth() {
    // Cette route sert de point d'entrée pour l'auth Twitter
    // Le middleware AuthGuard redirige vers Twitter
  }

  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  twitterAuthCallback(@Request() req: SocialAuthRequest, @Res() res: Response) {
    const { user } = req;
    // Génère un token temporaire pour stocker dans le localStorage
    const socialAuthToken = this._authService.generateSocialAuthToken(user);

    // Redirige vers le frontend avec le token
    return res.redirect(
      `${this._configService.get('CLIENT_URL')}/social-auth-success?token=${socialAuthToken}`,
    );
  }

  // Endpoint pour récupérer les données utilisateur après authentification sociale
  @Get('social-auth-callback')
  async getSocialAuthData(@Query('token') token: string) {
    return this._authService.validateSocialAuthToken(token);
  }
}
