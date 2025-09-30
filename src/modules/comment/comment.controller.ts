import {
  Body,
  Controller,
  Delete,
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
import { GetCommentParamDto, GetCommentQueryDto } from './dto/get-one.dto';
import { DeleteCommentBodyDto, DeleteCommentParamsDto } from './dto/delete.dto';
import {
  UnDeleteCommentBodyDto,
  UnDeleteCommentParamsDto,
} from './dto/un-delete.dto';
import { OptionalJwtAuthGuard } from 'src/common/utils/optionalJwtAuthGuard';

@Controller(ApiPaths.Comment.Root)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Comment.All)
  async getAll(@Query() query: GetCommentsQueryDto) {
    return this.commentService.getAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Comment.One)
  async getOne(
    @Query() query: GetCommentQueryDto,
    @Param() param: GetCommentParamDto,
  ) {
    return this.commentService.getOne(query, param);
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

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Comment.Delete)
  async delete(
    @Request() req: any,
    @Body() body: DeleteCommentBodyDto,
    @Param() param: DeleteCommentParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.commentService.delete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Comment.UnDelete)
  async unDelete(
    @Request() req: any,
    @Body() body: UnDeleteCommentBodyDto,
    @Param() param: UnDeleteCommentParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.commentService.unDelete(user, body, id);
  }
}
