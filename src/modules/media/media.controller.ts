import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Request,
  Get,
  Param,
  Res,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { MediaService } from './media.service';
import { UploadFileBodyDto } from './dto/upload-file.dto';
import { Modules } from 'src/enums/appModules.enum';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
<<<<<<< HEAD
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
import { ApiPaths } from 'src/common/constants/api-paths';
=======
import { ApiPaths } from 'src/common/constants/api-paths';
import { fileTypeValidator } from 'src/common/functions/validators/fileTypeValidator';
import { MEDIA_CONFIG } from 'src/configs/media.config';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Controller(ApiPaths.Media.Root)
export class MediaController {
  constructor(private readonly fileUploadService: MediaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Media.Upload)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileBodyDto,
  ) {
    const { lang } = body;
    const { user } = req;

<<<<<<< HEAD
    fileSizeValidator(file, MAX_FILE_SIZES.GENERAL_MEDIA_FILE, lang);
=======
    fileSizeValidator(file, MEDIA_CONFIG.OTHERS.ANY.MAX_SIZE, lang);
    fileTypeValidator(file, MEDIA_CONFIG.OTHERS.ANY.ALLOWED_TYPES, lang);
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

    return this.fileUploadService.handleFileUpload(
      file,
      user,
      lang,
      Modules.MEDIA,
      req,
    );
  }

  @Get(ApiPaths.Media.GetOne)
  async serveFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const { stream, metadata } =
        await this.fileUploadService.getFileById(fileId);

      if (!stream || !metadata) {
        throw new NotFoundException('File not found');
      }

      res.set({
        'Content-Type': metadata.metadata.contentType,
        'Content-Disposition': `inline; filename="${metadata.metadata.originalName}"`,
        'Content-Length': metadata.length.toString(),
      });

      return stream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      throw new InternalServerErrorException('Failed to serve file');
    }
  }
}
