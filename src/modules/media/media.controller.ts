import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Request,
  // Get,
  // Param,
  // Res,
  // NotFoundException,
  // InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
// import { Response } from 'express';
import { MediaService } from './media.service';
import { UploadFileBodyDto } from './dto/upload-file.dto';
import { Modules } from 'src/enums/appModules.enum';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { ApiPaths } from 'src/common/constants/api-paths';
import { fileTypeValidator } from 'src/common/functions/validators/fileTypeValidator';
import { MEDIA_CONFIG } from 'src/configs/media.config';

@Controller(ApiPaths.Media.Root)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

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

    fileSizeValidator(file, MEDIA_CONFIG.OTHERS.ANY.MAX_SIZE, lang);
    fileTypeValidator(file, MEDIA_CONFIG.OTHERS.ANY.ALLOWED_TYPES, lang);
    
    return this.mediaService.handleFileUpload(
      file,
      user,
      lang,
      Modules.MEDIA,
      req,
    );
  }

  // @Get(ApiPaths.Media.GetOne)
  // async serveFile(@Param('fileId') fileId: string, @Res() res: Response) {
  //   try {
  //     const { stream, metadata } =
  //       await this.mediaService.getFileById(fileId);

  //     if (!stream || !metadata) {
  //       throw new NotFoundException('File not found');
  //     }

  //     res.set({
  //       'Content-Type': metadata.metadata.contentType,
  //       'Content-Disposition': `inline; filename="${metadata.metadata.originalName}"`,
  //       'Content-Length': metadata.length.toString(),
  //     });

  //     return stream.pipe(res);
  //   } catch (error) {
  //     console.error('Error serving file:', error);
  //     throw new InternalServerErrorException('Failed to serve file');
  //   }
  // }
}
