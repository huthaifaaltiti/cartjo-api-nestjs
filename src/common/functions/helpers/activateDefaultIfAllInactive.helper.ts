import { Model } from 'mongoose';

export async function activateDefaultIfAllInactive(
  model: typeof Model,
  defDocId: string,
) {
  if (!model || !defDocId) return;

  const activeDocsCount = await model.countDocuments({ isActive: true });

  if (activeDocsCount === 0 && defDocId) {
    await model.findByIdAndUpdate(defDocId, {
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  }
}
