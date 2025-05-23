import { Injectable, NotFoundException } from '@nestjs/common';
import { path } from 'app-root-path';
import { pathExists, unlink } from 'fs-extra';
import * as AdmZip from 'adm-zip';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from 'src/libs/storage/storage.service';

@Injectable()
export class FileService {
  constructor(private readonly storageService: StorageService) {}

  async saveFile(file: Express.Multer.File, folder: string) {
    const response = async () => {
      const basePath = '/uploads';
      const originName = `${basePath}/${folder}/${Date.now()}-${file.originalname}`;

      await this.storageService.upload(file.buffer, originName, file.mimetype);

      return {
        url: originName,
      };
    };

    const res = await response();

    return { ...res };
  }

  async extractAndSaveZip(
    file: Express.Multer.File,
    folder: string = 'pages',
    mangaId: string,
  ): Promise<string[]> {
    const id = uuidv4();

    const basePath = '/uploads';

    const folderPath = `${basePath}/mangas/${mangaId}/${folder}/${id}`;

    const zipBuffer = file.buffer;

    const zip = new AdmZip(zipBuffer);
    const extractedFiles = zip.getEntries();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    let counter = 1;

    const filePromises = extractedFiles
      .filter((entry) => !entry.isDirectory)
      .filter((entry) =>
        validExtensions.includes(extname(entry.entryName).toLowerCase()),
      )
      .map(async (entry) => {
        const ext = extname(entry.entryName).toLowerCase();
        const fileName = `${counter++}${ext}`;
        const filePath = `${folderPath}/${fileName}`;

        await this.storageService.upload(
          entry.getData() as Buffer,
          filePath,
          'image/' + ext.split('.')[1],
        );

        return `${basePath}/mangas/${mangaId}/${folder}/${id}/${fileName}`.replace(
          /\\/g,
          '/',
        );
      });

    return await Promise.all(filePromises);
  }

  async deleteFile(fileUrl: string) {
    if (!fileUrl.startsWith('/uploads/')) {
      throw new NotFoundException('Не валидная ссылка');
    }

    const filePath = `${path}${fileUrl}`;

    const fileExists = await pathExists(filePath);
    if (!fileExists) {
      throw new NotFoundException(`Файл "${fileUrl}" не найден`);
    }

    await unlink(filePath);

    return { message: `Файл "${fileUrl}" был успешно удалён` };
  }
}
