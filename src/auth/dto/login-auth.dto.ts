import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsString({
    message: 'Почта обязательна',
  })
  @IsEmail({}, { message: 'Почта должна быть валидной' })
  email: string;

  @MinLength(6, {
    message: 'Пароль должен содержать не менее 6 символов!',
  })
  @IsString({
    message: 'Пароль обязателен',
  })
  password: string;
}
