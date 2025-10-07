import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoError } from 'mongodb';

import { getMessage } from 'src/common/utils/translator';
import { validateSameUserAccess } from 'src/common/utils/validateSameUserAccess';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { RolePermissions } from 'src/common/constants/roles-permissions.constant';
import { generateUsername } from 'src/common/functions/generators/uniqueUsername';
import { checkUserRole } from 'src/common/utils/checkUserRole';
import { validateSameUsersRoleLevel } from 'src/common/utils/validateSameUsersRoleLevel';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';

import { UserRole } from 'src/enums/user-role.enum';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Locale } from 'src/types/Locale';
import { CreateAdminBodyDto } from './dto/create-admin.dto';

import { JwtService } from '../jwt/jwt.service';
import { MediaService } from '../media/media.service';
import { Modules } from 'src/enums/appModules.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mediaService: MediaService,
  ) {}

  async getUsers(params: {
    lang?: 'en' | 'ar';
    limit?: string;
    lastId?: string; // the _id of the last fetched user
    search?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    canManage?: boolean;
  }): Promise<{
    isSuccess: boolean;
    message: string;
    usersNum: number;
    users: User[];
  }> {
    const {
      lang = 'en',
      limit = 10,
      lastId,
      search,
      isActive,
      isDeleted,
      canManage,
    } = params;

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

    if (typeof isActive === 'boolean') query.isActive = isActive;
    if (typeof isDeleted === 'boolean') query.isDeleted = isDeleted;
    if (typeof canManage === 'boolean') query.role = UserRole.ADMINISTRATOR;

    // if (typeof isDeleted === 'boolean') {
    //   query.isDeleted = isDeleted;
    // }

    // if (role) {
    //   query.role = role;
    // }

    const users = await this.userModel
      .find(query)
      .sort({ _id: -1 }) // newest first
      .limit(Number(limit))
      .select('-password')
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean(); // optional: return plain JS objects

    return {
      isSuccess: true,
      message: getMessage('user_usersRetrievedSuccessfully', lang),
      usersNum: users?.length,
      users,
    };
  }

  async getUserData(
    id: string,
    requestingUser: any,
    lang?: Locale,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    data: User | null;
  }> {
    validateSameUserAccess(
      requestingUser?.userId?.toString(),
      id?.toString(),
      lang,
    );

    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('user_userRetrievedSuccessfully', lang),
      data: user,
    };
  }

  async getUserByAdmin(
    id: string,
    requestingUser: any,
    lang?: Locale,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    data: User | null;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('user_userRetrievedSuccessfully', lang),
      data: user,
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

    validateSameUsersRoleLevel(user?.role, requestingUser?.role, lang);

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
    user.deletedBy = requestingUser.userId;
    user.unDeletedBy = null;

    await user.save();

    return {
      isSuccess: true,
      message: getMessage('user_userDeletedSuccessfully', lang),
    };
  }

  async softUnDeleteUser(
    id: string,
    lang: 'en' | 'ar' = 'en',
    requestingUser: any,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    const user = await this.userModel.findById(id);

    validateSameUsersRoleLevel(user?.role, requestingUser?.role, lang);

    if (!user) {
      throw new NotFoundException(getMessage('user_userNotFound', lang));
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.unDeletedBy = requestingUser.userId;
    user.deletedBy = null;

    await user.save();

    return {
      isSuccess: true,
      message: getMessage('user_userUnDeletedSuccessfully', lang),
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

    validateSameUsersRoleLevel(user?.role, requestingUser?.role, lang);

    if (!user) {
      throw new NotFoundException(getMessage('user_userNotFound', lang));
    }

    if (isActive) {
      user.isDeleted = false;
      user.deletedAt = null;
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

  async createAdminUser(
    body: CreateAdminBodyDto,
    requestingUser: any,
    profilePic: Express.Multer.File,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    user?: User;
    token?: string;
  }> {
    const {
      termsAccepted,
      lang,
      email,
      firstName,
      lastName,
      marketingEmails,
      password,
      phoneNumber,
      countryCode,
    } = body;

    if (
      !checkUserRole({
        userRole: requestingUser?.role,
        requiredRole: UserRole.OWNER,
      })
    ) {
      return {
        isSuccess: false,
        message: getMessage('users_OnlyOwnersCanCreateAdmins', lang),
      };
    }

    let profilePicUrl: string | undefined = undefined;

    if (profilePic && Object.keys(profilePic).length > 0) {
      fileSizeValidator(profilePic, MAX_FILE_SIZES.USER_PROFILE_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        profilePic,
        { userId: process.env.DB_SYSTEM_OBJ_ID }, // fake user since user is not registered yet
        lang,
        Modules.USER,
      );

      if (result?.isSuccess) {
        profilePicUrl = result.fileUrl;
      }
    }

    if (typeof termsAccepted === 'string' && termsAccepted === 'false') {
      throw new BadRequestException(
        getMessage('authentication_termsAndConditionsRequired', lang),
        {
          cause: new Error(),
          description: 'Validation error',
        },
      );
    }

    const existingUserWithEmail = await this.userModel.findOne({ email });
    const existingUserWithPhoneNumber = await this.userModel.findOne({
      phoneNumber,
    });

    if (existingUserWithEmail) {
      throw new BadRequestException(
        getMessage('authentication_emailAlreadyInUse', lang),
        {
          cause: new Error(),
          description: 'Validation error',
        },
      );
    }

    if (existingUserWithPhoneNumber) {
      throw new BadRequestException(
        getMessage('authentication_phoneNumberAlreadyInUse', lang),
        {
          cause: new Error(),
          description: 'Validation error',
        },
      );
    }

    try {
      const defaultRole = UserRole.ADMINISTRATOR;
      const permissions = RolePermissions[defaultRole];

      const username =
        (await generateUsername(firstName, lastName, this.userModel)) ||
        `${firstName}.${lastName}_${Date.now()}`;

      const newUserData = {
        firstName,
        lastName,
        email,
        termsAccepted: termsAccepted === 'true',
        marketingEmails: marketingEmails === 'true',
        username,
        password,
        countryCode,
        phoneNumber,
        createdBy: requestingUser?.userId || process.env.DB_SYSTEM_OBJ_ID,
        role: defaultRole,
        permissions,
        profilePic: profilePicUrl,
      };

      const user = await this.userModel.create({ ...newUserData });

      const token = this.jwtService.generateToken(
        user?._id?.toString(),
        user.firstName,
        user.lastName,
        user.phoneNumber,
        user.email,
        user.username,
        user.role,
        user.permissions,
        user.countryCode,
        user.createdBy?.toString?.() || 'System',
      );

      return {
        isSuccess: true,
        message: getMessage('users_adminUserCreatedSuccessfully', lang),
        user,
        token,
      };
    } catch (err) {
      if (err instanceof MongoError && err.code === 11000) {
        throw new BadRequestException(
          getMessage('users_userAlreadyExists', lang),
        );
      }

      throw new InternalServerErrorException(
        getMessage('users_errWhileCreatingUser', lang),
      );
    }
  }

  async updateAdminUser(
    userId: string,
    body: Partial<CreateAdminBodyDto>,
    requestingUser: any,
    profilePic?: Express.Multer.File,
  ): Promise<{ isSuccess: boolean; message: string; user?: User }> {
    const {
      termsAccepted,
      lang,
      email,
      firstName,
      lastName,
      marketingEmails,
      password,
      phoneNumber,
      countryCode,
    } = body;

    if (
      !checkUserRole({
        userRole: requestingUser?.role,
        requiredRole: UserRole.OWNER,
      })
    ) {
      return {
        isSuccess: false,
        message: getMessage('users_OnlyOwnersCanUpdateAdmins', lang),
      };
    }

    const user = await this.userModel.findById(userId);

    validateSameUsersRoleLevel(user?.role, requestingUser?.role, lang);

    if (!user) {
      throw new BadRequestException(getMessage('users_userNotFound', lang));
    }

    if (user.role !== UserRole.ADMINISTRATOR) {
      return {
        isSuccess: false,
        message: getMessage('users_cantEditUserDetails', lang),
      };
    }

    if (email && email !== user.email) {
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestException(
          getMessage('authentication_emailAlreadyInUse', lang),
        );
      }
      user.email = email;
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhoneUser = await this.userModel.findOne({ phoneNumber });
      if (existingPhoneUser) {
        throw new BadRequestException(
          getMessage('authentication_phoneNumberAlreadyInUse', lang),
        );
      }
      user.phoneNumber = phoneNumber;
    }

    if (profilePic && Object.keys(profilePic).length > 0) {
      fileSizeValidator(profilePic, MAX_FILE_SIZES.USER_PROFILE_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        profilePic,
        { userId: requestingUser?.userId },
        lang,
        Modules.USER,
      );
      if (result?.isSuccess) {
        user.profilePic = result.fileUrl;
      }
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (countryCode) user.countryCode = countryCode;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    if (password) user.password = password;
    if (marketingEmails !== undefined)
      user.marketingEmails = Boolean(marketingEmails);

    await user.save();

    return {
      isSuccess: true,
      message: getMessage('users_adminUserUpdatedSuccessfully', lang),
      user,
    };
  }
}
