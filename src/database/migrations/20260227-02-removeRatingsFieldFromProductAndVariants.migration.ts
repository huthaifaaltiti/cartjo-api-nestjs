import { Connection } from 'mongoose';

export default async function removeRatingsFieldFromProductAndVariants(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('products');

  const result = await collection.updateMany({}, [
    {
      $set: {
        variants: {
          $map: {
            input: '$variants',
            as: 'v',
            in: {
              $unsetField: {
                field: 'ratings',
                input: '$$v',
              },
            },
          },
        },
      },
    },
    {
      $unset: ['ratings'],
    },
  ]);

  console.log(
    `✅ removeRatingsFieldFromProductAndVariants migration complete — modified ${result.modifiedCount} documents`,
  );
}
