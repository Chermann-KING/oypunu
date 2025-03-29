import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserDocument } from '../schemas/user.schema';

interface UserResponse {
  id: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
  role: string;
  nativeLanguage: string;
  learningLanguages: string[];
  profilePicture?: string;
}

interface PublicUserResponse {
  id: string;
  username: string;
  nativeLanguage: string;
  learningLanguages: string[];
  profilePicture?: string;
}

@Controller('users')
export class UsersController {
  constructor(private _usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @Req() req: { user: { userId: string } },
  ): Promise<UserResponse> {
    const user = (await this._usersService.findById(
      req.user.userId,
    )) as UserDocument;
    if (!user || !user._id) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      nativeLanguage: user.nativeLanguage,
      learningLanguages: user.learningLanguages,
      profilePicture: user.profilePicture,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: { user: { userId: string } },
    @Body()
    updateData: {
      nativeLanguage: string;
      learningLanguages: string[];
      profilePicture: string;
    },
  ): Promise<UserResponse> {
    // Sécurité: ne pas permettre de mettre à jour certains champs sensibles
    const safeUpdateData = {
      nativeLanguage: updateData.nativeLanguage,
      learningLanguages: updateData.learningLanguages,
      profilePicture: updateData.profilePicture,
    };

    const updatedUser = (await this._usersService.updateUser(
      req.user.userId,
      safeUpdateData,
    )) as UserDocument;

    if (!updatedUser || !updatedUser._id) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      username: updatedUser.username,
      isEmailVerified: updatedUser.isEmailVerified,
      role: updatedUser.role,
      nativeLanguage: updatedUser.nativeLanguage,
      learningLanguages: updatedUser.learningLanguages,
      profilePicture: updatedUser.profilePicture,
    };
  }

  @Get(':username')
  async getUserByUsername(
    @Param('username') username: string,
  ): Promise<PublicUserResponse> {
    const user = (await this._usersService.findByUsername(
      username,
    )) as UserDocument;
    if (!user || !user._id) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      nativeLanguage: user.nativeLanguage,
      learningLanguages: user.learningLanguages,
      profilePicture: user.profilePicture,
    };
  }
}
