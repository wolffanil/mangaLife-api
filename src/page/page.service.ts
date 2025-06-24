import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Page } from './schemas/page.model';
import { Model, Types } from 'mongoose';
import { PageCreateSingleDto } from './dto/page-create-single.dto';
import { PageUpdateImageDto } from './dto/page-update-image.dto';
import { PageUpdateNumberDto } from './dto/page-update-number.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<Page>,
  ) {}

  async createMany(
    imagePaths: string[],
    mangaId: Types.ObjectId,
    chapterId: Types.ObjectId,
  ) {
    const pages = imagePaths.map((path) => {
      const match = path.match(/(\d+)\.(png|jpe?g)$/);

      const number = match ? parseInt(match[1], 10) : null;

      if (number === null) {
        throw new BadRequestException(`Не валидный формат: ${path}`);
      }

      return {
        imagePath: path,
        number,
      };
    });

    const createdPages = await Promise.all(
      pages.map((page) =>
        this.pageModel.create({
          manga: mangaId,
          chapter: chapterId,
          image: page.imagePath,
          number: page.number,
        }),
      ),
    );

    return createdPages;
  }

  async createSingle(dto: PageCreateSingleDto) {
    const lastPage = await this.pageModel
      .findOne({ manga: dto.manga, chapter: dto.chapter })
      .sort({ number: -1 });

    return await this.pageModel.create({
      chapter: dto.chapter,
      manga: dto.manga,
      image: dto.image,
      number: lastPage ? lastPage.number + 1 : 1,
    });
  }

  async delete(pageId: Types.ObjectId) {
    const page = await this.pageModel.findByIdAndDelete(pageId);

    const pagesToUpdate = await this.pageModel.find({
      chapter: page.chapter,
      manga: page.manga,
      number: { $gt: Number(page.number) },
    });

    const updatedPages = await Promise.all(
      pagesToUpdate.map((page) => {
        page.number -= 1;
        return page.save();
      }),
    );

    return true;
  }

  async udpateImage(pageId: Types.ObjectId, dto: PageUpdateImageDto) {
    return await this.pageModel.findByIdAndUpdate(
      pageId,
      { image: dto.image },
      { new: true },
    );
  }

  async updateNumber(pageId: Types.ObjectId, dto: PageUpdateNumberDto) {
    const page = await this.pageModel.findById(pageId);

    const currentNumber = page.number;
    const newNumber = dto.number;

    if (currentNumber === newNumber)
      throw new BadRequestException('Номер страницы не поменялся');

    page.number = newNumber;

    if (newNumber > currentNumber) {
      const pagesToUpdate = await this.pageModel.find({
        number: { $gt: currentNumber, $lte: newNumber },
        chapter: page.chapter,
        manga: page.manga,
      });

      if (pagesToUpdate?.length) {
        await Promise.all(
          pagesToUpdate.map((page) => {
            page.number -= 1;
            return page.save();
          }),
        );
      }
    } else {
      const pagesToUpdate = await this.pageModel.find({
        number: { $gte: newNumber, $lt: currentNumber },
        manga: page.manga,
        chapter: page.chapter,
      });

      if (pagesToUpdate?.length) {
        await Promise.all(
          pagesToUpdate.map((page) => {
            page.number += 1;
            return page.save();
          }),
        );
      }
    }

    await page.save();

    return page;
  }

  async deleteManyByMangaId(mangaId: Types.ObjectId) {
    await this.pageModel.deleteMany({ manga: mangaId });

    return true;
  }

  async deleteManyByChapterId(chapterId: Types.ObjectId) {
    await this.pageModel.deleteMany({ chapter: chapterId });

    return true;
  }
}
