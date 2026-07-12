import type {
  Expense,
  Employee,
  EmployeeSpendingPatternResult,
} from '../agent/types';

export function getEmployeeSpendingPattern(
  expense: Expense,
  employees: Employee[]
): EmployeeSpendingPatternResult {
  const employee = employees.find((e) => e.employeeId === expense.employeeId);
  if (!employee) {
    throw new Error(`Employee not found: ${expense.employeeId}`);
  }

  const baseline = employee.spendingBaseline[expense.category];
  const hasBaselineForCategory = baseline !== undefined;
  const baselineAvgAmount = baseline ? baseline.avgAmount : null;

  const amountDeviatesFromBaseline = baseline
    ? expense.amount > baseline.avgAmount * 2
    : false;

  return {
    employeeId: employee.employeeId,
    hasBaselineForCategory,
    baselineAvgAmount,
    amountDeviatesFromBaseline,
  };
}