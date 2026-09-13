import { Connection } from 'mongoose';

/**
 * Creator Store handle-change support:
 *  - back-fills `handleChangedAt` / `handleChangeCount` / `previousHandles` on
 *    existing stores so the cooldown logic and admin sorting have real values;
 *  - rebuilds the `handle` index as a sparse unique index (a store may briefly
 *    exist without a handle now).
 */
export default async function addStoreHandleHistory(
  mongo: Connection,
): Promise<void> {
  const stores = mongo.collection('creator_stores');

  const result = await stores.updateMany(
    {
      $or: [
        { handleChangedAt: { $exists: false } },
        { handleChangeCount: { $exists: false } },
        { previousHandles: { $exists: false } },
      ],
    },
    {
      $set: {
        handleChangedAt: null,
        handleChangeCount: 0,
        previousHandles: [],
      },
    },
  );

  // Swap the old plain unique index for a sparse one.
  try {
    await stores.dropIndex('handle_1');
  } catch {
    // Index name may differ or not exist yet — the create below is the source of truth.
  }
  await stores.createIndex({ handle: 1 }, { unique: true, sparse: true });

  console.log(`✅ Store handle-history migration completed:
  - Back-filled handle history fields on ${result.modifiedCount} stores
  - Ensured sparse unique index on creator_stores.handle`);
}
