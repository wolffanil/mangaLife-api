import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Manga } from 'src/manga/schemas/manga.model';
import { Page } from 'src/page/schemas/page.model';

export interface ChapterDocument {
  pages: Page[];
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Chapter extends Document {
  @Prop({ type: Number, required: true })
  chapter: number;

  @Prop({ type: Number, required: true })
  tom: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Manga.name,
    required: true,
  })
  manga: Manga;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.virtual('pages', {
  ref: 'Page',
  localField: '_id',
  foreignField: 'chapter',
});
