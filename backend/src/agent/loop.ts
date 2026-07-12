import Anthropic from '@anthropic-ai/sdk';
import { toolSchemas } from '../tools/schemas';
import { checkPolicyRules } from '../tools/checkPolicyRules';
import { flagForHumanReview } from '../tools/flagForHumanReview';
import { requestClarification } from '../tools/requestClarification';
import { executeTool } from './executeTool';
import { buildSystemPrompt } from './systemPrompt';
import { getExpenseById, policy } from './dataStore';
import { reviewQueue, clarificationRequests } from './store';
import type { AgentAction, AgentDecision } from './types';

const MODEL = 'claude-sonnet-5';
const MAX_TOOL_ROUNDS = 6;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

interface RawModelDecision {
  action: AgentAction;
  reasoning: string;
  riskFactors: string[];
}

function extractDecisionJson(text: string): RawModelDecision {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  const jsonText = match ? match[1] : text;
  const parsed = JSON.parse(jsonText);

  if (!['approve', 'flag', 'clarify'].includes(parsed.action)) {
    throw new Error(`Model returned an invalid action: "${parsed.action}"`);
  }
  return parsed as RawModelDecision;
}

export async function runAgentLoop(expenseId: string): Promise<AgentDecision> {
  const expense = getExpenseById(expenseId);

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Evaluate this expense and reach a decision:\n${JSON.stringify(expense, null, 2)}`,
    },
  ];

  let finalText = '';

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: buildSystemPrompt(),
      tools: toolSchemas as unknown as Anthropic.Tool[],
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason !== 'tool_use') {
      finalText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n');
      break;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      try {
        const result = executeTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: `Error: ${(err as Error).message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  if (!finalText) {
    throw new Error(
      `Agent did not reach a final decision within ${MAX_TOOL_ROUNDS} tool rounds for ${expenseId}`
    );
  }

  const modelDecision = extractDecisionJson(finalText);
  return verifyDecision(expense.id, modelDecision);
}

function verifyDecision(expenseId: string, modelDecision: RawModelDecision): AgentDecision {
  const expense = getExpenseById(expenseId);
  const policyResult = checkPolicyRules(expense, policy);
  const hardCeilingBreached = expense.amount > policy.global.hardCeilingNoAutoApprove;

  if (hardCeilingBreached && modelDecision.action === 'approve') {
    return overrideToFlag(
      expenseId,
      `Self-verification override: model proposed "approve" but amount $${expense.amount.toFixed(
        2
      )} exceeds the hard ceiling of $${policy.global.hardCeilingNoAutoApprove}. Routing to human review regardless of the model's stated reasoning.`,
      ['hard-ceiling-breach', 'self-verification-override']
    );
  }

  if (modelDecision.action === 'approve' && !policyResult.compliant) {
    return overrideToFlag(
      expenseId,
      `Self-verification override: model proposed "approve" but the deterministic policy check found violations: ${policyResult.violations.join(
        '; '
      )}.`,
      ['policy-check-disagreement', 'self-verification-override']
    );
  }

  if (!['approve', 'flag', 'clarify'].includes(modelDecision.action)) {
    return overrideToFlag(
      expenseId,
      `Self-verification override: model returned an unrecognized action "${modelDecision.action}". Routing to human review as the safe default.`,
      ['invalid-model-action', 'self-verification-override']
    );
  }

  if (modelDecision.action === 'flag') {
    const alreadyQueued = reviewQueue.some((entry) => entry.expenseId === expenseId);
    if (!alreadyQueued) {
      flagForHumanReview({
        expenseId,
        reason: modelDecision.reasoning,
        riskFactors: modelDecision.riskFactors,
      });
    }
  }

  if (modelDecision.action === 'clarify') {
    const alreadyAsked = clarificationRequests.some((entry) => entry.expenseId === expenseId);
    if (!alreadyAsked) {
      requestClarification({
        expenseId,
        question: modelDecision.reasoning,
      });
    }
  }

  return {
    expenseId,
    action: modelDecision.action,
    reasoning: modelDecision.reasoning,
    riskFactors: modelDecision.riskFactors,
  };
}

function overrideToFlag(
  expenseId: string,
  reason: string,
  riskFactors: string[]
): AgentDecision {
  flagForHumanReview({ expenseId, reason, riskFactors });
  return { expenseId, action: 'flag', reasoning: reason, riskFactors };
}