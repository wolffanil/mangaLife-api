import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Manga, MangaDocument } from './schemas/manga.model';
import { Model, Types } from 'mongoose';
import { MangaDto } from './dto/manga.dto';
import { MangaFilterDto } from './dto/manga-filter.dto';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Author } from 'src/author/schemas/author.model';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { ChapterService } from 'src/chapter/chapter.service';
import { PageService } from 'src/page/page.service';
import { PlanService } from 'src/plan/plan.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MangaService {
  private readonly index = 'mangas';
  private readonly cacheNewManga = 'new_mangas';
  private readonly cachePopularManga = 'popular_mangas';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Manga.name) private readonly mangaModel: Model<MangaDocument>,
    @InjectModel(Author.name) private readonly authorModel: Model<Author>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly reviewService: ReviewService,
    private readonly userService: UserService,
    private readonly chapterService: ChapterService,
    private readonly pageService: PageService,
    private readonly planService: PlanService,
  ) {}

  async getNew(): Promise<Manga[]> {
    const cachedManga = await this.cacheManager.get<Manga[]>(
      this.cacheNewManga,
    );
    if (cachedManga?.length) {
      return cachedManga;
    }
    const mangas = await this.mangaModel
      .find()
      .sort({ createdAt: -1 })
      .select('_id title titleRu description poster')
      .limit(15);

    await this.cacheManager.set(this.cacheNewManga, mangas);

    return mangas;
  }

  async getForPublish() {
    const mangas = await this.mangaModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author genres chapters pages');

    return mangas;
  }

  async getPopular() {
    const cachedManga = await this.cacheManager.get<Manga[]>(
      this.cachePopularManga,
    );
    if (cachedManga?.length) {
      return cachedManga;
    }

    const mangas = await this.mangaModel
      .find()
      .sort({ rating: -1 })
      .select('_id poster title titleRu description')
      .limit(15);

    await this.cacheManager.set(this.cachePopularManga, mangas);

    return mangas;
  }

  async search(query: string) {
    await this.checkExistDataInES();

    const response: SearchResponse<unknown> =
      await this.elasticsearchService.search({
        index: this.index,
        body: {
          query: {
            multi_match: {
              query,
              fields: ['title', 'titleRu', 'author'],
            },
          },
        },
      });

    if (response.hits && response.hits.hits) {
      const mangas = response.hits.hits
        .map((hit: any) => hit._source)
        .filter((manga) => manga.mangaId != undefined);

      return { mangas };
    }
    return [];
  }

  public async changeAuthorName() {
    await this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match_all: {},
        },
      },
    });
  }

  private async checkExistDataInES() {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: this.index,
    });

    if (!indexExists) {
      await this.elasticsearchService.indices.create({
        index: this.index,
      });
    }

    const { count } = await this.elasticsearchService.count({
      index: this.index,
    });

    if (count === 0) {
      const mangas = await this.mangaModel
        .find()
        .sort({ createdAt: -1 })
        .populate('author', 'name');

      const indexPromises = mangas.map((manga) => {
        const data = {
          mangaId: manga._id,
          poster: manga.poster,
          title: manga.title,
          description: manga.description,
          titleRu: manga.titleRu,
          author: manga?.author?.name,
        };

        return this.elasticsearchService.index({
          index: this.index,
          id: String(manga._id),
          body: data,
        });
      });

      await Promise.all(indexPromises);
    }
  }

  async create(dto: MangaDto) {
    const existManga = await this.mangaModel.findOne({
      $or: [{ title: dto.title }, { titleRu: dto.titleRu }],
    });

    if (existManga)
      throw new ConflictException('Манга с таким название уже есть');

    const manga = await this.mangaModel.create({
      title: dto.title,
      titleRu: dto.titleRu,
      description: dto.description,
      poster: dto.poster,
      ageLimit: dto.ageLimit,
      country: dto.country,
      year: dto.year,
      genres: dto.genres,
      author: dto.author,
      status: dto.status,
      type: dto.type,
    });

    const author = await this.authorModel.findById(dto.author).select('name');

    await this.indexManga({
      _id: manga._id,
      poster: manga.poster,
      title: manga.title,
      description: manga.description,
      titleRu: manga.titleRu,
      //@ts-ignore
      author: author.name,
    });

    const mangaCache = {
      _id: String(manga._id),
      poster: manga.poster,
      description: manga.description,
      title: manga.title,
      titleRu: manga.titleRu,
    };

    const cachedNewManga =
      (await this.cacheManager.get<
        Pick<Manga, '_id' | 'poster' | 'title' | 'titleRu' | 'description'>[]
      >(this.cacheNewManga)) || [];
    cachedNewManga.unshift(mangaCache);
    if (cachedNewManga.length > 15) {
      cachedNewManga.pop();
    }
    await this.cacheManager.set(this.cacheNewManga, cachedNewManga);

    return manga;
  }

  async updateOrDeleteFromCache(
    mangaId: Types.ObjectId,
    deleteFlag: boolean,
    manga?: Pick<Manga, '_id' | 'poster' | 'title' | 'titleRu' | 'description'>,
  ) {
    const cachedNewManga =
      (await this.cacheManager.get<Manga[]>(this.cacheNewManga)) || [];
    const cachedPopularManga =
      (await this.cacheManager.get<Manga[]>(this.cachePopularManga)) || [];

    if (deleteFlag) {
      const updatedNewManga = cachedNewManga.filter(
        (m) => m._id !== mangaId.toString(),
      );

      const updatedPopularManga = cachedPopularManga.filter(
        (m) => m._id !== mangaId.toString(),
      );

      await this.cacheManager.set(this.cacheNewManga, updatedNewManga);
      await this.cacheManager.set(this.cachePopularManga, updatedPopularManga);
    } else {
      const updatedNewManga = cachedNewManga.map((m) =>
        m._id === mangaId.toString() ? manga : m,
      );

      const updatedPopularManga = cachedPopularManga.map((m) =>
        m._id === mangaId.toString() ? manga : m,
      );

      await this.cacheManager.set(this.cacheNewManga, updatedNewManga);

      await this.cacheManager.set(this.cachePopularManga, updatedPopularManga);
    }
  }

  async existManga(mangaId: Types.ObjectId) {
    const manga = await this.mangaModel.findById(mangaId).countDocuments();

    return manga;
  }

  async update(mangaId: Types.ObjectId, dto: MangaDto) {
    const existManga = await this.existManga(mangaId);

    if (!existManga) throw new NotFoundException('Манга не найдена');

    const manga = await this.mangaModel.findByIdAndUpdate(
      mangaId,
      { ...dto },
      { new: true, runValidation: true },
    );

    const author = await this.authorModel.findById(dto.author).select('name');

    //@ts-ignore
    await Promise.all([
      this.updateElasticSearch(mangaId, {
        _id: manga._id,
        poster: manga.poster,
        title: manga.title,
        description: manga.description,
        titleRu: manga.titleRu,
        //@ts-ignore
        author: author.name,
      }),

      this.updateOrDeleteFromCache(mangaId, false, {
        _id: manga._id,
        poster: manga.poster,
        title: manga.title,
        titleRu: manga.titleRu,
        description: manga.description,
      }),
    ]);

    return manga;
  }

  async getById(mangaId: Types.ObjectId) {
    const manga = await this.mangaModel
      .findById(mangaId)
      .populate('genres author pages');

    if (!manga) throw new NotFoundException('Манга не найдена');

    return manga;
  }

  async getAll(filter: MangaFilterDto) {
    const query: any = {};

    if (filter.type) {
      query.type = filter.type;
    }
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.genres && filter.genres.length > 0) {
      query.genres = { $all: filter.genres };
    }
    const mangas = await this.mangaModel
      .find(query)
      .sort({ updatedAt: -1 })
      .select('_id title titleRu poster updatedAt createdAt');

    return mangas;
  }

  async delete(mangaId: Types.ObjectId) {
    try {
      await this.updateOrDeleteFromCache(mangaId, true);
      await this.deleteElastiSearch(mangaId);
    } catch (error) {}

    await Promise.all([
      this.reviewService.delete(mangaId),
      this.userService.deleteMangaFromFavorites(mangaId),
      this.chapterService.deleteManyByMangaId(mangaId),
      this.pageService.deleteManyByMangaId(mangaId),
      this.planService.deleteManyByMangaId(mangaId),
    ]);

    return await this.mangaModel.findByIdAndDelete(mangaId);
  }

  async getSimilarByAuthor(authorId: Types.ObjectId) {
    return await this.mangaModel
      .find({ author: authorId })
      .select('_id poster title titleRu createdAt')
      .sort({ createdAt: -1 });
  }

  async indexManga(manga: Manga) {
    await this.elasticsearchService.index({
      index: this.index,
      id: String(manga._id),
      body: {
        mangaId: String(manga._id),
        title: manga.title,
        titleRu: manga.titleRu,
        description: manga.description,
        poster: manga.poster,
        author: manga.author,
      },
    });
  }

  async deleteElastiSearch(mangaId: Types.ObjectId) {
    await this.elasticsearchService.delete({
      index: this.index,
      id: String(mangaId),
    });
  }

  async updateElasticSearch(mangaId: Types.ObjectId, manga: Manga) {
    await this.elasticsearchService.update({
      index: this.index,
      id: String(mangaId),
      body: {
        doc: {
          mangaId,
          title: manga.title,
          titleRu: manga.titleRu,
          description: manga.description,
          poster: manga.poster,
          author: manga.author,
        },
      },
    });
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleGetPopular() {
    const mangas = await this.mangaModel
      .find()
      .sort({ rating: -1 })
      .select('_id poster title titleRu description')
      .limit(15);

    await this.cacheManager.set(this.cachePopularManga, mangas);
  }
}
