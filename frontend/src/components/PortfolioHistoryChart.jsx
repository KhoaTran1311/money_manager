import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "../utils/format.js";

const formatChartDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const HistoryTooltip = ({ active, payload, label, isPortfolio }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const point = payload[0]?.payload;
  const metricLabel = isPortfolio ? "Total value" : "Price";

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-slate-900">{formatChartDate(label)}</p>
      <p className="text-sm text-indigo-600">
        {metricLabel}: {formatMoney(payload[0].value)}
      </p>
      {!isPortfolio && point?.value ? (
        <p className="text-xs text-slate-500">Position: {formatMoney(point.value)}</p>
      ) : null}
    </div>
  );
};

function PortfolioHistoryChart({ assets = [] }) {
  const [selectedView, setSelectedView] = useState("portfolio");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const assetOptions = useMemo(
    () =>
      assets.map((asset) => ({
        id: asset.id,
        label: [asset.ticker, asset.name].filter(Boolean).join(" · "),
      })),
    [assets]
  );

  useEffect(() => {
    if (selectedView === "portfolio") {
      return;
    }
    const exists = assetOptions.some((asset) => asset.id === selectedView);
    if (!exists) {
      setSelectedView("portfolio");
    }
  }, [assetOptions, selectedView]);

  useEffect(() => {
    let isActive = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint =
          selectedView === "portfolio"
            ? "/api/long-term/prices/portfolio/"
            : `/api/long-term/prices/assets/${selectedView}/`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Unable to load price history.");
        }
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        if (!isActive) {
          return;
        }
        if (selectedView === "portfolio") {
          setHistory(
            rows.map((item) => ({
              date: item.date,
              metric: Number(item.value) || 0,
            }))
          );
        } else {
          setHistory(
            rows.map((item) => ({
              date: item.date,
              metric: Number(item.price) || 0,
              value: Number(item.value) || null,
            }))
          );
        }
      } catch (err) {
        if (isActive) {
          setError(err?.message || "Unable to load price history.");
          setHistory([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isActive = false;
    };
  }, [selectedView]);

  const latestPoint = history[history.length - 1];
  const isPortfolio = selectedView === "portfolio";
  const headline = isPortfolio ? "Portfolio value" : "Asset price";
  const headlineValue = latestPoint?.metric;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Portfolio History
          </p>
          <h2 className="text-lg font-semibold">Daily price snapshots</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track portfolio totals or drill into a single asset.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-right">
            <p className="text-xs uppercase text-indigo-500">{headline}</p>
            <p className="text-2xl font-semibold text-indigo-700">
              {headlineValue ? formatMoney(headlineValue) : "—"}
            </p>
          </div>
          <label className="text-sm text-slate-600">
            View
            <select
              className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={selectedView}
              onChange={(event) => setSelectedView(event.target.value)}
            >
              <option value="portfolio">Portfolio total</option>
              {assetOptions.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.label || asset.id}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading price history...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-rose-600">
            {error}
          </div>
        ) : history.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis
                tickFormatter={formatMoney}
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={90}
              />
              <Tooltip
                content={<HistoryTooltip isPortfolio={isPortfolio} />}
                cursor={{ stroke: "#cbd5f5", strokeDasharray: "4 4" }}
              />
              <Line
                type="monotone"
                dataKey="metric"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No price snapshots yet. Run a daily snapshot to populate history.
          </div>
        )}
      </div>
    </section>
  );
}

export default PortfolioHistoryChart;
