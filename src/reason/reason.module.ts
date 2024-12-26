import { forwardRef, Module } from '@nestjs/common';
import { ReasonService } from './reason.service';
import { ReasonController } from './reason.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReasonSchema } from './schemas/reason.model';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Reason', schema: ReasonSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [ReasonController],
  providers: [ReasonService],
  exports: [ReasonService],
})
export class ReasonModule {}
