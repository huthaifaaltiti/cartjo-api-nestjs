import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  Put,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { LogoService } from './logo.service';

import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto, UpdateLogoParamsDto } from './dto/update-logo.dto';

@Controller('/api/v1/logo')
export class LogoController {
  constructor(private readonly logoService: LogoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createLogo(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateLogoDto,
  ) {
    const { user } = req;

    return this.logoService.create(user, body, image);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: UpdateLogoDto,
    @Param() param: UpdateLogoParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.logoService.update(user, body, image, id);
  }
}
