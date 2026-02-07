import { Connection } from 'mongoose';

export default async function updateProductsRandomIndex(
  mongo: Connection,
): Promise<void> {
  const collection = mongo.collection('products');

  const indexes = await collection.indexes();
  const indexExists = indexes.some(
    idx => idx.name === 'products_random_active_idx',
  );

  if (!indexExists) {
    await collection.createIndex(
      { isActive: 1, isDeleted: 1, random: 1 },
      /* Order Matters: MongoDB follows the "ESR" rule (Equality, Sort, Range). This index is designed to first filter by isActive, then by isDeleted, and finally to provide a sorted list of the random values.
      { name: 'products_random_active_idx' },

      📚 Indexing (structure)

       This decides how documents are ordered inside the index:

       { isActive: 1 }


       Means:

       “Store documents ordered by isActive ascending”

       So internally:

       isActive: false docs first
       isActive: true  docs after
       */
    );

    console.log('✅ products_random_active_idx created');
  } else {
    console.log('ℹ️ products_random_active_idx already exists');
  }
}
