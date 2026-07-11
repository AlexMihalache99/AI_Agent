import type { Expense, DuplicateCheckResult } from '../agent/types';

/**
 * Checks whether the given expense looks like a duplicate of another
 * recent submission from the same employee: same vendor, same amount,
 * within the policy's duplicate window (policy.global.duplicateWindowDays).
 *
 * Deliberately conservative in what it concludes — a match here means
 * "flag for human review", never "auto-reject".
 *
 * @param expense - the expense record being evaluated
 * @param recentExpenses - other expenses to compare against (typically
 *        the same employee's submissions from the current eval/session batch)
 * @param duplicateWindowDays - from policy.global.duplicateWindowDays
 * @returns whether this looks like a possible duplicate, and which
 *          prior expense IDs it matched against
 */
export function checkDuplicate(
  expense: Expense,
  recentExpenses: Expense[],
  duplicateWindowDays: number
): DuplicateCheckResult {
  throw new Error('Not implemented');
}
