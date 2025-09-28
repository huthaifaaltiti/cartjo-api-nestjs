import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { GetCommentsQueryDto } from './dto/get-all.dto';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create.dto';
import {
  UpdateCommentParamsDto,
  UpdateCommentQueryDto,
} from './dto/update.dto';

@Controller(ApiPaths.Comment.Root)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Comment.All)
  async getAll(@Query() query: GetCommentsQueryDto, @Request() req: any) {
    const user = req?.user;

    return this.commentService.getAll(user, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Comment.One)
  async getOne(@Query() query: GetCommentsQueryDto, @Request() req: any) {
    const user = req?.user;

    return this.commentService.getAll(user, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Comment.Create)
  async create(@Request() req: any, @Body() body: CreateCommentDto) {
    const { user } = req;

    return this.commentService.create(user, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Comment.Update)
  async update(
    @Request() req: any,
    @Body() body: UpdateCommentQueryDto,
    @Param() param: UpdateCommentParamsDto,
  ) {
    const { user } = req;

    return this.commentService.update(user, body, param);
  }
}
