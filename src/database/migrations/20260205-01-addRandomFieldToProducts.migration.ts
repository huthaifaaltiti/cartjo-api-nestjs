import { Connection } from 'mongoose';

const up = async (mongo: Connection): Promise<void> => {
  const collection = mongo.collection('products');
  await collection.updateMany({ random: { $exists: false } }, [
    {
      $set: {
        random: { $rand: {} },
      },
    },
  ]);
};

// const down = async (mongo: Connection): Promise<void> => {
//   const collection = mongo.collection('products');
//   await collection.updateMany({},
//     { $unset: { random: '' } },);
// };

export default async function updateProductsRandomField(mongo: Connection) {
  await up(mongo);

  console.log('✅ Random field added to products successfully.');
}
