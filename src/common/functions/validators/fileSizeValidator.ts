import { BadRequestException } from '@nestjs/common';
import { Locale } from 'src/types/Locale';
import { getMessage } from 'src/common/utils/translator';

type FileType = Express.Multer.File | File;

export const fileSizeValidator = (
  file: FileType | undefined,
  maxFileSize: number,
  lang: Locale = 'en',
): void => {
  if (!file || maxFileSize === Infinity) return;

  if (file.size > maxFileSize) {
    throw new BadRequestException(
      `${getMessage('media_fileSizeExceedsLimit', lang)} (${maxFileSize / (1024 * 1024)} MB).`,
    );
  }
};
