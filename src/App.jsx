import { useEffect, useMemo, useState } from "react";

/* ---------------- HELPERS ---------------- */
const uid = () => crypto.randomUUID();

// Normalize to monthly income
const normalizeToMonthly = (amount, frequency) => {
  if (frequency === "Weekly") return amount * 4;
  if (frequency === "Yearly") return amount / 12;
  return amount;
};

// Days in month, handles leap years
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

const DEFAULT_CATEGORIES = {
  food: { name: "Food & Drinks", percent: 30 },
  bills: { name: "Bills & Subscriptions", percent: 20 },
  lifestyle: { name: "Clothing & Lifestyle", percent: 10 },
  savings: { name: "Savings & Investments", percent: 25 },
  misc: { name: "Misc / Emergency", percent: 10 },
  others: { name: "Others", percent: 5 },
};

/* ---------------- APP ---------------- */
export default function App() {
  /* ---------- STATE ---------- */
  const today = new Date();
  const initialMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(initialMonth);

  // Load full store from localStorage
  const [store, setStore] = useState(() => JSON.parse(localStorage.getItem("finance_store") || "{}"));

  // Get or initialize current month data
  const data = useMemo(() => {
    if (store[month]) return store[month];

    // Pre-fill from last month if available
    const months = Object.keys(store).sort();
    const lastMonthData = months.length ? store[months[months.length - 1]] : null;

    return {
      income: lastMonthData?.income || { amount: 0, type: "Allowance", frequency: "Monthly" },
      categories: lastMonthData?.categories || DEFAULT_CATEGORIES,
      goal: lastMonthData?.goal || { target: "", months: "" },
      spending: lastMonthData?.spending || {},
    };
  }, [month, store]);

  // Persist changes per month
  const updateMonthData = (patch) => {
    const updated = { ...data, ...patch };
    setStore((prev) => ({ ...prev, [month]: updated }));
  };

  useEffect(() => {
    localStorage.setItem("finance_store", JSON.stringify(store));
  }, [store]);

  /* ---------- CALCULATIONS ---------- */
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = useMemo(() => getDaysInMonth(year, monthNumber), [year, monthNumber]);

  const monthlyIncome = useMemo(() => normalizeToMonthly(+data.income.amount || 0, data.income.frequency), [data.income]);

  const totalPercent = useMemo(() =>
    Object.values(data.categories).reduce((s, c) => s + Number(c.percent), 0),
    [data.categories]
  );

  const budgets = useMemo(() => {
    const result = {};
    Object.entries(data.categories).forEach(([key, c]) => {
      result[key] = {
        ...c,
        monthly: (monthlyIncome * c.percent) / 100,
        daily: ((monthlyIncome * c.percent) / 100) / daysInMonth,
      };
    });
    return result;
  }, [data.categories, monthlyIncome, daysInMonth]);

  const goalMonthly = data.goal.target && data.goal.months ? data.goal.target / data.goal.months : null;
  const savingsBudget = budgets.savings?.monthly || 0;

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-6">
      <header className="bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Smart Student Budget Planner</h1>
        <p className="text-sm text-gray-500">Plan ahead. Carry your budget month to month. Stay confident.</p>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-2 py-1 mt-2"
        />
      </header>

      {/* INCOME INPUT */}
      <Section title="Your Income">
        <div className="grid sm:grid-cols-4 gap-2">
          <input
            type="number"
            placeholder="Amount"
            className="input"
            value={data.income.amount}
            onChange={(e) => updateMonthData({ income: { ...data.income, amount: e.target.value } })}
          />
          <select
            className="input"
            value={data.income.type}
            onChange={(e) => updateMonthData({ income: { ...data.income, type: e.target.value } })}
          >
            <option>Allowance</option>
            <option>Salary</option>
            <option>Job</option>
            <option>Other</option>
          </select>
          <select
            className="input"
            value={data.income.frequency}
            onChange={(e) => updateMonthData({ income: { ...data.income, frequency: e.target.value } })}
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
          <div className="font-medium flex items-center">
            Monthly: ₵{monthlyIncome.toFixed(2)}
          </div>
        </div>
      </Section>

      {/* PERCENTAGE ALLOCATION */}
      <Section title="Budget Allocation (%)">
        {Object.entries(data.categories).map(([key, c]) => (
          <div key={key} className="grid grid-cols-3 gap-2 items-center">
            <span>{c.name}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={c.percent}
              onChange={(e) =>
                updateMonthData({ categories: { ...data.categories, [key]: { ...c, percent: e.target.value } } })
              }
            />
            <input
              type="number"
              className="input"
              value={c.percent}
              onChange={(e) =>
                updateMonthData({ categories: { ...data.categories, [key]: { ...c, percent: e.target.value } } })
              }
            />
          </div>
        ))}
        <p className={`font-medium ${totalPercent === 100 ? "text-green-600" : "text-red-600"}`}>
          Total Allocation: {totalPercent}%
        </p>
        {totalPercent !== 100 && <p className="text-sm text-gray-500">Adjust percentages to make 100%.</p>}
      </Section>

      {/* BUDGET BREAKDOWN */}
      <Section title="Your Monthly & Daily Budget">
        {Object.entries(budgets).map(([key, b]) => (
          <div key={key} className="flex justify-between border-b py-1">
            <span>{b.name}</span>
            <span>₵{b.monthly.toFixed(2)} / month (₵{b.daily.toFixed(2)} daily)</span>
          </div>
        ))}
      </Section>

      {/* SAVINGS GOAL */}
      <Section title="Savings & Investment Plan">
        <div className="grid sm:grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="Target amount"
            className="input"
            value={data.goal.target}
            onChange={(e) => updateMonthData({ goal: { ...data.goal, target: e.target.value } })}
          />
          <input
            type="number"
            placeholder="Deadline (months)"
            className="input"
            value={data.goal.months}
            onChange={(e) => updateMonthData({ goal: { ...data.goal, months: e.target.value } })}
          />
        </div>
        {goalMonthly ? (
          <>
            <p className="mt-2">
              You need to save <strong>₵{goalMonthly.toFixed(2)}</strong> per month.
            </p>
            {goalMonthly > savingsBudget && (
              <p className="text-sm text-orange-600">
                That’s tight. Consider trimming Food or Lifestyle slightly.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No goal yet — keep building strong habits 💪</p>
        )}
      </Section>

      {/* MONTHLY CHECK-IN */}
      <Section title="Monthly Check-in">
        {Object.entries(budgets).map(([key, b]) => (
          <div key={key} className="grid grid-cols-3 gap-2">
            <span>{b.name}</span>
            <input
              type="number"
              placeholder="Spent"
              className="input"
              value={data.spending[key] || ""}
              onChange={(e) =>
                updateMonthData({ spending: { ...data.spending, [key]: e.target.value } })
              }
            />
            <span className={data.spending[key] > b.monthly ? "text-red-600" : "text-green-600"}>
              ₵{(b.monthly - (data.spending[key] || 0)).toFixed(2)}
            </span>
          </div>
        ))}
        <p className="text-sm text-gray-500 mt-2">
          Red = overspent, Green = within budget. Progress over perfection!
        </p>
      </Section>
    </div>
  );
}

/* ---------------- UI HELPER ---------------- */
function Section({ title, children }) {
  return (
    <section className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
