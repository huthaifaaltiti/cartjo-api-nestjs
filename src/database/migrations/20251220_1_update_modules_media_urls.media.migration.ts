import { Connection } from 'mongoose';
import { appEnvsHosts } from 'src/configs/appEnvsPaths';
import { AppEnvironments } from 'src/enums/appEnvs.enum';

const updateBannerMediaUrls = async (
  mongo: Connection,
  oldHost: string,
  newHost: string,
) => {
  const Banner = mongo.collection('banners');

  const banners = await Banner.find({
    $or: [
      { 'media.ar.url': { $regex: oldHost } },
      { 'media.en.url': { $regex: oldHost } },
    ],
  }).toArray();

  let updatedCount = 0;

  for (const banner of banners) {
    const media = { ...banner.media };

    if (media?.ar?.url?.includes(oldHost)) {
      media.ar.url = media.ar.url.replace(oldHost, newHost);
    }

    if (media?.en?.url?.includes(oldHost)) {
      media.en.url = media.en.url.replace(oldHost, newHost);
    }

    await Banner.updateOne({ _id: banner._id }, { $set: { media } });

    updatedCount++;
  }

  console.log(`🟢 Updated ${updatedCount} banners`);
};

const updateCategoryMediaUrls = async (
  mongo: Connection,
  oldHost: string,
  newHost: string,
) => {
  const Category = mongo.collection('categories');

  const categories = await Category.find({
    $or: [
      { 'media.ar.url': { $regex: oldHost } },
      { 'media.en.url': { $regex: oldHost } },
    ],
  }).toArray();

  let updatedCount = 0;

  for (const category of categories) {
    const media = { ...category.media };

    if (media?.ar?.url?.includes(oldHost)) {
      media.ar.url = media.ar.url.replace(oldHost, newHost);
    }

    if (media?.en?.url?.includes(oldHost)) {
      media.en.url = media.en.url.replace(oldHost, newHost);
    }

    await Category.updateOne({ _id: category._id }, { $set: { media } });

    updatedCount++;
  }

  console.log(`🟢 Updated ${updatedCount} categories`);
};

const updateSubCategoryMediaUrls = async (
  mongo: Connection,
  oldHost: string,
  newHost: string,
) => {
  const SubCategory = mongo.collection('subCategories');

  const subCategories = await SubCategory.find({
    $or: [
      { 'media.ar.url': { $regex: oldHost } },
      { 'media.en.url': { $regex: oldHost } },
    ],
  }).toArray();

  let updatedCount = 0;

  for (const sub of subCategories) {
    const media = { ...sub.media };

    if (media?.ar?.url?.includes(oldHost)) {
      media.ar.url = media.ar.url.replace(oldHost, newHost);
    }

    if (media?.en?.url?.includes(oldHost)) {
      media.en.url = media.en.url.replace(oldHost, newHost);
    }

    await SubCategory.updateOne({ _id: sub._id }, { $set: { media } });

    updatedCount++;
  }

  console.log(`🟢 Updated ${updatedCount} sub-categories`);
};

const updateLogoMediaUrls = async (
  mongo: Connection,
  oldHost: string,
  newHost: string,
) => {
  const Logo = mongo.collection('logo');

  const logos = await Logo.find({
    'media.url': { $regex: oldHost },
  }).toArray();

  let updatedCount = 0;

  for (const logo of logos) {
    if (logo.media?.url?.includes(oldHost)) {
      await Logo.updateOne(
        { _id: logo._id },
        {
          $set: {
            'media.url': logo.media.url.replace(oldHost, newHost),
          },
        },
      );
      updatedCount++;
    }
  }

  console.log(`🟢 Updated ${updatedCount} logos`);
};

const updateProductMediaUrls = async (
  mongo: Connection,
  oldHost: string,
  newHost: string,
) => {
  const Product = mongo.collection('products');

  const products = await Product.find({
    $or: [
      { mainImage: { $regex: oldHost } },
      { images: { $elemMatch: { $regex: oldHost } } },
    ],
  }).toArray();

  let updatedCount = 0;

  for (const product of products) {
    const updateData: any = {};

    if (product.mainImage?.includes(oldHost)) {
      updateData.mainImage = product.mainImage.replace(oldHost, newHost);
    }

    if (Array.isArray(product.images)) {
      updateData.images = product.images.map((img: string) =>
        img.includes(oldHost) ? img.replace(oldHost, newHost) : img,
      );
    }

    if (Object.keys(updateData).length) {
      await Product.updateOne({ _id: product._id }, { $set: updateData });
      updatedCount++;
    }
  }

  console.log(`🟢 Updated ${updatedCount} products`);
};

const updateMediaUrls = async (
  mongo: Connection,
  oldHost: string,
  newHost: string,
) => {
  const Media = mongo.collection('media');

  const docs = await Media.find({ fileUrl: { $regex: oldHost } }).toArray();

  for (const doc of docs) {
    await Media.updateOne(
      { _id: doc._id },
      { $set: { fileUrl: doc.fileUrl.replace(oldHost, newHost) } },
    );
  }

  console.log(`Updated ${docs.length} media URLs.`);
};

export default async function updateModulesMediaUrls(mongo: Connection) {
  const appEnv = process.env.NODE_ENV as AppEnvironments;

  const hostMap = {
    [AppEnvironments.DEVELOPMENT]: {
      old: appEnvsHosts[AppEnvironments.PREVIEW],
      new: appEnvsHosts[AppEnvironments.DEVELOPMENT],
    },
    [AppEnvironments.PREVIEW]: {
      old: appEnvsHosts[AppEnvironments.DEVELOPMENT],
      new: appEnvsHosts[AppEnvironments.PREVIEW],
    },
    [AppEnvironments.PRODUCTION]: {
      old: appEnvsHosts[AppEnvironments.PREVIEW],
      new: appEnvsHosts[AppEnvironments.PRODUCTION],
    },
  };

  const config = hostMap[appEnv];

  if (!config) {
    console.log('❌ Unknown environment. Aborting.');
    return;
  }

  console.log(`🔄 Migrating URLs: ${config.old} → ${config.new}`);

  await updateBannerMediaUrls(mongo, config.old, config.new);
  await updateCategoryMediaUrls(mongo, config.old, config.new);
  await updateSubCategoryMediaUrls(mongo, config.old, config.new);
  await updateLogoMediaUrls(mongo, config.old, config.new);
  await updateProductMediaUrls(mongo, config.old, config.new);
  await updateMediaUrls(mongo, config.old, config.new);

  console.log('✅ Media URL migration completed successfully.');
}
