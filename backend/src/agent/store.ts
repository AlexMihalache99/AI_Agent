import type { FlagForReviewInput, RequestClarificationInput } from './types';

export const reviewQueue: (FlagForReviewInput & { queueEntryId: string })[] = [];
export const clarificationRequests: RequestClarificationInput[] = [];

let queueCounter = 0;
export function nextQueueId(): string {
  queueCounter += 1;
  return `Q${String(queueCounter).padStart(4, '0')}`;
}

export function resetStore(): void {
  reviewQueue.length = 0;
  clarificationRequests.length = 0;
  queueCounter = 0;
}