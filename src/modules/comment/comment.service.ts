import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
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
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Locale } from 'src/types/Locale';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
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

  async productAnfVariantValidators({
    productId,
    variantId,
    lang,
  }: {
    productId: mongoose.Types.ObjectId;
    variantId: string;
    lang: Locale;
  }) {
    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new BadRequestException(
        getMessage('products_productNotFound', lang),
      );
    }

    const variantExists = product.variants.some(v => v.variantId === variantId);

    if (!variantExists) {
      throw new BadRequestException(
        getMessage('products_variantNotFound', lang),
      );
    }

    return { product };
  }

  private async calculateRatingsCount(
    productId: mongoose.Types.ObjectId,
  ): Promise<number> {
    return await this.commentModel.countDocuments({
      productId,
      rating: { $ne: null },
      isDeleted: false,
    });
  }

  private async calculateNewAverage(
    productId: mongoose.Types.ObjectId,
  ): Promise<number> {
    const result = await this.commentModel.aggregate([
      {
        $match: {
          productId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    return result[0]?.avgRating ?? 1; // default to 1 if no ratings
  }

  private async recalculateProductAndVariantRatings(
    product: ProductDocument,
    comment: CommentDocument,
    action: 'create' | 'delete' | 'unDelete' | 'update',
  ) {
    const productId = product._id as Types.ObjectId;

    const variant = product.variants.find(
      v => v.variantId === comment.variantId,
    );

    if (variant) {
      const variantComments = await this.commentModel.find({
        productId,
        variantId: comment.variantId,
        isDeleted: false,
      });

      const total = variantComments.reduce(
        (sum, c) => sum + (c.rating ?? 0),
        0,
      );

      const count = variantComments.length;

      variant.ratingsCount = count;

      if (count > 0) {
        const avg = total / count;
        variant.ratingsAverage = Math.min(Math.max(avg, 1), 5);
      } else {
        variant.ratingsAverage = 1; // default to 1 if no ratings
      }
    }

    let comments: Types.ObjectId[] = (product.comments as any) || [];
    const commentId = comment._id as Types.ObjectId;

    if (action === 'create' || action === 'unDelete') {
      if (!comments.some(id => id.toString() === commentId.toString())) {
        comments = [...comments, commentId];
      }
    }

    if (action === 'delete') {
      comments = comments.filter(id => id.toString() !== commentId.toString());
    }

    await this.productModel.findByIdAndUpdate(
      productId,
      {
        $set: {
          comments,
          variants: [...product.variants],
          ratingsAverage: await this.calculateNewAverage(productId),
          ratingsCount: await this.calculateRatingsCount(productId),
        },
      },
      { new: true },
    );
  }

  async create(
    requestingUser: any,
    dto: CreateCommentDto,
  ): Promise<DataResponse<Comment>> {
    const { lang, productId, variantId, content, rating } = dto;

    if (!requestingUser || !requestingUser.userId) {
      throw new UnauthorizedException(getMessage('comment_unAuthorized', lang));
    }

    const { product } = await this.productAnfVariantValidators({
      productId,
      variantId,
      lang,
    });

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
      productId: new Types.ObjectId(productId),
      variantId,
      userId: requestingUser.userId,
      createdAt: now,
      createdBy: requestingUser.userId,
    });

    await comment.save();

    await this.recalculateProductAndVariantRatings(product, comment, 'create');

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
    const { lang, productId, variantId, content, rating } = body;
    const { id } = param;

    // Ensure logged-in user
    if (!requestingUser?.userId) {
      throw new UnauthorizedException(getMessage('comment_unAuthorized', lang));
    }

    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(getMessage('comment_commentNotFound', lang));
    }

    // Validate product and variant
    const targetProductId = productId || comment.productId.toString();
    const targetVariantId = variantId || comment.variantId;

    const { product } = await this.productAnfVariantValidators({
      productId: new Types.ObjectId(targetProductId),
      variantId: targetVariantId,
      lang,
    });

    // Only owner can update
    if (comment.userId.toString() !== requestingUser.userId.toString()) {
      throw new ForbiddenException(
        getMessage('comment_cannotUpdateOthers', lang),
      );
    }

    // Update fields
    if (content) comment.content = content;
    if (rating) comment.rating = rating;
    comment.updatedAt = new Date();
    comment.updatedBy = requestingUser.userId;
    comment.isUpdated = true;

    await comment.save();

    await this.recalculateProductAndVariantRatings(product, comment, 'update');

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

    const product = await this.productModel.findById(comment.productId);

    if (product) {
      await this.recalculateProductAndVariantRatings(
        product,
        comment,
        'delete',
      );
    }

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

    const product = await this.productModel.findById(comment.productId);

    if (product) {
      await this.recalculateProductAndVariantRatings(
        product,
        comment,
        'unDelete',
      );
    }

    return {
      isSuccess: true,
      message: getMessage('comment_commentUnDeletedSuccessfully', lang),
    };
  }
}
