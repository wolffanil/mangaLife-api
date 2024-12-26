import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PremiumSchema } from './schemas/premium.model';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Premium', schema: PremiumSchema }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [PremiumController],
  providers: [PremiumService],
})
export class PremiumModule {}
