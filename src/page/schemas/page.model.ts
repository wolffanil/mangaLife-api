import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Chapter } from 'src/chapter/schemas/chapter.model';
import { Manga } from 'src/manga/schemas/manga.model';

@Schema({
  timestamps: true,
})
export class Page extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Chapter.name,
    required: true,
  })
  chapter: Chapter;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: Number, required: true })
  number: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Manga.name })
  manga: Manga;
}

export const PageSchema = SchemaFactory.createForClass(Page);
