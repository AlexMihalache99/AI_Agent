import type { Expense, PolicyConfig, PolicyCheckResult } from '../agent/types';

export function checkPolicyRules(
  expense: Expense,
  policy: PolicyConfig
): PolicyCheckResult {
  const categoryRule = policy.categories[expense.category];
  const violations: string[] = [];

  if (!categoryRule) {
    return {
      compliant: false,
      violations: [`No policy rule defined for category "${expense.category}"`],
    };
  }

  if (expense.amount > categoryRule.receiptRequiredAbove && !expense.hasReceipt) {
    violations.push(
      `Missing receipt: required for ${expense.category} amounts above $${categoryRule.receiptRequiredAbove}`
    );
  }

  const categoryLimit =
    categoryRule.dailyLimitNoApproval ??
    categoryRule.limitNoApproval ??
    categoryRule.perTripLimitNoApproval;

  if (categoryLimit !== undefined && expense.amount > categoryLimit) {
    violations.push(
      `Amount $${expense.amount.toFixed(2)} exceeds ${expense.category} limit of $${categoryLimit}`
    );
  }

  if (expense.amount > policy.global.hardCeilingNoAutoApprove) {
    violations.push(
      `Amount $${expense.amount.toFixed(2)} exceeds hard ceiling of $${policy.global.hardCeilingNoAutoApprove} — always requires human review, regardless of other factors`
    );
  }

  return { compliant: violations.length === 0, violations };
}