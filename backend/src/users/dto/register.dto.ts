import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores",
  })
  username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  password: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsString({ each: true })
  learningLanguages?: string[];
}
