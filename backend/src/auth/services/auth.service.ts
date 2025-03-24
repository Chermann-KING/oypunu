import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { RegisterDto } from '../../users/dto/register.dto';
import { LoginDto } from '../../users/dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../common/services/mail.service';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private _jwtService: JwtService,
    private configService: ConfigService,
    private _mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, username, password } = registerDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
      if (existingUser.username === username) {
        throw new BadRequestException("Ce nom d'utilisateur est déjà pris");
      }
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du token de vérification
    const verificationToken: string = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24); // 24h de validité

    // Création de l'utilisateur
    const newUser = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpiration,
      isEmailVerified: false,
    });

    await newUser.save();

    try {
      // Envoi de l'email de vérification
      await this._mailService.sendVerificationEmail(
        email,
        verificationToken,
        username,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      this._logger.error(
        `Erreur lors de l'envoi de l'email de vérification: ${errorMessage}`,
      );
      // On ne relance pas l'erreur pour éviter de bloquer le processus d'inscription
    }

    return {
      message:
        'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = '';
    user.emailVerificationTokenExpires = new Date(0);

    await user.save();

    return {
      message:
        'Email vérifié avec succès. Vous pouvez maintenant vous connecter.',
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Cet email est déjà vérifié');
    }

    // Générer un nouveau token
    const verificationToken = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpires = tokenExpiration;

    await user.save();

    try {
      // Envoi de l'email
      await this._mailService.sendVerificationEmail(
        email,
        verificationToken,
        user.username,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      this._logger.error(
        `Erreur lors de l'envoi de l'email de vérification: ${errorMessage}`,
      );
      // On ne relance pas l'erreur pour éviter de bloquer le processus
    }

    return {
      message: 'Un nouvel email de vérification a été envoyé.',
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre email avant de vous connecter',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this._jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        nativeLanguage: user.nativeLanguage,
        learningLanguages: user.learningLanguages,
        profilePicture: user.profilePicture,
      },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Aucun compte associé à cet email');
    }

    const resetToken = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1); // 1h de validité

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = tokenExpiration;

    await user.save();

    try {
      // Envoi de l'email de réinitialisation
      await this._mailService.sendPasswordResetEmail(
        email,
        resetToken,
        user.username,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      this._logger.error(
        `Erreur lors de l'envoi de l'email de réinitialisation: ${errorMessage}`,
      );
      // On ne relance pas l'erreur pour éviter de bloquer le processus
    }

    return {
      message: 'Un email de réinitialisation de mot de passe a été envoyé.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = '';
    user.passwordResetTokenExpires = new Date(0);

    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return user;
  }
}
