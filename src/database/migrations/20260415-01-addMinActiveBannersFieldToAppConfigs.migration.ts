import { Connection } from 'mongoose';

export default async function addMinActiveBannersToAppConfig(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('appconfigs');

  const result = await collection.updateMany(
    { minActiveBanners: { $exists: false } },
    { $set: { minActiveBanners: 1 } },
  );

  console.log(`✅ minActiveBanners migration completed:
  - Updated ${result.modifiedCount} documents`);
}
