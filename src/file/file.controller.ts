import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryValidationPipe } from 'src/pipes/query.validation.pipe';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async saveFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder', QueryValidationPipe) folder: string,
  ) {
    return await this.fileService.saveFile(file, folder);
  }

  @Post('upload-zip')
  @Auth('publish')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadZip(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder', QueryValidationPipe) folder: string,
    @Query('mangaId', QueryValidationPipe) mangaId: string,
  ) {
    const urls = await this.fileService.extractAndSaveZip(
      file,
      folder,
      mangaId,
    );

    return { pagesUrl: urls };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @Auth()
  async deleteFile(@Query('fileUrl', QueryValidationPipe) fileUrl: string) {
    return await this.fileService.deleteFile(fileUrl);
  }
}
