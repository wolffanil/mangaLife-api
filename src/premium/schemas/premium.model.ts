import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum EnumPremiumStatus {
  PENDING = 'pending',
  PAYED = 'payed',
}

@Schema({
  timestamps: true,
})
export class Premium extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({
    type: String,
    enum: EnumPremiumStatus,
    default: EnumPremiumStatus.PENDING,
  })
  status: EnumPremiumStatus;
}

export const PremiumSchema = SchemaFactory.createForClass(Premium);
