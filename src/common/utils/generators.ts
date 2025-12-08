import { Model } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';

export const generateUsername = async (
  fName: string,
  lName: string,
  userModel: Model<UserDocument>,
): Promise<string> => {
  const baseUsername = `${fName.toLowerCase()}.${lName.toLowerCase()}`.replace(
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
