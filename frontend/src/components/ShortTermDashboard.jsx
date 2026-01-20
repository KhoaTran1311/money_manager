import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getSpendingByPeriod,
  aggregateByCategory,
  getComparisonData,
  categoryColors,
  formatMoney,
} from "../data.js";

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
          {payload[0].payload.category || payload[0].name}
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

const PieTooltip = ({ active, payload }) => {
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
};

function ShortTermDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const { pieData, comparisonData, currentTotal, previousTotal, periodLabel } =
    useMemo(() => {
      const { currentTransactions, previousTransactions } =
        getSpendingByPeriod(selectedPeriod);
      const categoryData = aggregateByCategory(currentTransactions);
      const comparison = getComparisonData(selectedPeriod);

      const total = categoryData.reduce((sum, c) => sum + c.amount, 0);
      const prevTotal = comparison.reduce((sum, c) => sum + c.previous, 0);

      // Add total to each pie slice for percentage calculation
      const pieWithTotal = categoryData.map((c) => ({ ...c, total }));

      const labels = {
        week: { current: "This Week", previous: "Last Week" },
        month: { current: "This Month", previous: "Last Month" },
        year: { current: "This Year", previous: "Last Year" },
      };

      return {
        pieData: pieWithTotal,
        comparisonData: comparison,
        currentTotal: total,
        previousTotal: prevTotal,
        periodLabel: labels[selectedPeriod],
      };
    }, [selectedPeriod]);

  const totalChange = currentTotal - previousTotal;
  const percentChange =
    previousTotal > 0 ? ((totalChange / previousTotal) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedPeriod === option.value
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {periodLabel.current}
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {formatMoney(currentTotal)}
            </p>
          </div>
          <div
            className={`rounded-lg px-3 py-1 text-sm font-semibold ${
              totalChange > 0
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {totalChange > 0 ? "↑" : "↓"} {Math.abs(percentChange)}%
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800">
            Spending by Category
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {periodLabel.current} breakdown
          </p>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
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

        {/* Comparison Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800">
            Period Comparison
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {periodLabel.current} vs {periodLabel.previous}
          </p>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
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

    </div>
  );
}

export default ShortTermDashboard;

