import { Connection } from 'mongoose';
import { ActionActorType } from '../../schemas/history.schema';

export default async function addActorTypeToHistories(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('histories');

  // Records with a user ref → USER, otherwise → SYSTEM
  const userResult = await collection.updateMany(
    { actorType: { $exists: false }, user: { $ne: null } },
    { $set: { actorType: ActionActorType.USER } },
  );

  const systemResult = await collection.updateMany(
    { actorType: { $exists: false }, user: null },
    { $set: { actorType: ActionActorType.SYSTEM } },
  );

  console.log(
    `✅ actorType migration completed:
     - Marked ${userResult.modifiedCount} records as USER
     - Marked ${systemResult.modifiedCount} records as SYSTEM`,
  );
}