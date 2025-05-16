import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from './schemas/plan.model';
import { Model, Types } from 'mongoose';
import { PlanCreateDto } from './dto/plan-create.dto';
import { PlanUpdateStatusDto } from './dto/plan-update-status.dto';
import { PlanUpdateChapterDto } from './dto/plan-update-chapter.dto';
import { Manga, MangaDocument } from 'src/manga/schemas/manga.model';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    @InjectModel(Manga.name) private readonly mangaModel: Model<MangaDocument>,
  ) {}

  async create(userId: Types.ObjectId, dto: PlanCreateDto) {
    const existPlan = await this.planModel.findOne({
      user: userId,
      manga: dto.manga,
    });

    if (existPlan) {
      existPlan.status = dto.status;
      // existPlan.chapter = dto.chapter;
      // existPlan.currentPage = dto.page;
      existPlan.chapter = 1;
      existPlan.currentPage = 1;
      existPlan.pages = 1;

      await existPlan.save();

      return existPlan;
    }

    return await this.planModel.create({
      user: userId,
      status: dto.status,
      manga: dto.manga,
      // chapter: dto.chapter,
      // page: dto.page,
    });
  }

  async updateStatus(planId: Types.ObjectId, dto: PlanUpdateStatusDto) {
    const existPlan = await this.planModel.findById(planId);

    if (!existPlan) throw new NotFoundException('План не найден');

    existPlan.status = dto.status;

    await existPlan.save();

    return existPlan;
  }

  async getMy(userId: Types.ObjectId, sortBy: string, searchQuery: string) {
    const sort: Record<string, 1 | -1> = {};

    if (sortBy === 'titleEnglishA-Z') sort['manga.title'] = 1;
    else if (sortBy === 'titleRussianA-Я') sort['manga.titleRu'] = 1;

    const match: Record<string, any> = {
      user: userId,
    };

    if (searchQuery) {
      match.$or = [
        { 'manga.titleRu': { $regex: searchQuery, $options: 'i' } },
        { 'manga.title': { $regex: searchQuery, $options: 'i' } },
      ];
    }

    if (sortBy || searchQuery) {
      const plans = await this.planModel
        .aggregate([
          {
            $lookup: {
              from: 'mangas',
              localField: 'manga',
              foreignField: '_id',
              as: 'manga',
            },
          },
          {
            $unwind: '$manga',
          },
          {
            $match: match,
          },
          ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
          ...(Object.keys(sort).length > 0 ? [{ $sort: sort }] : []),
        ])
        .exec();

      const populatedPlans = await Promise.all(
        plans.map(async (plan) => {
          const mangaWithRelations = await this.mangaModel.populate(
            plan.manga,
            [
              {
                path: 'chapters',
              },
              {
                path: 'pages',
              },
            ],
          );
          return {
            ...plan,
            manga: mangaWithRelations,
          };
        }),
      );

      return populatedPlans;
    }

    return await this.planModel
      .find({ user: userId })
      .populate('manga', '_id title titleRu poster')
      .populate({
        path: 'manga',
        select: '_id title titleRu poster',
        populate: { path: 'pages chapters' },
      })
      .sort({ createdAt: -1 });
  }

  async updateChapter(
    userId: Types.ObjectId,
    planId: Types.ObjectId,
    dto: PlanUpdateChapterDto,
  ) {
    const existPlan = await this.planModel.findOne({
      user: userId,
      _id: planId,
    });

    if (!existPlan) return null;

    existPlan.chapter = existPlan.chapter + 1;
    existPlan.pages = existPlan.pages + 1;
    existPlan.currentPage = 1;

    await existPlan.save();

    return existPlan;
  }

  async updatePage(userId: Types.ObjectId, planId: Types.ObjectId) {
    const existPlan = await this.planModel.findOne({
      user: userId,
      _id: planId,
    });

    if (!existPlan) return null;

    existPlan.pages = existPlan.pages + 1;
    existPlan.currentPage = existPlan.currentPage + 1;

    await existPlan.save();

    return existPlan;
  }

  async getByMangaId(userId: Types.ObjectId, mangaId: Types.ObjectId) {
    return await this.planModel.findOne({ user: userId, manga: mangaId });
  }

  async delete(planId: Types.ObjectId) {
    await this.planModel.findByIdAndDelete(planId);

    return true;
  }

  async deleteManyByMangaId(mangaId: Types.ObjectId) {
    await this.planModel.deleteMany({ manga: mangaId });

    return true;
  }
}
