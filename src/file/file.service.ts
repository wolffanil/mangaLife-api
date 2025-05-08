import { Injectable, NotFoundException } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, pathExists, unlink, writeFile } from 'fs-extra';
import * as AdmZip from 'adm-zip';
import { join, extname, relative } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  async saveFile(file: Express.Multer.File, folder: string) {
    const uploadedFolder = `${path}/uploads/${folder}`;

    await ensureDir(uploadedFolder);

    const response = async () => {
      const originName = `${Date.now()}-${file.originalname}`;

      await writeFile(`${uploadedFolder}/${originName}`, file.buffer);

      return {
        url: `/uploads/${folder}/${originName}`,
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
    const basePath = 'uploads';
    const id = uuidv4();

    const folderPath = join(basePath, 'mangas', mangaId, folder, id);

    await ensureDir(folderPath);

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
        const filePath = join(folderPath, fileName);

        await writeFile(filePath, entry.getData());

        return `/${basePath}/mangas/${mangaId}/${folder}/${id}/${fileName}`.replace(
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
