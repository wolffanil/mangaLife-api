import { BadRequestException, Injectable } from '@nestjs/common';

import { ICapturePayment, YooCheckout } from '@a2seven/yoo-checkout';
import { InjectModel } from '@nestjs/mongoose';
import { EnumPremiumStatus, Premium } from './schemas/premium.model';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatusDto } from './dto/payment-status.dto';

const checkout = new YooCheckout({
  shopId: '1004089',
  secretKey: 'test_qUhcbZXimd6_7HMm5-krP2cC2wlULSVntG_xjSpKnL4',
});

@Injectable()
export class PremiumService {
  constructor(
    @InjectModel(Premium.name) private readonly premiumModel: Model<Premium>,
  ) {}

  async existPremium(userId: Types.ObjectId) {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const premium = await this.premiumModel.findOne({
      user: userId,
      updatedAt: { $gt: oneMonthAgo },
      status: EnumPremiumStatus.PAYED,
    });

    return premium;
  }

  async createPayment(userId: Types.ObjectId) {
    const existPremium = await this.existPremium(userId);

    if (existPremium) throw new BadRequestException('Подписка есть');

    const premium = await this.premiumModel.create({ user: userId });

    const total = 250;

    const payment = await checkout.createPayment({
      amount: {
        value: total.toFixed(2),
        currency: 'RUB',
      },
      payment_method_data: {
        type: 'bank_card',
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.CLIENT_URL}/thanks`,
      },
      description: `Оплата подписки на сайте MangaLife. Id платежа: #${premium._id}`,
    });
    return payment.confirmation.confirmation_url;
  }

  async updateStatus(dto: PaymentStatusDto) {
    if (dto.event === 'payment.waiting_for_capture') {
      const capturePayment: ICapturePayment = {
        amount: {
          value: dto.object.amount.value,
          currency: dto.object.amount.currency,
        },
      };

      return checkout.capturePayment(dto.object.id, capturePayment);
    }

    if (dto.event === 'payment.succeeded') {
      const orderId = dto.object.description.split('#')[1];

      await this.premiumModel.findByIdAndUpdate(orderId, {
        status: EnumPremiumStatus.PAYED,
      });

      return true;
    }

    return true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const now = new Date();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    await this.premiumModel.deleteMany({
      updatedAt: { $lt: oneMonthAgo },
    });
  }
}
