import type { FlagForReviewInput } from '../agent/types';

/**
 * Action tool: routes an expense to the human review queue with the
 * agent's structured reasoning attached. This is the "escalate to an
 * auditor" path — distinct from requestClarification, which asks the
 * submitter directly.
 *
 * Called by the agent after its own reasoning concludes the expense is a
 * policy violation, a statistical anomaly, or fails the self-verification
 * guardrail check. Never called for missing-information cases — that's
 * requestClarification's job.
 *
 * @param input - expenseId, a human-readable reason, and the specific
 *        risk factors that triggered the flag (for the audit trail)
 * @returns confirmation the item was queued, with a queue entry id
 */
export function flagForHumanReview(
  input: FlagForReviewInput
): { queued: true; queueEntryId: string } {
  throw new Error('Not implemented');
}
