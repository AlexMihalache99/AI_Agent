import { checkPolicyRules } from '../tools/checkPolicyRules';
import { getVendorHistory } from '../tools/getVendorHistory';
import { getEmployeeSpendingPattern } from '../tools/getEmployeeSpendingPattern';
import { checkDuplicate } from '../tools/checkDuplicate';
import { flagForHumanReview } from '../tools/flagForHumanReview';
import { requestClarification } from '../tools/requestClarification';
import { expenses, vendors, employees, policy, getExpenseById } from './dataStore';

export function executeTool(toolName: string, input: Record<string, unknown>): unknown {
  switch (toolName) {
    case 'check_policy_rules': {
      const expense = getExpenseById(input.expenseId as string);
      return checkPolicyRules(expense, policy);
    }

    case 'get_vendor_history': {
      const expense = getExpenseById(input.expenseId as string);
      return getVendorHistory(expense, vendors);
    }

    case 'get_employee_spending_pattern': {
      const expense = getExpenseById(input.expenseId as string);
      return getEmployeeSpendingPattern(expense, employees);
    }

    case 'check_duplicate': {
      const expense = getExpenseById(input.expenseId as string);
      return checkDuplicate(expense, expenses, policy.global.duplicateWindowDays);
    }

    case 'flag_for_human_review': {
      return flagForHumanReview({
        expenseId: input.expenseId as string,
        reason: input.reason as string,
        riskFactors: input.riskFactors as string[],
      });
    }

    case 'request_clarification': {
      return requestClarification({
        expenseId: input.expenseId as string,
        question: input.question as string,
      });
    }

    default:
      throw new Error(`Unknown tool requested by model: ${toolName}`);
  }
}