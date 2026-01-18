import { Connection } from 'mongoose';

const addSoftDeleteFieldsToMedia = async (mongo: Connection) => {
  const Media = mongo.collection('metadata');

  console.log({Media})

  // Find media docs missing soft-delete fields
  const cursor = Media.find({
    $or: [
      { isDeleted: { $exists: false } },
      { deletedAt: { $exists: false } },
      { deactivatedAt: { $exists: false } },
    ],
  });

  let updatedCount = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    const updateData: any = {};

    if (doc.isDeleted === undefined) {
      updateData.isDeleted = false;
    }

    if (doc.deletedAt === undefined) {
      updateData.deletedAt = null;
    }

    if (doc.deactivatedAt === undefined) {
      updateData.deactivatedAt = null;
    }

    // Defensive: ensure isActive exists
    if (doc.isActive === undefined) {
      updateData.isActive = true;
    }

    if (Object.keys(updateData).length > 0) {
      await Media.updateOne(
        { _id: doc._id },
        { $set: updateData },
      );
      updatedCount++;
    }
  }

  console.log(`🟢 Updated ${updatedCount} media documents with soft-delete fields`);
};

export default async function migrateMediaSoftDelete(mongo: Connection) {
  console.log('🔄 Migrating media soft-delete fields...');
  await addSoftDeleteFieldsToMedia(mongo);
  console.log('✅ Media soft-delete migration completed successfully.');
}
