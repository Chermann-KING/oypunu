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

  @Prop()
  profilePicture: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop()
  lastActive: Date;

  @Prop()
  nativeLanguage: string;

  @Prop({ type: [String] })
  learningLanguages: string[];

  @Prop({ type: [String], default: [] })
  contacts: string[];

  @Prop({ default: ['user'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
