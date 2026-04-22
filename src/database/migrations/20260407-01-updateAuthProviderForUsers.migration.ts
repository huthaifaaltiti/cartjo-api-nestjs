import { Connection } from 'mongoose';
import { VerificationChannelType } from '../../enums/VerificationChannelType.enum';

export default async function updateAuthProviderForUsers(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('users');

  // 1. Update 'local' or missing providers to the EMAIL enum value
  const providerResult = await collection.updateMany(
    {
      $or: [{ authProvider: 'local' }, { authProvider: { $exists: false } }],
    },
    { $set: { authProvider: VerificationChannelType.EMAIL } },
  );

  // 2. Backfill verificationChannels for existing users who don't have it
  // This ensures data integrity between authProvider and the new history array
  const channelResult = await collection.updateMany(
    {
      $or: [
        { verificationChannels: { $exists: false } },
        { verificationChannels: { $size: 0 } },
      ],
    },
    [
      {
        $set: {
          verificationChannels: [
            {
              channel: '$authProvider',
              verifiedAt: '$createdAt', // Use account creation date as verification date
              externalId: null,
            },
          ],
        },
      },
    ],
  );

  console.log(
    `✅ Migration complete: 
     - Updated authProvider for ${providerResult.modifiedCount} users.
     - Initialized verificationChannels for ${channelResult.modifiedCount} users.`,
  );
}
