import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PageService } from './page.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PageCreateSingleDto } from './dto/page-create-single.dto';
import { Types } from 'mongoose';
import { PageUpdateImageDto } from './dto/page-update-image.dto';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { PageUpdateNumberDto } from './dto/page-update-number.dto';

@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  @Auth('publish')
  async createSingle(@Body() dto: PageCreateSingleDto) {
    const page = await this.pageService.createSingle(dto);

    return { page };
  }

  @Patch('update-image/:id')
  @Auth('publish')
  async updateImage(
    @Param('id', IdValidationPipe) pageId: Types.ObjectId,
    @Body() dto: PageUpdateImageDto,
  ) {
    const page = await this.pageService.udpateImage(pageId, dto);

    return { page };
  }

  @Patch('update-number/:id')
  @Auth('publish')
  async updateNumber(
    @Param('id', IdValidationPipe) pageId: Types.ObjectId,
    @Body()
    dto: PageUpdateNumberDto,
  ) {
    const page = await this.pageService.updateNumber(pageId, dto);

    return { page };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth('publish')
  async delete(@Param('id', IdValidationPipe) pageId: Types.ObjectId) {
    return await this.pageService.delete(pageId);
  }
}
