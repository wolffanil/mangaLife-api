import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Manga } from 'src/manga/schemas/manga.model';
import { User } from 'src/user/schemas/user.model';

export enum EnumReviewStatus {
  NEW = 'Новый',
  REJECT = 'Отклонённый',
  WARNING = 'Предупреждения',
  BLOCK = 'Заблокированый',
}

@Schema({
  timestamps: true,
})
export class Review extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Manga.name,
    required: true,
  })
  manga: Manga;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Number, min: 1, max: 5 })
  rating?: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Review.name })
  parent?: Review;

  @Prop({ type: Boolean, default: false })
  isComplain: boolean;

  @Prop({ type: String, enum: EnumReviewStatus, default: EnumReviewStatus.NEW })
  status: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
