import { Connection } from 'mongoose';

export default async function addPriceAfterDiscountFieldForVariants(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('products');

  const result = await collection.updateMany(
    {}, // ✅ update all products safely
    [
      {
        $set: {
          variants: {
            $map: {
              input: '$variants',
              as: 'v',
              in: {
                $mergeObjects: [
                  '$$v',
                  {
                    priceAfterDiscount: {
                      $cond: [
                        // ✅ if already exists and > 0 → keep it
                        {
                          $and: [
                            { $ne: ['$$v.priceAfterDiscount', null] },
                            { $gt: ['$$v.priceAfterDiscount', 0] },
                          ],
                        },
                        '$$v.priceAfterDiscount',

                        // ❌ else calculate
                        {
                          $cond: [
                            { $gt: ['$$v.discountRate', 0] },
                            {
                              $round: [
                                {
                                  $subtract: [
                                    '$$v.price',
                                    {
                                      $multiply: [
                                        { $divide: ['$$v.discountRate', 100] },
                                        '$$v.price',
                                      ],
                                    },
                                  ],
                                },
                                2,
                              ],
                            },
                            '$$v.price',
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ],
  );

  console.log(
    `✅ addPriceAfterDiscountFieldForVariants migration complete — modified ${result.modifiedCount} documents`,
  );
}
