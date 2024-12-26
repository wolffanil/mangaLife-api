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
} from '@nestjs/common';
import { ReasonService } from './reason.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ReasonDto } from './dto/reason.dto';
import { Types } from 'mongoose';
import { ReasonUpdateDto } from './dto/reason-update.dto';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';

@Controller('reasons')
export class ReasonController {
  constructor(private readonly reasonService: ReasonService) {}

  @Get()
  @Auth('admin')
  async getAll() {
    const reasons = await this.reasonService.getAll();

    return { reasons };
  }

  @Post()
  @Auth()
  async create(@Body() dto: ReasonDto) {
    const reason = await this.reasonService.create(dto);

    return { reason };
  }

  @Patch(':id')
  @Auth()
  async update(
    @Param('id', IdValidationPipe) reasonId: Types.ObjectId,
    @Body() dto: ReasonUpdateDto,
  ) {
    const reason = await this.reasonService.update(reasonId, dto);

    return { reason };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  async delete(@Param('id', IdValidationPipe) reasonId: Types.ObjectId) {
    return await this.reasonService.delete(reasonId);
  }
}
