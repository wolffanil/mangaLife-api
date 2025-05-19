import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Manga } from 'src/manga/schemas/manga.model';
import { Reason } from 'src/reason/schemas/reason.model';

export enum UserGender {
  MALE = 'мужской',
  FEMALE = 'женский',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PUBLISH = 'publish',
}

export interface UserDocument extends User {
  comparePassword: (candidatePassword: string) => Promise<Boolean>;
  reason: Reason;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document {
  @Prop({ unique: true, required: true, type: String })
  email: string;

  @Prop({ type: String, default: '/uploads/profile/default.png' })
  picture: string;

  @Prop({ type: String, required: true })
  nickname: string;

  @Prop({ type: String, enum: UserGender })
  gender?: UserGender;

  @Prop({ type: String })
  bio?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ type: Boolean, default: false })
  isBan: boolean;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Manga.name }],
    default: [],
  })
  favorites: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.virtual('reason', {
  ref: 'Reason',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});
