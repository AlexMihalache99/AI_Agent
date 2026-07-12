# Expense Anomaly Agent

An AI agent that ingests expense/invoice records, checks them against policy
rules and historical patterns, and either auto-approves, flags for human
review, or asks a clarifying question — with a self-verification step and
hard-coded guardrails on top.

Built as a take-home project for a Senior Applied AI Engineer interview.

## Status

- [x] Backend + frontend scaffolding (Express/TS, Vite/React/TS)
- [x] Synthetic dataset: 40 expense records + vendor/employee/policy reference data
- [x] Ground-truth eval labels for 40 records
- [x] `/api/expenses` serving the dataset end-to-end to the frontend
- [x] Agent core loop (tools, reasoning, verification)
- [x] Guardrails enforcement in code
- [x] Eval harness (run agent over full dataset, compute metrics)
- [ ] Demo UI (live decision feed) - in progress

## Structure

```
backend/
  src/
    index.ts           Express app entry — API routes
    data/
      expenses.json     40 synthetic expense records
      vendors.json       18 vendors with transaction history
      employees.json     5 employees with per-category spending baselines
      policy.json         Deterministic policy thresholds (limits, ceilings)
    tools/               Agent tool functions (not yet implemented)
    agent/               Core perceive→reason→verify→act loop (not yet implemented)
    eval/
      ground-truth.json  Expected label + reasoning for each expense record
                          (kept separate from data/ so the agent never sees it)
frontend/
  src/
    App.tsx              Fetches /api/expenses, renders as a table
    App.css
generate_dataset.py     random dataset generator for users to create their own set of data
```

## Dataset

`expenses.json` has 40 records: 28 straightforward cases (mostly clean, so the
eval isn't gamed by an agent that just flags everything) and 12 deliberately
tricky edge cases — borderline policy thresholds, first-time vendors at
different amounts, a possible duplicate, missing receipts above/below the
receipt-required threshold, a suspiciously round number, a hard-ceiling
breach, a category/description mismatch, and a missing required field.

`ground-truth.json` in `eval/` has the expected action (`approve` / `flag` /
`clarify`) and reasoning for each record, used later by the eval harness.
It's intentionally not in `data/`, so nothing in the agent's own read path
can see the answer key.

## API

- `GET /api/health` — liveness check
- `GET /api/expenses` — all 40 expense records, with vendor and employee
  names joined in

## Running locally

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

Backend: http://localhost:3001
Frontend: http://localhost:5173 (dev server proxies `/api/*` to the backend)

Open the frontend in a browser — you should see a table of 40 expense
records loaded from the backend.
