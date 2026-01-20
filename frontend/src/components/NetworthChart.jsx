import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { assets, formatMoney, networthHistory } from "../data.js";

const RANGE_OPTIONS = [
  { value: "1w", label: "1W", days: 7 },
  { value: "1m", label: "1M", days: 30 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "2y", label: "2Y", days: 730 },
];

const formatNetworthDate = (dateString, range) => {
  const date = new Date(dateString);
  if (range === "1w" || range === "1m") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const NetworthTooltip = ({ active, payload, label, range }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-slate-900">
          {formatNetworthDate(label, range)}
        </p>
        <p className="text-sm text-indigo-600">{formatMoney(payload[0].value)}</p>
      </div>
    );
  }

  return null;
};

function NetworthChart({
  title = "Net Worth Trend",
  description = "Track how your net worth has moved over time.",
  eyebrow,
  showLink = false,
  linkTo = "/longterm",
  linkLabel = "View Details →",
  className = "",
}) {
  const totalAssets = assets.reduce((sum, item) => sum + item.value, 0);
  const [selectedRange, setSelectedRange] = useState("1y");

  const scaledHistory = useMemo(() => {
    if (!networthHistory.length) {
      return [];
    }

    const latestRawValue = networthHistory[networthHistory.length - 1]?.value ?? totalAssets;
    const scale = latestRawValue ? totalAssets / latestRawValue : 1;

    return networthHistory.map((point) => ({
      ...point,
      value: Math.round(point.value * scale),
    }));
  }, [totalAssets]);

  const { filteredHistory, currentPoint } = useMemo(() => {
    if (!scaledHistory.length) {
      return { filteredHistory: [], currentPoint: null };
    }

    const range = RANGE_OPTIONS.find((option) => option.value === selectedRange);
    const rangeDays = range?.days ?? 365;
    const lastDate = new Date(scaledHistory[scaledHistory.length - 1].date);
    const startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() - rangeDays);

    const filtered = scaledHistory.filter(
      (point) => new Date(point.date) >= startDate
    );

    return {
      filteredHistory: filtered,
      currentPoint: filtered[filtered.length - 1] ?? null,
    };
  }, [scaledHistory, selectedRange]);

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-right">
            <p className="text-xs uppercase text-indigo-500">Current Net Worth</p>
            <p className="text-2xl font-semibold text-indigo-700">
              {formatMoney(currentPoint?.value ?? totalAssets)}
            </p>
          </div>
          {showLink ? (
            <Link
              to={linkTo}
              className="rounded-lg border border-indigo-200 bg-indigo-500 px-4 py-2 text-sm font-medium text-white"
            >
              {linkLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedRange(option.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              selectedRange === option.value
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatNetworthDate(value, selectedRange)}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              tickFormatter={(value) => formatMoney(value)}
              tick={{ fontSize: 12, fill: "#64748b" }}
              width={90}
            />
            <Tooltip
              content={<NetworthTooltip range={selectedRange} />}
              cursor={{ stroke: "#cbd5f5", strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.date}
                y={currentPoint.value}
                r={6}
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: formatMoney(currentPoint.value),
                  position: "top",
                  fill: "#4f46e5",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default NetworthChart;

