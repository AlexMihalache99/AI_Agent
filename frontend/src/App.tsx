import { useEffect, useState } from 'react';
import './App.css';

interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  vendorId: string;
  vendorName: string;
  category: string;
  amount: number;
  date: string;
  hasReceipt: boolean;
  description: string;
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/expenses')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setExpenses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="status">Loading expenses...</div>;
  if (error) return <div className="status error">Error: {error}</div>;

  return (
    <div className="app">
      <h1>Expense Anomaly Agent</h1>
      <p className="subtitle">{expenses.length} records loaded from the backend</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Vendor</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Receipt</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.employeeName}</td>
              <td>{e.vendorName}</td>
              <td>{e.category}</td>
              <td>${e.amount.toFixed(2)}</td>
              <td>{e.date}</td>
              <td>{e.hasReceipt ? 'Yes' : 'No'}</td>
              <td>{e.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;