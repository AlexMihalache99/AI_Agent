import type { Expense, PolicyConfig, PolicyCheckResult } from '../agent/types';

/**
 * Deterministic rule check
 *
 * Checks a single expense against the category and global thresholds in
 * policy.json: daily/per-trip limits, receipt-required floor, and the
 * hard ceiling. 
 *
 * @param expense - the expense record being evaluated
 * @param policy - the loaded policy.json config
 * @returns compliant flag + a list of human-readable violation reasons
 *          (empty array if compliant)
 */
export function checkPolicyRules(
  expense: Expense,
  policy: PolicyConfig
): PolicyCheckResult {
  throw new Error('Not implemented');
}
