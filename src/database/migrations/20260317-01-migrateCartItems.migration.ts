import { Connection, Types } from 'mongoose';

export default async function migrateCartItems(
  mongo: Connection,
): Promise<void> {
  const carts = mongo.collection('carts');
  const products = mongo.collection('products');

  const allCarts = await carts.find({}).toArray();
  let updatedCarts = 0;

  for (const cart of allCarts) {
    let modified = false;

    const updatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        if (item.variantId && item.sku) return item;

        // ✅ Convert to ObjectId before querying
        const productObjectId = new Types.ObjectId(item.productId.toString());
        const product = await products.findOne({ _id: productObjectId });

        if (!product || !product.variants?.length) {
          console.warn(
            `⚠️  No product/variant found for productId: ${item.productId} — skipping`,
          );
          return item;
        }

        const variant = product.variants[0];
        modified = true;

        return {
          ...item,
          variantId: variant.variantId,
          sku: variant.sku,
        };
      }),
    );

    if (modified) {
      await carts.updateOne(
        { _id: cart._id },
        { $set: { items: updatedItems } },
      );
      updatedCarts++;
    }
  }

  console.log(
    `✅ migrateCartItems complete — updated ${updatedCarts} carts`,
  );
}