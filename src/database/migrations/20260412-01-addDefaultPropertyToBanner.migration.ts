import { Connection } from 'mongoose';

export default async function addIsDefaultToBanners(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('banners');

  const initResult = await collection.updateMany(
    { isDefault: { $exists: false } },
    { $set: { isDefault: false } },
  );

  console.log(
    `✅ isDefault migration completed:
     - Initialized isDefault for ${initResult.modifiedCount} banners`,
  );
}