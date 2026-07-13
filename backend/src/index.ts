import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import expenses from './data/expenses.json';
import vendors from './data/vendors.json';
import employees from './data/employees.json';
import { runAgentLoop } from './agent/loop';
import { getExpenseById } from './agent/dataStore';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/expenses', (req, res) => {
  const enriched = expenses.map((e) => {
    const vendor = vendors.find((v) => v.vendorId === e.vendorId);
    const employee = employees.find((emp) => emp.employeeId === e.employeeId);
    return {
      ...e,
      vendorName: vendor?.name ?? 'Unknown vendor',
      employeeName: employee?.name ?? 'Unknown employee',
    };
  });
  res.json(enriched);
});

app.post('/api/evaluate/:id', async (req, res) => {
  const { id } = req.params;

  try {
    getExpenseById(id); // throws with a clear message if the id is bad
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
    return;
  }

  try {
    const decision = await runAgentLoop(id);
    res.json(decision);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));