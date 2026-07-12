import type { Expense, DuplicateCheckResult } from '../agent/types';

export function checkDuplicate(
  expense: Expense,
  recentExpenses: Expense[],
  duplicateWindowDays: number
): DuplicateCheckResult {
  const expenseDate = new Date(expense.date).getTime();
  const msPerDay = 24 * 60 * 60 * 1000;

  const matches = recentExpenses.filter((other) => {
    if (other.id === expense.id) return false;
    if (other.employeeId !== expense.employeeId) return false;
    if (other.vendorId !== expense.vendorId) return false;
    if (other.amount !== expense.amount) return false;

    const otherDate = new Date(other.date).getTime();
    const diffDays = Math.abs(expenseDate - otherDate) / msPerDay;
    return diffDays <= duplicateWindowDays;
  });

  return {
    isDuplicateSuspect: matches.length > 0,
    matchedExpenseIds: matches.map((m) => m.id),
  };
}