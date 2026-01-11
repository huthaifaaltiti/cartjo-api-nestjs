import { BadRequestException } from '@nestjs/common';
<<<<<<< HEAD

=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { Locale } from 'src/types/Locale';
import { getMessage } from 'src/common/utils/translator';

type FileType = Express.Multer.File | File;

export const fileSizeValidator = (
  file: FileType | undefined,
  maxFileSize: number,
  lang: Locale = 'en',
): void => {
<<<<<<< HEAD
  if (!file) return;

  const { size } = file;

  if (size > maxFileSize) {
=======
  if (!file || maxFileSize === null) return;

  if (file.size > maxFileSize) {
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    throw new BadRequestException(
      `${getMessage('media_fileSizeExceedsLimit', lang)} (${maxFileSize / (1024 * 1024)} MB).`,
    );
  }
};
