import { Connection } from 'mongoose';
import { RolePermissions } from '../../common/constants/roles-permissions.constant';

export default async function addPermissionsPerRole(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('users');

  let modifiedCount = 0;

  for (const [role, permissions] of Object.entries(RolePermissions)) {
    const result = await collection.updateMany(
      { role },
      {
        $set: {
          permissions,
        },
      },
    );

    modifiedCount += result.modifiedCount;
  }

  console.log(`✅ Permissions migration completed:
  - Updated permissions for ${modifiedCount} users`);
}
