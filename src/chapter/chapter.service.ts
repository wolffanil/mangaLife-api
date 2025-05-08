import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chapter } from './schemas/chapter.model';
import { Model, Types } from 'mongoose';
import { ChapterCreateDto } from './dto/chapter-create.dto';
import { ChapterUpdateDto } from './dto/chapter-update.dto';
import { PageService } from 'src/page/page.service';
import { PlanService } from 'src/plan/plan.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectModel(Chapter.name) private readonly chapterModel: Model<Chapter>,
    private readonly pageService: PageService,
    private readonly planSerice: PlanService,
  ) {}

  async create(dto: ChapterCreateDto) {
    const existChapter = await this.getChapter(dto.manga, dto.chapter, dto.tom);

    if (existChapter) throw new ConflictException('Глава ухе существует');

    const newPage = await this.chapterModel.create({
      name: dto.name,
      manga: dto.manga,
      chapter: dto.chapter,
      tom: dto.tom,
    });

    const pages = await this.pageService.createMany(
      dto.pagesUrl,
      dto.manga,
      newPage._id as Types.ObjectId,
    );

    //@ts-ignore

    return newPage;
  }

  async getChapter(manga: Types.ObjectId, chapter: number, tom: number) {
    return await this.chapterModel.findOne({ manga, chapter, tom });
  }

  async update(chapterId: Types.ObjectId, dto: ChapterUpdateDto) {
    return await this.chapterModel.findByIdAndUpdate(
      chapterId,
      { tom: dto.tom, chapter: dto.chapter, name: dto.name },
      { new: true, runValidators: true },
    );
  }

  async delete(chapterId: Types.ObjectId) {
    const [chapter, res] = await Promise.all([
      this.chapterModel.findByIdAndDelete(chapterId),
      this.pageService.deleteManyByChapterId(chapterId),
    ]);

    const chapters = await this.chapterModel.find({
      manga: chapter.manga,
      chapter: { $gt: Number(chapter.chapter) },
    });

    if (chapters.length) {
      await Promise.all(
        chapters.map((chap) => {
          chap.chapter -= 1;

          return chap.save();
        }),
      );
    }

    return true;
  }

  async deleteManyByMangaId(mangaId: Types.ObjectId) {
    await this.chapterModel.deleteMany({ manga: mangaId });

    return true;
  }

  async getByMangaId(mangaId: Types.ObjectId) {
    return await this.chapterModel
      .find({ manga: mangaId })
      .sort({ tom: 1, chapter: 1 });
    // .sort({ createdAt: 1 });
  }

  async getById(chapterId: Types.ObjectId) {
    return await this.chapterModel.findById(chapterId).populate({
      path: 'pages',
      options: { sort: { number: 1 } },
    });
  }

  async getChapterByUser(mangaId: Types.ObjectId, userId: Types.ObjectId) {
    const existPlan = await this.planSerice.getByMangaId(userId, mangaId);

    if (!existPlan) {
      return await this.chapterModel
        .findOne()
        .sort({ createdAt: 1 })
        .populate('pages');
    }

    let chapter = await this.chapterModel
      .findOne({ manga: mangaId, chapter: Number(existPlan.chapter) })
      .populate('pages');

    //@ts-ignore
    const chapterInfo = { chapter, currentPage: existPlan.currentPage };

    return chapterInfo;
  }
}
