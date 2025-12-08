import { Model, Document } from 'mongoose';

export const deactivateExpiredDocs = async <T extends Document>(
  model: Model<T>,
): Promise<void> => {
  const now = new Date();

  const result = await model.updateMany(
    { isActive: true, endDate: { $lt: now } },
    { $set: { isActive: false } },
  );

  if (result.modifiedCount > 0) {
    console.log(`Deactivated ${result.modifiedCount} expired docs`);
  }
};
