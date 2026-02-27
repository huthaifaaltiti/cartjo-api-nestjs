import { Connection } from 'mongoose';

export default async function addRatingsToProductsAndVariants(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('products');

  const result = await collection.updateMany({}, [
    {
      $set: {
        // ✅ Product-level ratings
        ratingsAverage: {
          $ifNull: ['$ratingsAverage', 1],
        },
        ratingsCount: {
          $ifNull: ['$ratingsCount', 0],
        },

        // ✅ Variant-level ratings
        variants: {
          $map: {
            input: '$variants',
            as: 'v',
            in: {
              $mergeObjects: [
                '$$v',
                {
                  ratingsAverage: {
                    $ifNull: ['$$v.ratingsAverage', 1],
                  },
                  ratingsCount: {
                    $ifNull: ['$$v.ratingsCount', 0],
                  },
                  
                },
              ],
            },
          },
        },
      },
    },
  ]);

  console.log(
    `✅ addRatingsToProductsAndVariants migration complete — modified ${result.modifiedCount} documents`,
  );
}
