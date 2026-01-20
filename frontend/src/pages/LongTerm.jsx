import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import NetworthChart from "../components/NetworthChart.jsx";
import { portfolioHoldings } from "../data.js";
import { formatMoney } from "../utils/format.js";

const BREAKDOWN_TABS = [
  {
    id: "assetType",
    label: "Asset Type",
    description: "Allocation grouped by security type.",
  },
  {
    id: "broker",
    label: "Broker",
    description: "Holdings split by brokerage accounts.",
  },
  {
    id: "sector",
    label: "Sector",
    description: "Sector exposure across your holdings.",
  },
  {
    id: "currency",
    label: "Currencies",
    description: "Currency mix across portfolio assets.",
  },
  {
    id: "country",
    label: "Countries",
    description: "Geographic distribution of holdings.",
  },
  {
    id: "topAssets",
    label: "Top Assets",
    description: "Largest positions by market value.",
  },
];

const COLOR_PALETTE = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#38bdf8",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#ef4444",
];

const buildBreakdown = (items, getKey) => {
  const grouped = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (!grouped.has(key)) {
      grouped.set(key, 0);
    }
    grouped.set(key, grouped.get(key) + item.value);
  });
  return Array.from(grouped.entries()).map(([key, value]) => ({
    key,
    label: key,
    value,
  }));
};

const buildTopAssets = (items, limit = 5) => {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, limit).map((item) => ({
    key: item.ticker,
    label: `${item.ticker} · ${item.name}`,
    value: item.value,
  }));
  const remainderValue = sorted
    .slice(limit)
    .reduce((sum, item) => sum + item.value, 0);
  if (remainderValue > 0) {
    top.push({
      key: "Other",
      label: "Other",
      value: remainderValue,
    });
  }
  return top;
};

const formatBreakdownData = (items, total) =>
  items
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      percent: total ? (item.value / total) * 100 : 0,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <p className="text-sm font-medium" style={{ color: data.color }}>
          {data.label}
        </p>
        <p className="text-sm text-slate-600">{formatMoney(data.value)}</p>
        <p className="text-xs text-slate-400">
          {data.percent.toFixed(1)}% of total
        </p>
      </div>
    );
  }

  return null;
};

function LongTerm() {
  const [selectedBreakdown, setSelectedBreakdown] = useState("assetType");

  const holdingsWithValues = useMemo(
    () =>
      portfolioHoldings.map((holding) => ({
        ...holding,
        value: holding.price * holding.shares,
      })),
    []
  );

  const holdingsTotal = useMemo(
    () => holdingsWithValues.reduce((sum, holding) => sum + holding.value, 0),
    [holdingsWithValues]
  );

  const breakdownData = useMemo(() => {
    switch (selectedBreakdown) {
      case "broker":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) => holding.broker),
          holdingsTotal
        );
      case "sector":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) => holding.sector),
          holdingsTotal
        );
      case "currency":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) => holding.currency),
          holdingsTotal
        );
      case "country":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) => holding.country),
          holdingsTotal
        );
      case "topAssets":
        return formatBreakdownData(buildTopAssets(holdingsWithValues), holdingsTotal);
      case "assetType":
      default:
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) => holding.type),
          holdingsTotal
        );
    }
  }, [holdingsTotal, holdingsWithValues, selectedBreakdown]);

  const breakdownMeta =
    BREAKDOWN_TABS.find((tab) => tab.id === selectedBreakdown) ??
    BREAKDOWN_TABS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-500">
              Long Term Money
            </p>
            <h1 className="text-2xl font-semibold">Investments & Allocation</h1>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <NetworthChart />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Portfolio Breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">
                {breakdownMeta.description}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 px-4 py-3 text-right">
              <p className="text-xs uppercase text-indigo-500">Total Holdings</p>
              <p className="text-lg font-semibold text-indigo-700">
                {formatMoney(holdingsTotal)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {BREAKDOWN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedBreakdown(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selectedBreakdown === tab.id
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {breakdownData.map((category) => (
                      <Cell key={category.key} fill={category.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {breakdownData.map((category) => (
                <div
                  key={category.key}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {category.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {category.percent.toFixed(1)}% allocation
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatMoney(category.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Holdings Detail</h2>
              <p className="mt-1 text-sm text-slate-500">
                Every position across brokers and custody platforms.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Ticker</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Security Type</th>
                  <th className="px-3 py-2 text-right">Current Price</th>
                  <th className="px-3 py-2 text-right">Shares</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">Pct Change</th>
                  <th className="px-3 py-2 text-right">Amt Change</th>
                  <th className="px-3 py-2">Broker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portfolioHoldings.map((holding) => {
                  const value = holding.price * holding.shares;
                  const isPositive = holding.pctChange >= 0;
                  return (
                    <tr key={`${holding.ticker}-${holding.broker}`}>
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {holding.ticker}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{holding.name}</td>
                      <td className="px-3 py-3 text-slate-600">{holding.type}</td>
                      <td className="px-3 py-3 text-right text-slate-700">
                        {formatMoney(holding.price)}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-700">
                        {holding.shares}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-900">
                        {formatMoney(value)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-medium ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {holding.pctChange.toFixed(2)}%
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-medium ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatMoney(holding.amountChange)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {holding.broker}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LongTerm;

