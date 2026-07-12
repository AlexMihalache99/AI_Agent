import type { RequestClarificationInput } from '../agent/types';
import { clarificationRequests } from '../agent/store';

export function requestClarification(
  input: RequestClarificationInput
): { sent: true; expenseId: string } {
  clarificationRequests.push(input);
  return { sent: true, expenseId: input.expenseId };
}