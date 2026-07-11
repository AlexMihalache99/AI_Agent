export const toolSchemas = [
  {
    name: 'check_policy_rules',
    description:
      "Checks a single expense against the company's deterministic policy thresholds: category spending limits, receipt-required floor, and the hard ceiling above which nothing can be auto-approved. Use this first, on every expense, before any other tool — it tells you whether the expense is even eligible for auto-approval regardless of other risk factors. Returns whether the expense is compliant and, if not, a list of specific violation reasons (e.g. 'exceeds meals daily limit of $75'). This does not check vendor history, duplicates, or spending patterns — only static policy thresholds.",
    input_schema: {
      type: 'object',
      properties: {
        expenseId: {
          type: 'string',
          description: 'The ID of the expense record to check, e.g. "EXP012"',
        },
      },
      required: ['expenseId'],
    },
  },
  {
    name: 'get_vendor_history',
    description:
      "Looks up how many prior transactions this company has had with the expense's vendor, and whether the current amount is unusual compared to that vendor's typical transaction size. Use this to assess vendor-side risk: a first-time vendor combined with a high amount is a meaningfully different risk profile than a well-established vendor at a typical amount. A first-time vendor at a small amount is usually not worth flagging on its own — check the returned amount against the first-time-vendor threshold before deciding it's risky.",
    input_schema: {
      type: 'object',
      properties: {
        expenseId: {
          type: 'string',
          description: 'The ID of the expense record whose vendor to look up',
        },
      },
      required: ['expenseId'],
    },
  },
  {
    name: 'get_employee_spending_pattern',
    description:
      "Looks up the submitting employee's historical average spend in the expense's category, so you can judge whether this amount is normal for this specific person rather than just for the category in general. A missing baseline (employee has no history in this category) is not itself a risk signal — it's common for a legitimate first purchase in a category. Only treat a significant deviation from an *existing* baseline as a risk factor.",
    input_schema: {
      type: 'object',
      properties: {
        expenseId: {
          type: 'string',
          description: 'The ID of the expense record whose submitter to look up',
        },
      },
      required: ['expenseId'],
    },
  },
  {
    name: 'check_duplicate',
    description:
      "Checks whether this expense looks like a duplicate of another recent submission from the same employee — same vendor, same amount, within the policy's duplicate window. A match here means the expense is a *possible* duplicate, not a confirmed one; two genuinely separate transactions can trigger this signal (e.g. two separate cab rides of the same fare on different days). Treat a match as a reason to flag for human review, never as grounds to reject the expense outright.",
    input_schema: {
      type: 'object',
      properties: {
        expenseId: {
          type: 'string',
          description: 'The ID of the expense record to check for duplicates',
        },
      },
      required: ['expenseId'],
    },
  },
  {
    name: 'flag_for_human_review',
    description:
      "Routes this expense to the human review queue along with your reasoning and the specific risk factors that triggered the flag. Use this when your analysis concludes the expense is a policy violation, a statistical anomaly (unusual vendor, amount, or pattern), or fails your own self-verification check against the guardrails — situations where a human auditor needs to make the final call. Do NOT use this for missing-information cases where the submitter themselves could resolve the ambiguity (use request_clarification instead) or for expenses you've determined are clean and compliant (use approve).",
    input_schema: {
      type: 'object',
      properties: {
        expenseId: { type: 'string', description: 'The ID of the expense record' },
        reason: {
          type: 'string',
          description: 'A concise, human-readable explanation of why this expense is being flagged, suitable for an auditor to read',
        },
        riskFactors: {
          type: 'array',
          items: { type: 'string' },
          description: 'The specific risk factors that contributed to this decision, e.g. ["first-time vendor", "amount exceeds category limit"]',
        },
      },
      required: ['expenseId', 'reason', 'riskFactors'],
    },
  },
  {
    name: 'request_clarification',
    description:
      "Sends a specific question back to the expense submitter, rather than escalating to an auditor. Use this only when the expense is ambiguous because information is missing or unclear — a required receipt wasn't attached, a client entertainment expense has no attendee name — and the submitter themselves is the right person to resolve it. Do NOT use this when the expense looks risky or non-compliant in a way the submitter can't simply clarify away (use flag_for_human_review instead).",
    input_schema: {
      type: 'object',
      properties: {
        expenseId: { type: 'string', description: 'The ID of the expense record' },
        question: {
          type: 'string',
          description: 'The specific question to ask the submitter, e.g. "Please attach the missing receipt for this expense."',
        },
      },
      required: ['expenseId', 'question'],
    },
  },
] as const;
