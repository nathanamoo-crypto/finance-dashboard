import { useState } from "react";

export default function App() {
  const [transactions, setTransactions] = useState([]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  function addTransaction(e) {
    e.preventDefault();

    const form = e.target;
    const newTransaction = {
      id: Date.now(),
      title: form.title.value,
      amount: Number(form.amount.value),
      type: form.type.value,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    form.reset();
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard title="Income" value={totalIncome} color="text-green-600" />
          <SummaryCard title="Expenses" value={totalExpenses} color="text-red-600" />
          <SummaryCard title="Balance" value={balance} color="text-blue-600" />
        </div>

        {/* Add Transaction */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">Add Transaction</h2>
          <form onSubmit={addTransaction} className="grid gap-3 sm:grid-cols-4">
            <input
              name="title"
              placeholder="Title"
              required
              className="border p-2 rounded"
            />
            <input
              name="amount"
              type="number"
              placeholder="Amount"
              required
              className="border p-2 rounded"
            />
            <select name="type" className="border p-2 rounded">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
              Add
            </button>
          </form>
        </section>

        {/* Transactions */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">Transactions</h2>

          {transactions.length === 0 && (
            <p className="text-gray-500">No transactions yet.</p>
          )}

          <ul className="space-y-2">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex justify-between items-center border-b pb-1"
              >
                <span>{t.title}</span>
                <span
                  className={
                    t.type === "income"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {t.type === "income" ? "+" : "-"}${t.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>${value}</p>
    </div>
  );
}
