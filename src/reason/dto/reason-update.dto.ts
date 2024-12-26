import { IsString } from 'class-validator';

export class ReasonUpdateDto {
  @IsString({ message: 'жалобы должна быть' })
  text: string;
}
