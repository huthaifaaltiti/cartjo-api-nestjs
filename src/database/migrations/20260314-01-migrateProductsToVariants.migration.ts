import { Connection } from 'mongoose';
import { ProductVariantAttributeKey } from 'src/enums/productVariantAttributeKey.enum';
import { SellingType } from 'src/enums/sellingType.enum';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';

export default async function migrateProductsToVariants(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('products');

  const result = await collection.updateMany(
    {
      $or: [
        { variants: { $exists: false } },
        { variants: { $size: 0 } },
        { variants: null },
      ],
    },
    [
      {
        $set: {
          typeHints: {
            $cond: [
              { $ifNull: ['$typeHint', false] },
              '$typeHint',
              [SystemTypeHints.STATIC],
            ],
          },
          variants: [
            {
              variantId: {
                $concat: [
                  '$slug',
                  '-VAR-',
                  {
                    $toString: {
                      $floor: { $multiply: [Math.random(), 1000000] },
                    },
                  },
                ],
              },
              sku: {
                $concat: [
                  { $ifNull: ['$slug', 'UNKNOWN-SLUG'] },
                  '-SKU-',
                  {
                    $toString: {
                      $floor: { $multiply: [Math.random(), 1000000] },
                    },
                  },
                ],
              },
              attributes: [
                {
                  key: ProductVariantAttributeKey.SELLING_TYPE,
                  value: SellingType.PIECE,
                },
              ],
              description: '$description',
              mainImage: {
                $cond: [
                  { $ifNull: ['$mainMediaId', false] },
                  { id: '$mainMediaId', url: '$mainImage' },
                  { id: null, url: '$mainImage' },
                ],
              },
              images: {
                $map: {
                  input: {
                    $range: [0, { $size: { $ifNull: ['$images', []] } }],
                  },
                  as: 'i',
                  in: {
                    $cond: [
                      {
                        $and: [
                          {
                            $gt: [
                              { $size: { $ifNull: ['$mediaListIds', []] } },
                              '$$i',
                            ],
                          },
                          {
                            $gt: [
                              { $size: { $ifNull: ['$images', []] } },
                              '$$i',
                            ],
                          },
                        ],
                      },
                      {
                        id: { $arrayElemAt: ['$mediaListIds', '$$i'] }, // <-- FIXED
                        url: { $arrayElemAt: ['$images', '$$i'] },
                      },
                      null,
                    ],
                  },
                },
              },
              price: '$price',
              currency: '$currency',
              availableCount: '$availableCount',
              totalAmountCount: '$totalAmountCount',
              discountRate: '$discountRate',
              priceAfterDiscount: {
                $cond: [
                  { $gt: ['$discountRate', 0] },
                  {
                    $multiply: [
                      '$price',
                      { $subtract: [1, { $divide: ['$discountRate', 100] }] },
                    ],
                  },
                  '$price',
                ],
              },
              isActive: '$isActive',
              isDeleted: '$isDeleted',
              isAvailable: '$isAvailable',
              createdAt: '$createdAt',
              createdBy: '$createdBy',
              updatedAt: '$updatedAt',
              updatedBy: '$updatedBy',
              ratingsAverage: '$ratingsAverage',
              ratingsCount: '$ratingsCount',
              sellCount: '$sellCount',
            },
          ],
        },
      },
      {
        $unset: [
          'images',
          'mediaListIds',
          'mainMediaId',
          'price',
          'currency',
          'discountRate',
          'ratings',
          'availableCount',
          'totalAmountCount',
          'sellCount',
          'typeHint',
        ],
      },
    ],
  );

  console.log(
    `✅ migrateProductsToVariants migration complete — modified ${result.modifiedCount} products`,
  );
}
