import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import mongoose from 'mongoose';

export class IdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') return value;

    if (!mongoose.isValidObjectId(value))
      throw new BadRequestException('Невалидный формат id');

    return value;
  }
}
