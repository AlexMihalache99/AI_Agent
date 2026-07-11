import type {
  Expense,
  Employee,
  EmployeeSpendingPatternResult,
} from '../agent/types';

/**
 * Structured lookup against employees.json for the given employee +
 * expense category. Tells the agent whether this amount is normal for
 * this specific person, not just for the category in general — the same
 * $90 meal is unremarkable for a Sales employee and unusual for someone
 * whose baseline is $18.
 *
 * @param expense - the expense record being evaluated (needs employeeId, category, amount)
 * @param employees - the loaded employees.json array
 * @returns baseline comparison result; hasBaselineForCategory is false if
 *          this employee has no history in this category (not itself a
 *          risk signal — plenty of legitimate first purchases in a category)
 */
export function getEmployeeSpendingPattern(
  expense: Expense,
  employees: Employee[]
): EmployeeSpendingPatternResult {
  throw new Error('Not implemented');
}
