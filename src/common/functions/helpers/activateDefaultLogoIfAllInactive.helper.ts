import { Model } from 'mongoose';

export async function activateDefaultLogoIfAllInactive(
  logoModel: typeof Model,
  defaultLogoId: string,
) {
  const activeLogosCount = await logoModel.countDocuments({ isActive: true });

  if (activeLogosCount === 0 && defaultLogoId) {
    await logoModel.findByIdAndUpdate(defaultLogoId, {
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  }
}
