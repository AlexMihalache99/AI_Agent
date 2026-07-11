export type ExpenseCategory =
  | 'meals'
  | 'travel'
  | 'office_supplies'
  | 'software'
  | 'entertainment'
  | 'equipment'
  | 'other';

export interface Expense {
  id: string;
  employeeId: string;
  vendorId: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO 8601, e.g. "2026-07-11"
  hasReceipt: boolean;
  description: string;
}

export interface Vendor {
  vendorId: string;
  name: string;
  category: ExpenseCategory;
  firstSeen: string;
  transactionCount: number;
  avgAmount: number;
}

export interface Employee {
  employeeId: string;
  name: string;
  department: string;
  spendingBaseline: Partial<
    Record<
      ExpenseCategory,
      {
        avgAmount: number;
        typicalFrequencyPerWeek?: number;
        typicalFrequencyPerMonth?: number;
        typicalFrequencyPerQuarter?: number;
      }
    >
  >;
}

export interface PolicyCategoryRule {
  dailyLimitNoApproval?: number;
  limitNoApproval?: number;
  perTripLimitNoApproval?: number;
  receiptRequiredAbove: number;
  note?: string;
}

export interface PolicyConfig {
  categories: Record<ExpenseCategory, PolicyCategoryRule>;
  global: {
    hardCeilingNoAutoApprove: number;
    firstTimeVendorFlagThreshold: number;
    duplicateWindowDays: number;
  };
}

// Agent-facing types — what the tools return and what the loop acts on

export type AgentAction = 'approve' | 'flag' | 'clarify';

export interface PolicyCheckResult {
  compliant: boolean;
  violations: string[];
}

export interface VendorHistoryResult {
  vendorId: string;
  vendorName: string;
  isFirstTimeVendor: boolean;
  transactionCount: number;
  avgAmount: number;
  amountDeviatesFromAvg: boolean;
}

export interface EmployeeSpendingPatternResult {
  employeeId: string;
  hasBaselineForCategory: boolean;
  baselineAvgAmount: number | null;
  amountDeviatesFromBaseline: boolean;
}

export interface DuplicateCheckResult {
  isDuplicateSuspect: boolean;
  matchedExpenseIds: string[];
}

export interface FlagForReviewInput {
  expenseId: string;
  reason: string;
  riskFactors: string[];
}

export interface RequestClarificationInput {
  expenseId: string;
  question: string;
}

// The final synthesized decision the agent's reasoning step produces,
// before the verification step checks it against guardrails.
export interface AgentDecision {
  expenseId: string;
  action: AgentAction;
  reasoning: string;
  riskFactors: string[];
}
