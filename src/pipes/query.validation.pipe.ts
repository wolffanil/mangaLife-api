import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class QueryValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') return value;

    if (!value || value?.length < 2)
      throw new BadRequestException('Параметр должен быть');

    return value;
  }
}
