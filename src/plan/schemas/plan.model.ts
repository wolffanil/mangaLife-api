import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Manga } from 'src/manga/schemas/manga.model';
import { User } from 'src/user/schemas/user.model';

export enum EnumPlanStatus {
  READING = 'Читаю',
  READ = 'Прочитано',
  PLAN = 'В планах',
  FAVORITE = 'Любимые',
}

@Schema({
  timestamps: true,
})
export class Plan extends Document {
  @Prop({ type: Number, required: true, default: 1 })
  pages: number;

  @Prop({ type: Number, required: true, default: 1 })
  currentPage: number;

  @Prop({ type: Number, required: true, default: 1 })
  chapter: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Manga.name,
    required: true,
  })
  manga: Manga;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: User;

  @Prop({ type: String, enum: EnumPlanStatus, required: true })
  status: EnumPlanStatus;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
