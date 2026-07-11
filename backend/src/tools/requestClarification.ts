import type { RequestClarificationInput } from '../agent/types';

/**
 * Action tool: asks the expense submitter a specific question rather
 * than escalating to an auditor. Used when the expense is ambiguous
 * because information is missing or unclear (no receipt where one is
 * required, no attendee name on client entertainment) — not when the
 * expense itself looks risky or non-compliant. That case is
 * flagForHumanReview's job.
 *
 * @param input - expenseId and the specific question to ask (should be
 *        answerable by the submitter alone, e.g. "Please attach the
 *        missing receipt" rather than something only an auditor could resolve)
 * @returns confirmation the clarification request was sent
 */
export function requestClarification(
  input: RequestClarificationInput
): { sent: true; expenseId: string } {
  throw new Error('Not implemented');
}
