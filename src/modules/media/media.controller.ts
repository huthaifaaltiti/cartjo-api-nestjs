import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { MediaService } from './media.service';
import { UploadFileBodyDto } from './dto/upload-file.dto';
import { Modules } from 'src/enums/appModules.enum';

@Controller('api/v1/media')
export class MediaController {
  constructor(private readonly fileUploadService: MediaService) {}

  // ✔️ Route access: 🔒 Private route
  // ✔️ Endpoint desc: 👤 Upload media for authorized users
  // ✔️ Endpoint: 🔗 POST /api/v1/media/upload
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileBodyDto,
  ) {
    const { lang } = body;
    const { user } = req;

    return this.fileUploadService.handleFileUpload(
      file,
      user,
      lang,
      Modules.MEDIA,
    );
  }
}
