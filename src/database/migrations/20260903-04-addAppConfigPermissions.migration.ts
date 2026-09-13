import { Connection } from 'mongoose';
import { RolePermissions } from '../../common/constants/roles-permissions.constant';

/**
 * App Config is now permission-gated (`app_config.read` / `app_config.update`)
 * instead of role-checked. Re-syncs every role's permission set onto both the
 * `users` and `rolepermissions` collections so existing admins keep access.
 */
export default async function addAppConfigPermissions(
  mongo: Connection,
): Promise<void> {
  const users = mongo.collection('users');
  const rolePermissions = mongo.collection('rolepermissions');

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

  console.log(`✅ App Config permissions migration completed:
  - Re-synced permissions for ${usersUpdated} users and ${
    Object.keys(RolePermissions).length
  } roles`);
}
