import { RevalidationService } from 'src/modules/revalidation/revalidation.service';

export async function revalidatePath(
  revalidationService: RevalidationService,
  paths: string[],
) {
  try {
    if (paths.length === 0 || !revalidationService) return;
    await revalidationService.revalidatePaths(paths);
  } catch (err) {
    console.error('Revalidation failed:', err);
  }
}

export async function revalidateTag(
  revalidationService: RevalidationService,
  tag: string,
) {
  try {
    if (!tag || !revalidationService) return;
    await revalidationService.revalidateTag(tag);
  } catch (err) {
    console.error('Revalidation failed:', err);
  }
}
