import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.model';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';
import { hash } from 'bcryptjs';
import { OAuthDto } from 'src/auth/dto/OAuthDto';
import { ReasonService } from 'src/reason/reason.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    @Inject(forwardRef(() => ReasonService))
    private readonly reasonService: ReasonService,
  ) {}

  async getById(_id: string) {
    const user = await this.UserModel.findById(_id);

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async updateProfile(userId: Types.ObjectId, dto: UpdateProfileDto) {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        nickname: dto.nickname,
        bio: dto.bio ?? undefined,
        gender: dto.gender ?? undefined,
        picture: dto.picture,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return user;
  }

  async getByEmail(email: string) {
    const user = await this.UserModel.findOne({ email }).select('+password');

    return user;
  }

  async create(dto: RegisterAuthDto) {
    return await this.UserModel.create({
      nickname: dto.nickname,
      email: dto.email,
      password: await hash(dto.password, 12),
    });
  }

  async createOAuth(dto: OAuthDto) {
    return await this.UserModel.create({
      nickname: dto.name,
      email: dto.email,
      picture: dto?.picture ?? null,
    });
  }

  async checkIsBan(userId: Types.ObjectId) {
    const user = await this.UserModel.findById(userId);

    if (user.isBan) throw new BadRequestException('Пользователь забанен');

    return user;
  }

  async setBan(userId: Types.ObjectId) {
    await this.reasonService.deleteAllReasonsUser(userId);

    return await this.UserModel.findByIdAndUpdate(
      userId,
      { isBan: true },
      { new: true },
    );
  }

  async setUnBan(userId: Types.ObjectId) {
    return await this.UserModel.findByIdAndUpdate(
      userId,
      { isBan: false },
      { new: true },
    );
  }

  async getIsBans() {
    return await this.UserModel.find({ isBan: true }).select(
      '_id nickname picture isBan',
    );
  }

  async toggleFavorite(mangaId: Types.ObjectId, user: UserDocument) {
    const { _id, favorites } = user;

    await this.UserModel.findByIdAndUpdate(_id, {
      favorites: favorites.includes(mangaId)
        ? favorites.filter((id) => String(id) !== String(mangaId))
        : [...favorites, mangaId],
    });

    return true;
  }

  async getFavoriteMangas(userId: Types.ObjectId) {
    return await this.UserModel.findById(userId, 'favorites')
      .populate({
        path: 'favorites',
        select: '_id poster title titleRu author',
        populate: {
          path: 'author chapters',
        },
      })
      .then((data) => data.favorites);
  }

  async deleteMangaFromFavorites(mangaId: Types.ObjectId) {
    await this.UserModel.updateMany(
      {
        favorites: mangaId,
      },
      { $pull: { favorites: mangaId } },
    );
  }
}
