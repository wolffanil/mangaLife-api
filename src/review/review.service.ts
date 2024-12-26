import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schemas/review.model';
import { Model, Types } from 'mongoose';
import { ReviewCreateDto } from './dto/review-create.dto';
import { ReviewChangeStatusDto } from './dto/review-change-status.dto';
import { ReviewParentCreateDto } from './dto/review-create-parent.dto';
import { returnUserObject } from './objects/return-user.object';
import { Manga } from 'src/manga/schemas/manga.model';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Manga.name) private readonly mangaModel: Model<Manga>,
  ) {}

  async create(userId: Types.ObjectId, dto: ReviewCreateDto) {
    const review = await this.reviewModel.findOneAndUpdate(
      { user: userId, manga: dto.manga },
      {
        user: userId,
        text: dto.text,
        rating: dto.rating,
        manga: dto.manga,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const avarageRating = await this.averageRatingManga(dto.manga);

    await this.mangaModel.findByIdAndUpdate(dto.manga, {
      rating: avarageRating,
    });

    return review;
  }

  async delete(mangaId: Types.ObjectId) {
    await this.reviewModel.deleteMany({ manga: mangaId });

    return true;
  }

  async changeStatus(reviewId: Types.ObjectId, dto: ReviewChangeStatusDto) {
    return await this.reviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        isComplain: true,
      },
      {
        status: dto.status,
      },
      { new: true },
    );
  }

  async createChild(
    userId: Types.ObjectId,
    parentId: Types.ObjectId,
    dto: ReviewParentCreateDto,
  ) {
    return await this.reviewModel.create({
      user: userId,
      manga: dto.manga,
      text: dto.text,
      parent: parentId,
    });
  }

  async getComplains() {
    return await this.reviewModel
      .find({ isComplain: true })
      .populate('user', returnUserObject);
  }

  async getByMangaId(mangaId: Types.ObjectId) {
    return await this.reviewModel
      .find({ manga: mangaId, parent: [null, undefined] })
      .populate('user', returnUserObject);
  }

  async getChildren(parentId: Types.ObjectId) {
    return await this.reviewModel
      .find({ parent: parentId })
      .populate('user', returnUserObject);
  }

  async setComplain(reviewId: Types.ObjectId) {
    return await this.reviewModel.findByIdAndUpdate(
      reviewId,
      {
        isComplain: true,
      },
      { new: true },
    );
  }

  async averageRatingManga(mangaId: Types.ObjectId) {
    const ratingMovie: Review[] = await this.reviewModel.aggregate().match({
      manga: new Types.ObjectId(mangaId),
    });

    return (
      ratingMovie.reduce((acc, item) => acc + item.rating, 0) /
      ratingMovie.length
    );
  }
}
