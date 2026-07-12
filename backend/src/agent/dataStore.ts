import expensesRaw from '../data/expenses.json';
import vendorsRaw from '../data/vendors.json';
import employeesRaw from '../data/employees.json';
import policyRaw from '../data/policy.json';
import type { Expense, Vendor, Employee, PolicyConfig } from './types';

export const expenses = expensesRaw as Expense[];
export const vendors = vendorsRaw as Vendor[];
export const employees = employeesRaw as Employee[];
export const policy = policyRaw as PolicyConfig;

export function getExpenseById(id: string): Expense {
  const expense = expenses.find((e) => e.id === id);
  if (!expense) {
    throw new Error(`Expense not found: ${id}`);
  }
  return expense;
}