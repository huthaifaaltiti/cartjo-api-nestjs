import { Connection } from 'mongoose';

export default async function updateAuthProviderForUsers(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('users');

  const result = await collection.updateMany(
    { authProvider: { $exists: false } },
    { $set: { authProvider: 'local' } },
  );

  console.log(
    `✅ authProvider migration complete — modified ${result.modifiedCount} users`,
  );
}
