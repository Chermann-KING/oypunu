import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  emailVerificationTokenExpires: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetTokenExpires: Date;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  profilePicture: string;

  @Prop({ type: [String], default: [] })
  favoriteWords: string[];

  @Prop()
  nativeLanguage: string;

  @Prop({ type: [String], default: [] })
  learningLanguages: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
