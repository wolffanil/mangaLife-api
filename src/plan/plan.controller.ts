import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { Types } from 'mongoose';
import { PlanCreateDto } from './dto/plan-create.dto';
import { PlanUpdateStatusDto } from './dto/plan-update-status.dto';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { PlanUpdateChapterDto } from './dto/plan-update-chapter.dto';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('my')
  @Auth()
  async getMy(
    @User('_id') userId: Types.ObjectId,
    @Query('q') searchQuery: string,
    @Query('sortBy') sortBy: string,
  ) {
    const plans = await this.planService.getMy(userId, sortBy, searchQuery);

    return { plans };
  }

  @Patch('update-chapter/:id')
  @Auth()
  async updateChapter(
    @User('_id') userId: Types.ObjectId,
    @Param('id', IdValidationPipe) planId: Types.ObjectId,
    @Body() dto: PlanUpdateChapterDto,
  ) {
    const plan = await this.planService.updateChapter(userId, planId, dto);

    return { plan };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  async delete(@Param('id', IdValidationPipe) planId: Types.ObjectId) {
    return await this.planService.delete(planId);
  }

  @Patch('update-page/:id')
  @Auth()
  async updatePage(
    @User('_id') userId: Types.ObjectId,
    @Param('id', IdValidationPipe) planId: Types.ObjectId,
  ) {
    const plan = await this.planService.updatePage(userId, planId);

    return { plan };
  }

  @Patch('update-status/:id')
  @Auth()
  async updateStatus(
    @Param('id', IdValidationPipe) planId: Types.ObjectId,
    @Body() dto: PlanUpdateStatusDto,
  ) {
    const plan = await this.planService.updateStatus(planId, dto);

    return { plan };
  }

  @Post()
  @Auth()
  async create(
    @User('_id') userId: Types.ObjectId,
    @Body() dto: PlanCreateDto,
  ) {
    const plan = await this.planService.create(userId, dto);

    return { plan };
  }
}
