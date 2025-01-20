import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Author } from 'src/author/schemas/author.model';
import { Genre } from 'src/genre/schemas/genre.model';

export enum EnumMangaStatus {
  Announcement = 'Анонс',
  CONTINUE = 'Продолжается',
  COMPLETED = 'Завершён',
}

export enum EnumMangaType {
  MANGA = 'Манга',
  MANHWA = 'Манхва',
  MANHUA = 'Манхуа',
  RUMANGA = 'Руманга',
}

export interface MangaDocument extends Manga {
  chapters: number;
  pages: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Manga extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  titleRu: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Author.name,
    required: true,
  })
  author: Author;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: Genre.name }])
  genres: Genre[];

  @Prop({ type: Number, required: true })
  ageLimit: number;

  @Prop({ type: Number, required: true })
  year: number;

  @Prop({ type: String, required: true })
  country: string;

  @Prop({ type: String, required: true })
  poster: string;

  @Prop({ type: String, enum: EnumMangaStatus, required: true })
  status: EnumMangaStatus;

  @Prop({ type: String, enum: EnumMangaType, required: true })
  type: EnumMangaType;

  @Prop({ type: Number, default: 0 })
  rating: number;
}

export const MangaSchema = SchemaFactory.createForClass(Manga);

MangaSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'manga',
  count: true,
});

MangaSchema.virtual('pages', {
  ref: 'Page',
  localField: '_id',
  foreignField: 'manga',
  count: true,
});
