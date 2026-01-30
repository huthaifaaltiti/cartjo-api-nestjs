import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from 'src/schemas/refresh-token.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly model: Model<RefreshToken>,
  ) {}

  async create(data: { userId: any; tokenHash: string; expiresAt: Date }) {
    return this.model.create(data);
  }

  async findValid(tokenHash: string): Promise<RefreshTokenDocument | null>  {
    return this.model
      .findOne({
        tokenHash,
        revoked: false,
        expiresAt: { $gt: new Date() },
      })
      .populate<{ userId: User }>('userId')
  }

  async delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteByHash(tokenHash: string) {
    return this.model.findOneAndDelete({ tokenHash });
  }

  async revokeAllForUser(userId: string) {
    return this.model.updateMany({ userId }, { revoked: true });
  }
}
