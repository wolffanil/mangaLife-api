import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { ReviewCreateDto } from './dto/review-create.dto';
import { ReviewParentCreateDto } from './dto/review-create-parent.dto';
import { ReviewChangeStatusDto } from './dto/review-change-status.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('get-by-manga/:id')
  async getByManga(@Param('id', IdValidationPipe) mangaId: Types.ObjectId) {
    const reviews = await this.reviewService.getByMangaId(mangaId);

    return { reviews };
  }

  @Get('get-by-parent/:id')
  async getByParent(@Param('id', IdValidationPipe) parentId: Types.ObjectId) {
    const children = await this.reviewService.getChildren(parentId);

    return { children };
  }

  @Get('get-complains')
  @Auth('admin')
  async getComplains() {
    const complains = await this.reviewService.getComplains();

    return { complains };
  }

  @Post()
  @Auth()
  async create(
    @User('_id') userId: Types.ObjectId,
    @Body() dto: ReviewCreateDto,
  ) {
    const review = await this.reviewService.create(userId, dto);

    return { review };
  }

  @Post('answer/:id')
  @Auth()
  async createChild(
    @User('_id') userId: Types.ObjectId,
    @Param('id', IdValidationPipe) parentId: Types.ObjectId,
    @Body() dto: ReviewParentCreateDto,
  ) {
    const review = await this.reviewService.createChild(userId, parentId, dto);

    return { review };
  }

  @Patch('change-status/:id')
  @Auth('admin')
  async changeStatus(
    @Param('id', IdValidationPipe) reviewId: Types.ObjectId,
    @Body() dto: ReviewChangeStatusDto,
  ) {
    const review = await this.reviewService.changeStatus(reviewId, dto);

    return { review };
  }

  @Patch('set-complain/:id')
  @Auth()
  async setComplain(@Param('id', IdValidationPipe) reviewId: Types.ObjectId) {
    const review = await this.reviewService.setComplain(reviewId);

    return { review };
  }
}
