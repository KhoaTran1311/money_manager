import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getAccounts,
  getCreditCards,
  getSubscriptions,
  getTransactions,
  createTransaction,
} from "../api/shortTerm.js";
import { formatMoney, formatMoneyDecimal } from "../utils/format.js";
import {
  aggregateByCategory,
  categoryColors,
  getComparisonData,
  getSpendingByPeriod,
} from "../utils/shortTerm.js";

const PERIOD_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-slate-900">
          {payload[0].payload.category}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatMoney(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ShortTerm() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [allTransactions, setAllTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [accountBalances, setAccountBalances] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
  });

  useEffect(() => {
    let isActive = true;

    Promise.all([getTransactions(), getSubscriptions(), getAccounts(), getCreditCards()])
      .then(([transactionsData, subscriptionsData, accountsData, creditCardsData]) => {
        if (!isActive) return;
        setAllTransactions(transactionsData);
        setSubscriptions(subscriptionsData);
        setAccountBalances(accountsData);
        setCreditCards(creditCardsData);
      })
      .catch(() => {
        if (!isActive) return;
        setAllTransactions([]);
        setSubscriptions([]);
        setAccountBalances([]);
        setCreditCards([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const {
    pieData,
    comparisonData,
    currentTotal,
    previousTotal,
    periodLabel,
    transactions: periodTransactions,
  } = useMemo(() => {
    const { currentTransactions } = getSpendingByPeriod(allTransactions, selectedPeriod);
    const categoryData = aggregateByCategory(currentTransactions);
    const comparison = getComparisonData(allTransactions, selectedPeriod);

    const total = categoryData.reduce((sum, c) => sum + c.amount, 0);
    const prevTotal = comparison.reduce((sum, c) => sum + c.previous, 0);

    const pieWithTotal = categoryData.map((c) => ({ ...c, total }));

    const labels = {
      week: { current: "This Week", previous: "Last Week" },
      month: { current: "This Month", previous: "Last Month" },
      year: { current: "This Year", previous: "Last Year" },
    };

    // Get formatted transactions for table
    const formattedTransactions = currentTransactions.map((t, idx) => ({
      ...t,
      id: t.id ?? idx,
      dateFormatted: t.dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    }));

    return {
      pieData: pieWithTotal,
      comparisonData: comparison,
      currentTotal: total,
      previousTotal: prevTotal,
      periodLabel: labels[selectedPeriod],
      transactions: formattedTransactions,
    };
  }, [selectedPeriod, allTransactions]);

  // Sorted transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...periodTransactions];
    sorted.sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === "date") {
        aVal = a.dateObj;
        bVal = b.dateObj;
      } else if (sortConfig.key === "amount") {
        aVal = a.amount;
        bVal = b.amount;
      } else if (sortConfig.key === "category") {
        aVal = a.category;
        bVal = b.category;
      } else {
        aVal = a.description;
        bVal = b.description;
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [periodTransactions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const categoryOptions = Object.keys(categoryColors);

  const handleOpenModal = () => {
    setFormError("");
    setFormData({
      date: "",
      description: "",
      category: categoryOptions[0] || "Other",
      amount: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.date || !formData.category || !formData.amount) {
      setFormError("Date, category, and amount are required.");
      return;
    }

    const payload = {
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
    };

    try {
      setIsSaving(true);
      const created = await createTransaction(payload);
      setAllTransactions((prev) => [created, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Unable to save transaction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalChange = currentTotal - previousTotal;
  const percentChange =
    previousTotal > 0 ? ((totalChange / previousTotal) * 100).toFixed(1) : 0;

  // Subscriptions calculations
  const monthlySubscriptionCost = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === "monthly") return sum + sub.amount;
    return sum + sub.amount / 12;
  }, 0);

  const upcomingSubscriptions = subscriptions
    .filter((sub) => sub.nextBilling)
    .filter((sub) => {
      const nextDate = new Date(sub.nextBilling);
      const now = new Date();
      const daysDiff = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
      return daysDiff <= 14 && daysDiff >= 0;
    })
    .sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling));

  // Account totals
  const totalAccountBalance = accountBalances.reduce((sum, acc) => sum + acc.balance, 0);

  // Credit card totals
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + Math.abs(card.currentBalance), 0);
  const totalPoints = creditCards.reduce((sum, card) => sum + (card.pointsBalance || 0), 0);
  const totalPointsValue = creditCards.reduce(
    (sum, card) => sum + (card.pointsBalance || 0) * (card.pointsValue || 0),
    0
  );
  const totalCashbackEarned = creditCards.reduce(
    (sum, card) => sum + (card.cashbackEarned || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-500">
              Short Term Money
            </p>
            <h1 className="text-2xl font-semibold">Spending Details</h1>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading short-term data...
          </div>
        )}
        {/* Top Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {periodLabel.current} Spending
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatMoney(currentTotal)}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  totalChange > 0 ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {totalChange > 0 ? "↑" : "↓"} {Math.abs(percentChange)}%
              </span>
              <span className="text-xs text-slate-400">vs {periodLabel.previous.toLowerCase()}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account Balances
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatMoney(totalAccountBalance)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Across {accountBalances.length} accounts
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Monthly Subscriptions
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {formatMoneyDecimal(monthlySubscriptionCost)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {subscriptions.length} active subscriptions
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Credit Card Points
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {totalPoints.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Worth ~{formatMoney(totalPointsValue)}
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedPeriod === option.value
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Comparison Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Category Breakdown</h3>
            <p className="mt-1 text-sm text-slate-500">{periodLabel.current} spending by category</p>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                            <p className="text-sm font-medium" style={{ color: data.color }}>
                              {data.category}
                            </p>
                            <p className="text-sm text-slate-600">{formatMoney(data.amount)}</p>
                            <p className="text-xs text-slate-400">
                              {((data.amount / data.total) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {pieData.map((entry) => (
                <div key={entry.category} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-slate-600">{entry.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Comparison */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Period Comparison</h3>
            <p className="mt-1 text-sm text-slate-500">
              {periodLabel.current} vs {periodLabel.previous}
            </p>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                    angle={-30}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                  <Bar
                    dataKey="current"
                    name={periodLabel.current}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="previous"
                    name={periodLabel.previous}
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction Details Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Transaction Details</h3>
              <p className="mt-1 text-sm text-slate-500">
                {periodTransactions.length} transactions in {periodLabel.current.toLowerCase()}
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              + Add Transaction
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th
                    className="cursor-pointer pb-3 text-left font-semibold text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("date")}
                  >
                    Date {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="cursor-pointer pb-3 text-left font-semibold text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("description")}
                  >
                    Description {sortConfig.key === "description" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="cursor-pointer pb-3 text-left font-semibold text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("category")}
                  >
                    Category {sortConfig.key === "category" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="cursor-pointer pb-3 text-right font-semibold text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("amount")}
                  >
                    Amount {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      No transactions yet. Add your first entry to populate this table.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="py-3 text-slate-500">{tx.dateFormatted}</td>
                      <td className="py-3 font-medium text-slate-800">{tx.description || "—"}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${categoryColors[tx.category] || categoryColors.Other}15`,
                            color: categoryColors[tx.category] || categoryColors.Other,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: categoryColors[tx.category] || categoryColors.Other }}
                          />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-800">
                        {formatMoney(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Subscriptions Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Subscriptions</h3>
                <p className="text-sm text-slate-500">Recurring payments</p>
              </div>
              <div className="rounded-lg bg-purple-50 px-3 py-1.5">
                <p className="text-sm font-bold text-purple-600">
                  {formatMoneyDecimal(monthlySubscriptionCost)}/mo
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingSubscriptions.length > 0 && (
                <div className="rounded-lg bg-amber-50 px-3 py-2">
                  <p className="text-xs font-semibold text-amber-700">Upcoming in next 14 days</p>
                </div>
              )}
              {subscriptions.slice(0, 5).map((sub) => {
                const nextDate = sub.nextBilling ? new Date(sub.nextBilling) : null;
                const isUpcoming = upcomingSubscriptions.find((s) => s.id === sub.id);
                return (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      isUpcoming ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sub.icon || "🔔"}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{sub.name}</p>
                        <p className="text-xs text-slate-500">
                          {nextDate
                            ? nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "No billing date"}
                          {isUpcoming && <span className="ml-1 text-amber-600">• Soon</span>}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatMoneyDecimal(sub.amount)}
                      <span className="text-xs text-slate-400">
                        /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </p>
                  </div>
                );
              })}
              {subscriptions.length > 5 && (
                <p className="text-center text-xs text-slate-400">
                  +{subscriptions.length - 5} more subscriptions
                </p>
              )}
            </div>
          </div>

          {/* Account Balances Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Account Balances</h3>
                <p className="text-sm text-slate-500">Bank accounts</p>
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-1.5">
                <p className="text-sm font-bold text-blue-600">{formatMoney(totalAccountBalance)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {accountBalances.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{account.icon || "🏦"}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{account.name}</p>
                      <p className="text-xs text-slate-500">
                        {account.institution} {account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      {formatMoneyDecimal(account.balance)}
                    </p>
                    {account.apy && (
                      <p className="text-xs text-emerald-500">{account.apy}% APY</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Card Rewards Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Credit Card Rewards</h3>
                <p className="text-sm text-slate-500">Points & cash back</p>
              </div>
              <div className="rounded-lg bg-amber-50 px-3 py-1.5">
                <p className="text-sm font-bold text-amber-600">{totalPoints.toLocaleString()} pts</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {creditCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: `${card.color || "#e2e8f0"}08` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{card.icon || "💳"}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{card.name}</p>
                        <p className="text-xs text-slate-500">
                          •••• {card.lastFour} • {card.type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                    <div>
                      <p className="text-xs text-slate-500">Balance</p>
                      <p className="text-sm font-semibold text-rose-600">
                        {formatMoneyDecimal(Math.abs(card.currentBalance))}
                      </p>
                    </div>
                    <div className="text-right">
                      {card.pointsBalance ? (
                        <>
                          <p className="text-xs text-slate-500">{card.pointsName}</p>
                          <p className="text-sm font-semibold text-amber-600">
                            {card.pointsBalance.toLocaleString()} pts
                          </p>
                          <p className="text-xs text-slate-400">
                            ≈ {formatMoney(card.pointsBalance * card.pointsValue)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-slate-500">Cash Back Earned</p>
                          <p className="text-sm font-semibold text-emerald-600">
                            {formatMoneyDecimal(card.cashbackEarned)}
                          </p>
                          <p className="text-xs text-slate-400">{card.cashbackRate}% rate</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-emerald-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Total Rewards Value</p>
                <p className="text-lg font-bold text-emerald-600">
                  ~{formatMoney(totalPointsValue + totalCashbackEarned)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                  New Transaction
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Add manual spending entry
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Date
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Category
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    required
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Description
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Grocery run"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Amount
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </label>

              {formError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortTerm;
