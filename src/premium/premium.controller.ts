import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Type,
} from '@nestjs/common';
import { PremiumService } from './premium.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { Types } from 'mongoose';
import { PaymentStatusDto } from './dto/payment-status.dto';

@Controller('premiums')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Post('place')
  @Auth()
  async checkout(@User('_id') userId: Types.ObjectId) {
    const payment = await this.premiumService.createPayment(userId);

    return { payment };
  }

  @Get('exist')
  @Auth()
  async existPremuim(@User('_id') userId: Types.ObjectId) {
    const premium = await this.premiumService.existPremium(userId);

    return { premium };
  }

  @Post('status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Body() dto: PaymentStatusDto) {
    return await this.premiumService.updateStatus(dto);
  }
}
