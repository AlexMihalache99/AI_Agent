import type { FlagForReviewInput } from '../agent/types';
import { reviewQueue, nextQueueId } from '../agent/store';

export function flagForHumanReview(
  input: FlagForReviewInput
): { queued: true; queueEntryId: string } {
  const queueEntryId = nextQueueId();
  reviewQueue.push({ ...input, queueEntryId });
  return { queued: true, queueEntryId };
}