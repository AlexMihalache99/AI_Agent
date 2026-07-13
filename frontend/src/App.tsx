import { Fragment, useEffect, useState } from 'react';
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

type AgentAction = 'approve' | 'flag' | 'clarify';

interface AgentDecision {
  expenseId: string;
  action: AgentAction;
  reasoning: string;
  riskFactors: string[];
}

type RowStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'done'; decision: AgentDecision }
  | { state: 'error'; message: string };

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});
  const [runningAll, setRunningAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  async function evaluateExpense(id: string) {
    setRowStatus((prev) => ({ ...prev, [id]: { state: 'loading' } }));
    try {
      const res = await fetch(`/api/evaluate/${id}`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      const decision: AgentDecision = await res.json();
      setRowStatus((prev) => ({ ...prev, [id]: { state: 'done', decision } }));
    } catch (err) {
      setRowStatus((prev) => ({
        ...prev,
        [id]: { state: 'error', message: (err as Error).message },
      }));
    }
  }

  async function runAll() {
    setRunningAll(true);
    for (const expense of expenses) {
      await evaluateExpense(expense.id);
    }
    setRunningAll(false);
  }

  if (loading) return <div className="status">Loading expenses...</div>;
  if (error) return <div className="status error">Error: {error}</div>;

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>Expense Anomaly Agent</h1>
          <p className="subtitle">{expenses.length} records loaded</p>
        </div>
        <button className="run-all-btn" onClick={runAll} disabled={runningAll}>
          {runningAll ? 'Running...' : 'Run Agent on All'}
        </button>
      </div>

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
            <th>Agent Decision</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => {
            const status = rowStatus[e.id] ?? { state: 'idle' };
            const isExpanded = expandedId === e.id;
            return (
              <Fragment key={e.id}>
                <tr className={status.state === 'done' ? `row-${status.decision.action}` : ''}>
                  <td>{e.id}</td>
                  <td>{e.employeeName}</td>
                  <td>{e.vendorName}</td>
                  <td>{e.category}</td>
                  <td>${e.amount.toFixed(2)}</td>
                  <td>{e.date}</td>
                  <td>{e.hasReceipt ? 'Yes' : 'No'}</td>
                  <td>{e.description}</td>
                  <td>
                    {status.state === 'idle' && (
                      <button className="eval-btn" onClick={() => evaluateExpense(e.id)}>
                        Evaluate
                      </button>
                    )}
                    {status.state === 'loading' && <span className="badge badge-loading">thinking...</span>}
                    {status.state === 'error' && (
                      <span className="badge badge-error" title={status.message}>
                        error
                      </span>
                    )}
                    {status.state === 'done' && (
                      <button
                        className={`badge badge-${status.decision.action}`}
                        onClick={() => setExpandedId(isExpanded ? null : e.id)}
                      >
                        {status.decision.action}
                      </button>
                    )}
                  </td>
                </tr>
                {status.state === 'done' && isExpanded && (
                  <tr className="reasoning-row">
                    <td colSpan={9}>
                      <div className="reasoning-panel">
                        <strong>Reasoning:</strong> {status.decision.reasoning}
                        {status.decision.riskFactors.length > 0 && (
                          <div className="risk-factors">
                            {status.decision.riskFactors.map((rf) => (
                              <span className="risk-tag" key={rf}>
                                {rf}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;