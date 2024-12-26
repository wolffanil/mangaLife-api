import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reason } from './schemas/reason.model';
import { Model, Types } from 'mongoose';
import { ReasonDto } from './dto/reason.dto';
import { UserService } from 'src/user/user.service';
import { ReasonUpdateDto } from './dto/reason-update.dto';

@Injectable()
export class ReasonService {
  constructor(
    @InjectModel(Reason.name) private readonly ResonModel: Model<Reason>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(dto: ReasonDto) {
    await this.userService.checkIsBan(dto.userId);

    const reason = await this.ResonModel.create({
      user: dto.userId,
      text: dto.text,
    });

    return reason;
  }

  async update(reasonId: Types.ObjectId, dto: ReasonUpdateDto) {
    const existReason = await this.ResonModel.findById(reasonId);

    if (!existReason) throw new NotFoundException('Жалоба не найденна');

    existReason.text = dto.text;

    await existReason.save();

    return existReason;
  }

  async delete(reasonId: Types.ObjectId) {
    await this.ResonModel.findByIdAndDelete(reasonId);

    return true;
  }

  async getAll() {
    const reasons = await this.ResonModel.find()
      .sort({ updatedAt: -1 })
      .populate('user', '_id nickname picture');

    return reasons;
  }

  async deleteAllReasonsUser(userId: Types.ObjectId) {
    await this.ResonModel.deleteMany({ user: userId });

    return true;
  }
}
