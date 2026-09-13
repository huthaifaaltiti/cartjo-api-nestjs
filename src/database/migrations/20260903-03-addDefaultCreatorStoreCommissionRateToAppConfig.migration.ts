import { Connection } from 'mongoose';

/**
 * Adds the runtime-tunable `defaultCreatorStoreCommissionRate` (platform
 * commission % applied to a creator store on creation) to existing
 * `appconfigs` documents.
 */
export default async function addDefaultCreatorStoreCommissionRateToAppConfig(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('appconfigs');

  const result = await collection.updateMany(
    { defaultCreatorStoreCommissionRate: { $exists: false } },
    { $set: { defaultCreatorStoreCommissionRate: 10 } },
  );

  console.log(`✅ defaultCreatorStoreCommissionRate migration completed:
  - Updated ${result.modifiedCount} documents`);
}
