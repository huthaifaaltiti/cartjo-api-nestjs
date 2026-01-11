import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { getMessage } from 'src/common/utils/translator';
import { GetCommentsQueryDto } from './dto/get-all.dto';
import { CreateCommentDto } from './dto/create.dto';
import {
  UpdateCommentParamsDto,
  UpdateCommentQueryDto,
} from './dto/update.dto';
import { GetCommentParamDto, GetCommentQueryDto } from './dto/get-one.dto';
import { DeleteCommentBodyDto } from './dto/delete.dto';
import { UnDeleteCommentBodyDto } from './dto/un-delete.dto';
import { ALLOWED_AUTHENTICATED_ROLES } from 'src/common/constants/roles.constants';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getAll(query: GetCommentsQueryDto): Promise<DataListResponse<Comment>> {
    const { lang = 'en', limit = 10, lastId, search, productId } = query;

    const queryMatch: any = { productId, isDeleted: false };

    if (lastId) {
      queryMatch._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      queryMatch.content = { $regex: search, $options: 'i' };
    }

    const comments = await this.commentModel
      .find(queryMatch)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('userId', 'firstName lastName email role')
      .populate('productId', 'name')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('comment_commentsRetrievedSuccessfully', lang),
      dataCount: comments.length,
      data: comments,
    };
  }

  async getOne(
    query: GetCommentQueryDto,
    param: GetCommentParamDto,
  ): Promise<DataResponse<Comment>> {
    const { id } = param;
    const { lang } = query;

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(getMessage('comment_invalidCommentId', lang));
    }

    const comment = await this.commentModel
      .findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('productId', 'name')
      .lean();

    if (!comment) {
      throw new NotFoundException(getMessage('comment_commentNotFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('comment_commentRetrievedSuccessfully', lang),
      data: comment,
    };
  }

  async create(
    requestingUser: any,
    dto: CreateCommentDto,
  ): Promise<DataResponse<Comment>> {
    const { lang, productId, content, rating } = dto;

    // anyone can comment, required logged-in user only
    if (!requestingUser || !requestingUser.userId) {
      throw new UnauthorizedException(getMessage('comment_unAuthorized', lang));
    }

    if (!content || content.trim().length < 3) {
      return {
        isSuccess: false,
        message: getMessage('comment_contentTooShort', lang),
        data: null,
      };
    }

    const now = new Date();

    const comment = new this.commentModel({
      content,
      rating,
      productId,
      userId: requestingUser.userId,
      createdAt: now,
      createdBy: requestingUser.userId,
    });

    await comment.save();

    return {
      isSuccess: true,
      message: getMessage('comment_commentCreatedSuccessfully', lang),
      data: comment,
    };
  }

  async update(
    requestingUser: any,
    body: UpdateCommentQueryDto,
    param: UpdateCommentParamsDto,
  ): Promise<DataResponse<Comment>> {
    const { lang, content, rating } = body;
    const { id } = param;

    // anyone can comment, required logged-in user only
    if (!requestingUser || !requestingUser.userId) {
      throw new UnauthorizedException(getMessage('comment_unAuthorized', lang));
    }

    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException(getMessage('comment_commentNotFound', lang));
    }

    // Only the user who created the comment can update it
    if (comment.userId.toString() !== requestingUser.userId.toString()) {
      throw new ForbiddenException(
        getMessage('comment_cannotUpdateOthers', lang),
      );
    }

    if (content) comment.content = content;
    if (rating) comment.rating = rating;
    comment.updatedAt = new Date();
    comment.updatedBy = requestingUser?.userId;
    comment.isUpdated = true;

    await comment.save();

    return {
      isSuccess: true,
      message: getMessage('comment_commentUpdatedSuccessfully', lang),
      data: comment,
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteCommentBodyDto,
    id: Types.ObjectId,
  ): Promise<BaseResponse> {
    const { lang } = body;
    const { role } = requestingUser;

    if (!requestingUser || !requestingUser.userId) {
      throw new UnauthorizedException(getMessage('comment_unAuthorized', lang));
    }

    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException(getMessage('comment_commentNotFound', lang));
    }

    // Allow: comment owner OR admin
    const isOwner =
      comment.userId.toString() === requestingUser.userId.toString();
    const isAdmin = ALLOWED_AUTHENTICATED_ROLES.includes(role);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(getMessage('comment_cannotDelete', lang));
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = requestingUser.userId;
    await comment.save();

    return {
      isSuccess: true,
      message: getMessage('comment_commentDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteCommentBodyDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;
    const { role } = requestingUser;

    if (!requestingUser || !requestingUser.userId) {
      throw new UnauthorizedException(getMessage('comment_unAuthorized', lang));
    }

    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException(getMessage('comment_commentNotFound', lang));
    }

    // Allow: comment owner OR admin
    const isOwner =
      comment.userId.toString() === requestingUser.userId.toString();
    const isAdmin = ALLOWED_AUTHENTICATED_ROLES.includes(role);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(getMessage('comment_cannotUnDelete', lang));
    }

    comment.isDeleted = false;
    comment.deletedAt = null;
    comment.deletedBy = null;
    comment.unDeletedBy = requestingUser.userId;
    comment.unDeletedAt = new Date();

    await comment.save();

    return {
      isSuccess: true,
      message: getMessage('comment_commentUnDeletedSuccessfully', lang),
    };
  }
}
