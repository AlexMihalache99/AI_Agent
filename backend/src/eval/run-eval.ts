//   npx tsx src/eval/run-eval.ts            # full 40-record run
//   npx tsx src/eval/run-eval.ts --limit 5   # quick, cheap sanity check

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { runAgentLoop } from '../agent/loop';
import { resetStore } from '../agent/store';
import { expenses } from '../agent/dataStore';
import groundTruthRaw from './ground-truth.json';
import type { AgentAction } from '../agent/types';

interface GroundTruthEntry {
  id: string;
  expectedAction: AgentAction;
  edgeCase?: string;
  reasoning?: string;
}

const groundTruth = groundTruthRaw as GroundTruthEntry[];

interface EvalRecord {
  id: string;
  expected: AgentAction;
  predicted: AgentAction | 'error';
  correct: boolean;
  modelReasoning: string;
  errorMessage?: string;
}

function parseLimit(): number | undefined {
  const flagIndex = process.argv.indexOf('--limit');
  if (flagIndex === -1) return undefined;
  const value = parseInt(process.argv[flagIndex + 1], 10);
  return Number.isNaN(value) ? undefined : value;
}

async function runEval() {
  resetStore();

  const limit = parseLimit();
  const targetExpenses = limit ? expenses.slice(0, limit) : expenses;
  const results: EvalRecord[] = [];

  console.log(`Running agent over ${targetExpenses.length} expense record(s)...\n`);

  for (const expense of targetExpenses) {
    const gt = groundTruth.find((g) => g.id === expense.id);
    if (!gt) {
      console.warn(`No ground truth for ${expense.id}, skipping.`);
      continue;
    }

    process.stdout.write(`${expense.id}... `);

    try {
      const decision = await runAgentLoop(expense.id);
      const correct = decision.action === gt.expectedAction;
      results.push({
        id: expense.id,
        expected: gt.expectedAction,
        predicted: decision.action,
        correct,
        modelReasoning: decision.reasoning,
      });
      console.log(`${decision.action} (expected ${gt.expectedAction}) ${correct ? 'OK' : 'MISS'}`);
    } catch (err) {
      results.push({
        id: expense.id,
        expected: gt.expectedAction,
        predicted: 'error',
        correct: false,
        modelReasoning: '',
        errorMessage: (err as Error).message,
      });
      console.log(`ERROR: ${(err as Error).message}`);
    }
  }

  printSummary(results);
  writeResults(results);
}

function printSummary(results: EvalRecord[]) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = total > 0 ? (correctCount / total) * 100 : 0;

  const riskyGroundTruth = results.filter((r) => r.expected !== 'approve');
  const falseApproves = riskyGroundTruth.filter((r) => r.predicted === 'approve');
  const falseApproveRate =
    riskyGroundTruth.length > 0 ? (falseApproves.length / riskyGroundTruth.length) * 100 : 0;

  const cleanGroundTruth = results.filter((r) => r.expected === 'approve');
  const falseFlags = cleanGroundTruth.filter((r) => r.predicted === 'flag');
  const falseFlagRate =
    cleanGroundTruth.length > 0 ? (falseFlags.length / cleanGroundTruth.length) * 100 : 0;

  const clarifyGroundTruth = results.filter((r) => r.expected === 'clarify');
  const correctClarifies = clarifyGroundTruth.filter((r) => r.predicted === 'clarify');
  const clarifyRecall =
    clarifyGroundTruth.length > 0 ? (correctClarifies.length / clarifyGroundTruth.length) * 100 : 0;

  const errors = results.filter((r) => r.predicted === 'error').length;

  console.log('\n===== EVAL SUMMARY =====');
  console.log(`Total records:        ${total}`);
  console.log(`Overall accuracy:     ${accuracy.toFixed(1)}% (${correctCount}/${total})`);
  console.log(
    `False-approve rate:   ${falseApproveRate.toFixed(1)}% (${falseApproves.length}/${riskyGroundTruth.length} risky cases wrongly approved)`
  );
  console.log(
    `False-flag rate:      ${falseFlagRate.toFixed(1)}% (${falseFlags.length}/${cleanGroundTruth.length} clean cases wrongly flagged)`
  );
  console.log(
    `Clarify recall:       ${clarifyRecall.toFixed(1)}% (${correctClarifies.length}/${clarifyGroundTruth.length} ambiguous cases correctly caught)`
  );
  if (errors > 0) {
    console.log(`Errors:               ${errors} record(s) failed to complete — see eval-results.json`);
  }

  const misses = results.filter((r) => !r.correct);
  if (misses.length > 0) {
    console.log('\n----- Misses -----');
    for (const m of misses) {
      console.log(`${m.id}: expected ${m.expected}, got ${m.predicted}`);
    }
  }
}

function writeResults(results: EvalRecord[]) {
  const outPath = path.join(__dirname, 'eval-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nFull results written to ${outPath}`);
}

runEval().catch((err) => {
  console.error('Eval run failed:', err);
  process.exit(1);
});