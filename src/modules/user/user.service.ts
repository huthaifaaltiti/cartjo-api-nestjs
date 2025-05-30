import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { getMessage } from 'src/common/utils/translator';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getUsers(params: {
    lang?: 'en' | 'ar';
    limit?: number;
    lastId?: string; // the _id of the last fetched user
    search?: string;
  }): Promise<{
    isSuccess: boolean;
    message: string;
    users: User[];
  }> {
    const { lang = 'en', limit = 10, lastId, search } = params;

    const query: any = {};

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive regex

      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await this.userModel
      .find(query)
      .sort({ _id: -1 }) // newest first
      .limit(limit)
      .lean(); // optional: return plain JS objects

    return {
      isSuccess: true,
      message: getMessage('user_locationRetrievedSuccessfully', lang),
      users,
    };
  }
}
