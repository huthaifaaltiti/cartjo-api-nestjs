import { Connection } from 'mongoose';

/**
 * Adds the runtime-tunable `handleChangeCooldownDays` (creator store handle
 * rename cooldown) to existing `appconfigs` documents.
 */
export default async function addHandleChangeCooldownToAppConfig(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('appconfigs');

  const result = await collection.updateMany(
    { handleChangeCooldownDays: { $exists: false } },
    { $set: { handleChangeCooldownDays: 30 } },
  );

  console.log(`✅ handleChangeCooldownDays migration completed:
  - Updated ${result.modifiedCount} documents`);
}
