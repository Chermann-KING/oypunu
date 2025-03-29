import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: string;
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, required: false, default: null })
  emailVerificationToken: string;

  @Prop({ type: Date, required: false, default: null })
  emailVerificationTokenExpires: Date;

  @Prop({ type: String, required: false, default: null })
  passwordResetToken: string;

  @Prop({ type: Date, required: false, default: null })
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

  @Prop({ type: Object, default: {} })
  socialProviders: Record<string, string>;
}

export const UserSchema = SchemaFactory.createForClass(User);
