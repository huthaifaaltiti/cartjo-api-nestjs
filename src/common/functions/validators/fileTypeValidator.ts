import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

import { Locale } from 'src/types/Locale';
import { getMessage } from 'src/common/utils/translator';

type FileType = Express.Multer.File | File;
type AllowedTypes = string[];

export const fileTypeValidator = (
  file: FileType | undefined,
  allowedTypes: AllowedTypes = [
    // Images
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif',
    'svg',
    // Documents
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    // Archives
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    // Audio/Video
    'mp3',
    'wav',
    'mp4',
    'mov',
    'avi',
    'mkv',
  ],
  lang: Locale = 'en',
): void => {
  if (!file) return;

  const fileName =
    (file as Express.Multer.File).originalname || (file as File).name;
  const extension = extname(fileName).replace('.', '').toLowerCase();

  if (!allowedTypes.includes(extension)) {
    throw new BadRequestException(
      `${getMessage('media_invalidFileType', lang)}. ${getMessage('general_allowedTypes', lang)}: ${allowedTypes.join(', ')}`,
    );
  }
};
