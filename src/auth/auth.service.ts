import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CheckEmailDto } from './dto/chekEmail-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Response } from 'express';
import { OAuthDto } from './dto/OAuthDto';

@Injectable()
export class AuthService {
  EXPIRES_DAY_REFRESH_TOKEN = 7;
  REFRESH_TOKEN_NAME = 'refreshToken_mangalife';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async checkEmail({ email }: CheckEmailDto) {
    const existUser = await this.userService.getByEmail(email);

    if (!existUser) throw new NotFoundException('Пользователь не найден!');

    return true;
  }

  async login(dto: LoginAuthDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.issueTokens(user.id);

    user.password = undefined;

    return { user, ...tokens };
  }

  async register(dto: RegisterAuthDto) {
    const existUser = await this.userService.getByEmail(dto.email);

    if (existUser)
      throw new ConflictException('Пользователь с таким email существует');

    const user = await this.userService.create(dto);
    const tokens = await this.issueTokens(user.id);

    user.password = undefined;

    return { user, ...tokens };
  }

  async issueTokens(userId: string) {
    const data = { id: userId };

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('refreshToken не валидный');

    const user = await this.userService.getById(result.id);

    if (user.isBan) throw new ForbiddenException('Вы были забанены');

    const tokens = await this.issueTokens(user.id);

    return { user, ...tokens };
  }

  private async validateUser(dto: LoginAuthDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user?.password)
      throw new BadRequestException('Пользователь вошёл через соц.сеть');

    if (!user?._id || !(await user.comparePassword(dto.password)))
      throw new NotFoundException('Email или пароль не верны');

    if (user.isBan) throw new ForbiddenException('Вы были забанены');

    return user;
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRES_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: expiresIn,
      sameSite: 'none',
      secure: true,
      path: '/',
    });
  }

  removeRefreshTokenFromResponce(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }

  async validateOAuthLogin(req: { user: OAuthDto }) {
    let user = await this.userService.getByEmail(req.user.email);

    if (!user) {
      user = await this.userService.createOAuth(req.user);
    }

    const tokens = await this.issueTokens(user.id);

    return { user, ...tokens };
  }
}
