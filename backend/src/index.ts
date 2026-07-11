import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expenses from './data/expenses.json';
import vendors from './data/vendors.json';
import employees from './data/employees.json';

dotenv.config();

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

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));