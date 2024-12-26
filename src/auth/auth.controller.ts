import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Request, Response } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckEmailDto } from './dto/chekEmail-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Recaptcha()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.register(dto);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Post('checkEmail')
  @Recaptcha()
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() dto: CheckEmailDto) {
    return await this.authService.checkEmail(dto);
  }

  @Post('login')
  @Recaptcha()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.login(dto);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Post('refresh')
  @HttpCode(200)
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookies =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponce(res);
      throw new UnauthorizedException('RefreshToken не прошол');
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(
      refreshTokenFromCookies,
    );

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponce(res);
    return true;
  }

  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuth(@Req() req) {}

  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuthCallback(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.validateOAuthLogin(req);

    if (response.user.isBan)
      return res.redirect(`${process.env['CLIENT_URL']}?user-is-ban=true`);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    res.redirect(
      `${process.env['CLIENT_URL']}?accessToken=${response.accessToken}`,
    );
  }

  @Get('vkontakte')
  @UseGuards(AuthGuard('vkontakte'))
  async vkontakteAuth(@Req() req) {}

  @Get('vkontakte/callback')
  @UseGuards(AuthGuard('vkontakte'))
  async vkontakteAuthCallback(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.validateOAuthLogin(req);

    if (response.user.isBan)
      return res.redirect(`${process.env['CLIENT_URL']}?user-is-ban=true`);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    res.redirect(
      `${process.env['CLIENT_URL']}?accessToken=${response.accessToken}`,
    );
  }
}
