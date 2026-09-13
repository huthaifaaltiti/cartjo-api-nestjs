import { Connection } from 'mongoose';
import { RolePermissions } from '../../common/constants/roles-permissions.constant';

/**
 * Creator Store feature bootstrap:
 *  1. Re-syncs every role's permission set (adds the new `creator_store*` /
 *     `creator_stores*` permissions) on both the `users` and `rolepermissions`
 *     collections.
 *  2. Back-fills `storeId` / `ownerId` on existing products so the new
 *     ownership fields are queryable (null => first-party CartJO product).
 */
export default async function addCreatorStoreSupport(
  mongo: Connection,
): Promise<void> {
  const users = mongo.collection('users');
  const rolePermissions = mongo.collection('rolepermissions');
  const products = mongo.collection('products');

  let usersUpdated = 0;

  for (const [role, permissions] of Object.entries(RolePermissions)) {
    const usersResult = await users.updateMany(
      { role },
      { $set: { permissions } },
    );
    usersUpdated += usersResult.modifiedCount;

    await rolePermissions.updateOne(
      { role },
      { $set: { permissions }, $setOnInsert: { role } },
      { upsert: true },
    );
  }

  const productsResult = await products.updateMany(
    { $or: [{ storeId: { $exists: false } }, { ownerId: { $exists: false } }] },
    { $set: { storeId: null, ownerId: null } },
  );

  console.log(`✅ Creator Store support migration completed:
  - Re-synced permissions for ${usersUpdated} users and ${Object.keys(RolePermissions).length} roles
  - Back-filled ownership fields on ${productsResult.modifiedCount} products`);
}
