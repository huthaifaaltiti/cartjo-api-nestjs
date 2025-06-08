import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { getMessage } from 'src/common/utils/translator';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { UserRole } from 'src/enums/user-role.enum';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Locale } from 'src/types/Locale';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getUsers(params: {
    lang?: 'en' | 'ar';
    limit?: string;
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
      .limit(Number(limit))
      .select('-password')
      .lean(); // optional: return plain JS objects

    return {
      isSuccess: true,
      message: getMessage('user_usersRetrievedSuccessfully', lang),
      users,
    };
  }

  async getUsersStats(lang?: 'en' | 'ar'): Promise<{
    isSuccess: boolean;
    message: string;
    stats: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      deletedUsers: number;
      verifiedUsers: number;
      unverifiedUsers: number;
      admins: number;
      normalUsers: number;
      owners: number;
    };
  }> {
    const [
      totalUsers,
      activeUsers,
      deletedUsers,
      verifiedUsers,
      admins,
      owners,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true, isDeleted: false }),
      this.userModel.countDocuments({ isDeleted: true }),
      this.userModel.countDocuments({ isPhoneVerified: true }),
      this.userModel.countDocuments({ role: UserRole.ADMINISTRATOR }),
      this.userModel.countDocuments({ role: UserRole.OWNER }),
    ]);

    const inactiveUsers = await this.userModel.countDocuments({
      isActive: false,
      isDeleted: false,
    });
    const unverifiedUsers = totalUsers - verifiedUsers;
    const normalUsers = totalUsers - admins;

    return {
      isSuccess: true,
      message: getMessage('user_usersStatsRetrievedSuccessfully', lang),
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        deletedUsers,
        verifiedUsers,
        unverifiedUsers,
        admins,
        normalUsers,
        owners,
      },
    };
  }

  async softDeleteUser(
    id: string,
    lang: 'en' | 'ar' = 'en',
    requestingUser: any,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    const user = await this.userModel.findById(id);

    if (!user || user.isDeleted) {
      throw new NotFoundException(getMessage('user_userNotFound', lang));
    }

    if (user.role === UserRole.OWNER) {
      return {
        isSuccess: false,
        message: getMessage('user_cannotDeleteOwner', lang),
      };
    }

    user.isDeleted = true;
    user.isActive = false;
    user.deletedAt = new Date();

    await user.save();

    return {
      isSuccess: true,
      message: getMessage('user_userDeletedSuccessfully', lang),
    };
  }

  async updateUserStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    const user = await this.userModel.findById(id);

    if (!user || user.isDeleted) {
      throw new NotFoundException(getMessage('user_userNotFound', lang));
    }

    user.isActive = isActive;

    await user.save();

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'user_userActivatedSuccessfully'
          : 'user_userDeactivatedSuccessfully',
        lang,
      ),
    };
  }
}
