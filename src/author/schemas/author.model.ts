import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface AuthorDocument extends Author {
  existManga: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Author extends Document {
  @Prop({ type: String, required: true })
  name: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.virtual('existManga', {
  ref: 'Manga',
  localField: '_id',
  foreignField: 'author',
  count: true,
});
