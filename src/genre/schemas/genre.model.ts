import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Genre extends Document {
  @Prop({ type: String, required: true })
  title: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
