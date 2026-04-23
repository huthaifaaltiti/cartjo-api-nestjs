import { Connection } from 'mongoose';

export default async function addIsExpiredToTypeHintConfigs(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('typehintconfigs');

  const now = new Date();

  const initResult = await collection.updateMany(
    { isExpired: { $exists: false } },
    { $set: { isExpired: false } },
  );

  // 2. Mark already expired banners
  const expiredResult = await collection.updateMany(
    {
      isDeleted: false,
      endDate: { $ne: null, $lt: now },
    },
    {
      $set: {
        isExpired: true,
        isActive: false, // keep data consistent
      },
    },
  );

  // 3. Ensure non-expired banners are correctly marked
  const activeResult = await collection.updateMany(
    {
      isDeleted: false,
      $or: [
        { endDate: null },
        { endDate: { $gte: now } },
        { endDate: { $exists: false } },
      ],
    },
    {
      $set: {
        isExpired: false,
      },
    },
  );

  console.log(
    `✅ isExpired migration completed:
     - Initialized field for ${initResult.modifiedCount} typeHintConfigs
     - Marked ${expiredResult.modifiedCount} as expired
     - Fixed ${activeResult.modifiedCount} as active/non-expired`,
  );
}
