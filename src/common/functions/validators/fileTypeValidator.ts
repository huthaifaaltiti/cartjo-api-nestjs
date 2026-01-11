import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
<<<<<<< HEAD

=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
<<<<<<< HEAD
=======
    'xlsm',
    'xlsb',
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
<<<<<<< HEAD
  if (!file) return;

  const fileName =
    (file as Express.Multer.File).originalname || (file as File).name;
=======
  if (!file || allowedTypes.includes('*')) return;

  const fileName =
    (file as Express.Multer.File).originalname || (file as File).name;

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  const extension = extname(fileName).replace('.', '').toLowerCase();

  if (!allowedTypes.includes(extension)) {
    throw new BadRequestException(
      `${getMessage('media_invalidFileType', lang)}. ${getMessage('general_allowedTypes', lang)}: ${allowedTypes.join(', ')}`,
    );
  }
};
