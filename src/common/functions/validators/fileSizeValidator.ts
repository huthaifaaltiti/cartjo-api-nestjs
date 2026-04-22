import { BadRequestException } from '@nestjs/common';
import { getMessage } from '../../utils/translator';
import { Locale } from '../../../types/Locale';

type FileType = Express.Multer.File | File;

export const fileSizeValidator = (
  file: FileType | undefined,
  maxFileSize: number,
  lang: Locale = 'en',
): void => {
  if (!file || maxFileSize === null) return;

  if (file.size > maxFileSize) {
    throw new BadRequestException(
      `${getMessage('media_fileSizeExceedsLimit', lang)} (${maxFileSize / (1024 * 1024)} MB).`,
    );
  }
};
