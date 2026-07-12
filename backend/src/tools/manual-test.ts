import expenses from '../data/expenses.json';
import vendors from '../data/vendors.json';
import employees from '../data/employees.json';
import policy from '../data/policy.json';
import { checkPolicyRules } from './checkPolicyRules';
import { getVendorHistory } from './getVendorHistory';
import { getEmployeeSpendingPattern } from './getEmployeeSpendingPattern';
import { checkDuplicate } from './checkDuplicate';
import { flagForHumanReview } from './flagForHumanReview';
import { requestClarification } from './requestClarification';
import type { Expense, Vendor, Employee, PolicyConfig } from '../agent/types';

const typedExpenses = expenses as Expense[];
const typedVendors = vendors as Vendor[];
const typedEmployees = employees as Employee[];
const typedPolicy = policy as PolicyConfig;

// The 12 tricky edge-case IDs from the dataset, spot-checked here.
const idsToTest = [
  'EXP029', 'EXP030', 'EXP031', 'EXP032', 'EXP033',
  'EXP034', 'EXP035', 'EXP036', 'EXP037', 'EXP038', 'EXP039', 'EXP040',
];

for (const id of idsToTest) {
  const expense = typedExpenses.find((e) => e.id === id)!;
  console.log(`\n--- ${id}: ${expense.description} ($${expense.amount}) ---`);
  console.log('policy:', checkPolicyRules(expense, typedPolicy));
  console.log('vendor:', getVendorHistory(expense, typedVendors));
  console.log('employee:', getEmployeeSpendingPattern(expense, typedEmployees));
  console.log('duplicate:', checkDuplicate(expense, typedExpenses, typedPolicy.global.duplicateWindowDays));
}

// Quick check the action tools actually write to the store
const flagResult = flagForHumanReview({
  expenseId: 'EXP038',
  reason: 'Exceeds hard ceiling',
  riskFactors: ['amount > $1000'],
});
console.log('\nflagForHumanReview result:', flagResult);

const clarifyResult = requestClarification({
  expenseId: 'EXP036',
  question: 'Please attach the missing receipt.',
});
console.log('requestClarification result:', clarifyResult);