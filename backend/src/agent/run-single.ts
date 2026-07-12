import 'dotenv/config';
import { runAgentLoop } from './loop';
import { reviewQueue, clarificationRequests } from './store';

async function main() {
  const expenseId = process.argv[2];
  if (!expenseId) {
    console.error('Usage: npx tsx src/agent/run-single.ts <expenseId>');
    process.exit(1);
  }

  console.log(`Running agent on ${expenseId}...\n`);
  const decision = await runAgentLoop(expenseId);
  console.log(JSON.stringify(decision, null, 2));

  const queueEntry = reviewQueue.find((e) => e.expenseId === expenseId);
  const clarifyEntry = clarificationRequests.find((e) => e.expenseId === expenseId);

  if (queueEntry) {
    console.log('\n[verified] Review queue entry exists:', queueEntry);
  }
  if (clarifyEntry) {
    console.log('\n[verified] Clarification request exists:', clarifyEntry);
  }
  if (decision.action !== 'approve' && !queueEntry && !clarifyEntry) {
    console.log(
      '\n[WARNING] Decision was not "approve" but no matching store entry was found — this should not happen.'
    );
  }
}

main().catch((err) => {
  console.error('Agent loop failed:', err);
  process.exit(1);
});