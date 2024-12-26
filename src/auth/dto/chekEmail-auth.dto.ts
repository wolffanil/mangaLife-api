import { IsString } from 'class-validator';

export class CheckEmailDto {
  @IsString({
    message: 'Почта обязательна',
  })
  email: string;
}
