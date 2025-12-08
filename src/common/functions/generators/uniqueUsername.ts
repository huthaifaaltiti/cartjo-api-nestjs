import { Model } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';

export const generateUsername = async (
  fN: string,
  lN: string,
  userModel: Model<UserDocument>,
): Promise<string> => {
  const baseUsername = `${fN.toLowerCase()}.${lN.toLowerCase()}`.replace(
    /\s+/g,
    '',
  );

  let username = baseUsername;
  let counter = 1;

  while (await userModel.findOne({ username })) {
    username = `${baseUsername}_${counter}`;
    counter++;
  }

  return username;
};

export const uniqueUsername = (fN: string, lN: string): string => {
  const baseUsername = `${fN}.${lN}`.toLowerCase().replace(/\s+/g, '');

  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number

  const uniqueUsername = `${baseUsername}${randomSuffix}`;

  return uniqueUsername;
};
