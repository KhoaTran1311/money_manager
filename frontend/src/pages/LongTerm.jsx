import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

const EMPTY_ASSET = {
  boughtPrice: "",
  shares: "",
  value: "",
  broker: "",
  sector: "",
  industry: "",
  countries: "",
  currency: "",
  ticker: "",
  name: "",
  type: "",
};

const PUBLIC_SECURITY_TYPES = ["Stock", "ETF", "Crypto"];

const mapQuoteType = (quoteType) => {
  switch (quoteType) {
    case "EQUITY":
      return "Stock";
    case "ETF":
      return "ETF";
    case "CRYPTOCURRENCY":
      return "Crypto";
    case "MUTUALFUND":
      return "Mutual Fund";
    case "BOND":
      return "Bond";
    case "INDEX":
      return "Index";
    default:
      return "Other";
  }
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeLabel = (value, fallback = "Unspecified") => {
  if (typeof value === "string" && value.trim().length) {
    return value.trim();
  }
  return fallback;
};

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

const buildCountryBreakdown = (items) => {
  const grouped = new Map();
  items.forEach((item) => {
    const rawCountries = item.countries ?? "";
    const countries = rawCountries
      .split(",")
      .map((country) => country.trim())
      .filter(Boolean);
    if (!countries.length) {
      const fallback = "Unspecified";
      grouped.set(fallback, (grouped.get(fallback) || 0) + item.value);
      return;
    }
    const share = item.value / countries.length;
    countries.forEach((country) => {
      grouped.set(country, (grouped.get(country) || 0) + share);
    });
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
    key: item.id,
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
  const [assets, setAssets] = useState([]);
  const [assetForm, setAssetForm] = useState(EMPTY_ASSET);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetFlow, setAssetFlow] = useState("public");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [lastQuotePrice, setLastQuotePrice] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingResults, setIsSearchingResults] = useState(false);
  const [searchResultsError, setSearchResultsError] = useState("");
  const [highlightedResult, setHighlightedResult] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState("assetType");
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState("");
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  const holdingsWithValues = useMemo(
    () =>
      assets.map((holding) => ({
        ...holding,
        boughtPrice: Number(holding.boughtPrice) || 0,
        shares: Number(holding.shares) || 0,
        value: Number(holding.value) || 0,
      })),
    [assets]
  );

  const holdingsTotal = useMemo(
    () => holdingsWithValues.reduce((sum, holding) => sum + holding.value, 0),
    [holdingsWithValues]
  );

  const breakdownData = useMemo(() => {
    switch (selectedBreakdown) {
      case "broker":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) =>
            normalizeLabel(holding.broker)
          ),
          holdingsTotal
        );
      case "sector":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) =>
            normalizeLabel(holding.sector)
          ),
          holdingsTotal
        );
      case "currency":
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) =>
            normalizeLabel(holding.currency)
          ),
          holdingsTotal
        );
      case "country":
        return formatBreakdownData(buildCountryBreakdown(holdingsWithValues), holdingsTotal);
      case "topAssets":
        return formatBreakdownData(buildTopAssets(holdingsWithValues), holdingsTotal);
      case "assetType":
      default:
        return formatBreakdownData(
          buildBreakdown(holdingsWithValues, (holding) =>
            normalizeLabel(holding.type)
          ),
          holdingsTotal
        );
    }
  }, [holdingsTotal, holdingsWithValues, selectedBreakdown]);

  const breakdownMeta =
    BREAKDOWN_TABS.find((tab) => tab.id === selectedBreakdown) ??
    BREAKDOWN_TABS[0];

  useEffect(() => {
    const fetchAssets = async () => {
      setAssetsLoading(true);
      setAssetsError("");
      try {
        const response = await fetch("/api/long-term/assets/");
        if (!response.ok) {
          throw new Error("Failed to load assets.");
        }
        const data = await response.json();
        setAssets(Array.isArray(data) ? data : []);
      } catch (error) {
        setAssetsError(error?.message || "Unable to load assets.");
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    if (!isAssetModalOpen) {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isAssetModalOpen]);

  useEffect(() => {
    if (!isAssetModalOpen || assetFlow !== "public") {
      return undefined;
    }
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchResultsError("");
      return undefined;
    }
    const timeout = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [assetFlow, isAssetModalOpen, searchQuery]);

  const handleAssetChange = (field) => (event) => {
    const nextValue = event.target.value;
    setAssetForm((prev) => {
      const updated = { ...prev, [field]: nextValue };
      if (field === "shares" || field === "boughtPrice") {
        const shares = Number(field === "shares" ? nextValue : prev.shares);
        const boughtPrice = Number(
          field === "boughtPrice" ? nextValue : prev.boughtPrice
        );
        if (!Number.isNaN(shares) && !Number.isNaN(boughtPrice)) {
          updated.value = String((shares * boughtPrice).toFixed(2));
        } else {
          updated.value = "";
        }
      }
      return updated;
    });
  };

  const resetForm = () => {
    setAssetForm(EMPTY_ASSET);
    setEditingId(null);
    setFormError("");
    setIsAssetModalOpen(false);
    setAssetFlow("public");
    setSearchQuery("");
    setSearchError("");
    setLastQuotePrice(null);
    setSearchResults([]);
    setSearchResultsError("");
    setHighlightedResult(-1);
    setShowSearchResults(false);
  };

  const openAddAssetModal = () => {
    setAssetForm(EMPTY_ASSET);
    setEditingId(null);
    setFormError("");
    setAssetFlow("public");
    setSearchQuery("");
    setSearchError("");
    setLastQuotePrice(null);
    setSearchResults([]);
    setSearchResultsError("");
    setHighlightedResult(-1);
    setShowSearchResults(false);
    setIsAssetModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const requiredFields = [
      "ticker",
      "name",
      "type",
      "boughtPrice",
      "shares",
      "broker",
    ];
    const missing = requiredFields.filter(
      (field) => !String(assetForm[field]).trim()
    );
    if (missing.length) {
      setFormError("Please fill out all required fields.");
      return;
    }

    const boughtPrice = Number(assetForm.boughtPrice);
    const shares = Number(assetForm.shares);
    if ([boughtPrice, shares].some((num) => Number.isNaN(num))) {
      setFormError("Please enter valid numbers for price and shares.");
      return;
    }
    const value = boughtPrice * shares;

    const nextAsset = {
      id: editingId ?? createId(),
      ticker: assetForm.ticker.trim().toUpperCase(),
      name: assetForm.name.trim(),
      type: assetForm.type.trim(),
      boughtPrice,
      shares,
      value,
      broker: assetForm.broker.trim(),
      sector: assetForm.sector.trim(),
      industry: assetForm.industry.trim(),
      countries: assetForm.countries.trim(),
      currency: assetForm.currency.trim(),
    };

    const saveAsset = async () => {
      setIsSavingAsset(true);
      setFormError("");
      try {
        const response = await fetch(
          editingId ? `/api/long-term/assets/${editingId}/` : "/api/long-term/assets/",
          {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextAsset),
          }
        );
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload.error || "Unable to save asset.");
        }
        const savedAsset = await response.json();
        setAssets((prev) => {
          if (editingId) {
            return prev.map((asset) => (asset.id === editingId ? savedAsset : asset));
          }
          return [savedAsset, ...prev];
        });
        resetForm();
      } catch (error) {
        setFormError(error?.message || "Unable to save asset.");
      } finally {
        setIsSavingAsset(false);
      }
    };

    saveAsset();
  };

  const handleEdit = (asset) => {
    setEditingId(asset.id);
    setAssetForm({
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      boughtPrice: String(asset.boughtPrice),
      shares: String(asset.shares),
      value: String(asset.value),
      broker: asset.broker,
      sector: asset.sector ?? "",
      industry: asset.industry ?? "",
      countries: asset.countries ?? "",
      currency: asset.currency ?? "",
    });
    setFormError("");
    setAssetFlow(
      PUBLIC_SECURITY_TYPES.includes(asset.type) ? "public" : "private"
    );
    setSearchQuery(asset.ticker || "");
    setSearchError("");
    setLastQuotePrice(null);
    setSearchResults([]);
    setSearchResultsError("");
    setHighlightedResult(-1);
    setShowSearchResults(false);
    setIsAssetModalOpen(true);
  };

  const handleSearch = async (overrideQuery) => {
    const trimmed = (overrideQuery ?? searchQuery).trim();
    if (!trimmed) {
      setSearchError("Enter a ticker or symbol to search.");
      return;
    }
    setIsSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `/api/market/quote/?symbols=${encodeURIComponent(trimmed)}`
      );
      if (!response.ok) {
        throw new Error("Quote lookup failed.");
      }
      const quote = await response.json();
      if (!quote || quote.error) {
        throw new Error(quote?.error || "No results found for that symbol.");
      }
      const marketPrice = Number(quote.regularMarketPrice);
      setLastQuotePrice(Number.isNaN(marketPrice) ? null : marketPrice);
      setAssetForm((prev) => {
        const shares = Number(prev.shares);
        const nextValue =
          !Number.isNaN(marketPrice) && shares > 0 ? marketPrice * shares : null;
        return {
          ...prev,
          ticker: (quote.symbol || trimmed).toUpperCase(),
          name: quote.shortName || quote.longName || prev.name,
          type: mapQuoteType(quote.quoteType),
          boughtPrice: !Number.isNaN(marketPrice)
            ? String(marketPrice)
            : prev.boughtPrice,
          value:
            typeof nextValue === "number" ? String(nextValue.toFixed(2)) : "",
          currency: quote.currency || "",
          sector: quote.sector || "",
          industry: quote.industry || "",
        };
      });
    } catch (error) {
      setSearchError(error?.message || "Could not fetch asset data.");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchResultsError("");
      return;
    }
    setIsSearchingResults(true);
    setSearchResultsError("");
    try {
      const response = await fetch(
        `/api/market/search/?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Search failed.");
      }
      const results = await response.json();
      setSearchResults(Array.isArray(results) ? results : []);
      setShowSearchResults(true);
      setHighlightedResult(-1);
    } catch (error) {
      setSearchResultsError(error?.message || "Search failed.");
      setSearchResults([]);
    } finally {
      setIsSearchingResults(false);
    }
  };

  const handleSearchSelect = async (result) => {
    const symbol = result?.symbol || result?.ticker || "";
    if (!symbol) {
      return;
    }
    setSearchQuery(symbol);
    setSearchResults([]);
    setSearchResultsError("");
    setHighlightedResult(-1);
    setShowSearchResults(false);
    await handleSearch(symbol);
  };

  const handleDelete = async (assetId) => {
    try {
      const response = await fetch(`/api/long-term/assets/${assetId}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete asset.");
      }
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      if (editingId === assetId) {
        resetForm();
      }
    } catch (error) {
      setFormError(error?.message || "Unable to delete asset.");
    }
  };

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
            {breakdownData.length ? (
              <>
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
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500 lg:col-span-2">
                Add assets to see portfolio breakdown insights.
              </div>
            )}
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
            <button
              type="button"
              onClick={openAddAssetModal}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Add Asset
            </button>
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
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assetsLoading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      Loading assets...
                    </td>
                  </tr>
                ) : assetsError ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-sm text-rose-600"
                    >
                      {assetsError}
                    </td>
                  </tr>
                ) : holdingsWithValues.length ? (
                  holdingsWithValues.map((holding) => {
                    const currentPrice =
                      holding.shares > 0 ? holding.value / holding.shares : 0;
                    const pctChange =
                      holding.boughtPrice > 0
                        ? ((currentPrice - holding.boughtPrice) /
                            holding.boughtPrice) *
                          100
                        : 0;
                    const amountChange =
                      (currentPrice - holding.boughtPrice) * holding.shares;
                    const isPositive = pctChange >= 0;

                    return (
                      <tr key={holding.id}>
                        <td className="px-3 py-3 font-semibold text-slate-900">
                          {holding.ticker}
                        </td>
                        <td className="px-3 py-3 text-slate-700">{holding.name}</td>
                        <td className="px-3 py-3 text-slate-600">{holding.type}</td>
                        <td className="px-3 py-3 text-right text-slate-700">
                          {formatMoney(currentPrice)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-700">
                          {holding.shares}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-900">
                          {formatMoney(holding.value)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-medium ${
                            isPositive ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {pctChange.toFixed(2)}%
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-medium ${
                            isPositive ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {formatMoney(amountChange)}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {holding.broker}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(holding)}
                              className="text-xs font-semibold text-indigo-600"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(holding.id)}
                              className="text-xs font-semibold text-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      No assets added yet. Use “Add Asset” to add your first
                      holding.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {isAssetModalOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={resetForm}
            aria-label="Close asset form"
          />
          <div className="relative z-10 flex h-full items-start justify-center p-4">
            <div className="w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Asset" : "Add Asset"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the asset details to keep your portfolio up to date.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Asset type</p>
                <p className="mt-1 text-xs text-slate-500">
                  Choose how this asset should be added before searching.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAssetFlow("public")}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      assetFlow === "public"
                        ? "border-indigo-200 bg-white shadow-sm"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold text-slate-800">
                      Public security
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Stock / ETF / Crypto (supports search + autofill)
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetFlow("private")}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      assetFlow === "private"
                        ? "border-indigo-200 bg-white shadow-sm"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold text-slate-800">
                      Private / Alternative
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Real estate / Art / Collectible / Private equity / Other
                    </p>
                  </button>
                </div>
              </div>

              {assetFlow === "public" ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Search asset
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Search by ticker or name to autofill details.
                  </p>
                  <div className="relative mt-3">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onFocus={() => {
                        if (searchResults.length) {
                          setShowSearchResults(true);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!showSearchResults || !searchResults.length) {
                          return;
                        }
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setHighlightedResult((prev) =>
                            Math.min(prev + 1, searchResults.length - 1)
                          );
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setHighlightedResult((prev) => Math.max(prev - 1, 0));
                        } else if (event.key === "Enter") {
                          event.preventDefault();
                          const result = searchResults[highlightedResult];
                          if (result) {
                            handleSearchSelect(result);
                          }
                        } else if (event.key === "Escape") {
                          setShowSearchResults(false);
                        }
                      }}
                      placeholder="Search by ticker or name"
                    />
                    {showSearchResults && searchResults.length ? (
                      <div className="absolute z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                        {searchResults.map((result, index) => (
                          <button
                            key={`${result.symbol}-${index}`}
                            type="button"
                            onMouseDown={() => handleSearchSelect(result)}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                              index === highlightedResult
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="font-semibold">
                              {result.symbol}
                            </span>
                            <span className="ml-2 flex-1 truncate text-xs text-slate-500">
                              {result.name}
                            </span>
                            {result.exchange ? (
                              <span className="ml-3 text-xs text-slate-400">
                                {result.exchange}
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {isSearchingResults ? (
                    <p className="mt-2 text-xs text-slate-500">Searching...</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="rounded-lg border border-indigo-200 bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                    {lastQuotePrice ? (
                      <span className="text-xs text-slate-500">
                        Last quote: {formatMoney(lastQuotePrice)}
                      </span>
                    ) : null}
                  </div>
                  {searchResultsError ? (
                    <p className="mt-2 text-sm text-rose-600">
                      {searchResultsError}
                    </p>
                  ) : null}
                  {searchError ? (
                    <p className="mt-2 text-sm text-rose-600">{searchError}</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Private assets use the manual entry flow below.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Shares *
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    type="number"
                    step="0.0001"
                    value={assetForm.shares}
                    onChange={handleAssetChange("shares")}
                    placeholder="10"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Bought Price *
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    type="number"
                    step="0.01"
                    value={assetForm.boughtPrice}
                    onChange={handleAssetChange("boughtPrice")}
                    placeholder="120.50"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Value *
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    type="number"
                    step="0.01"
                    value={assetForm.value}
                    readOnly
                    placeholder="1800"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Broker *
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={assetForm.broker}
                    onChange={handleAssetChange("broker")}
                    placeholder="Fidelity"
                  />
                </label>
              </div>

              <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Additional metadata (searchable)
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm text-slate-600">
                    Ticker *
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                      value={assetForm.ticker}
                      onChange={handleAssetChange("ticker")}
                      readOnly={assetFlow === "public"}
                      aria-readonly={assetFlow === "public"}
                      placeholder={assetFlow === "public" ? "Search first" : "PRIVATE-001"}
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Name *
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={assetForm.name}
                      onChange={handleAssetChange("name")}
                      placeholder="Apple Inc."
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Security Type *
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={assetForm.type}
                      onChange={handleAssetChange("type")}
                      placeholder={
                        assetFlow === "public"
                          ? "Stock, ETF, Crypto"
                          : "Real estate, Art, Collectible"
                      }
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Sector (optional)
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={assetForm.sector}
                      onChange={handleAssetChange("sector")}
                      placeholder="Technology"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Industry (optional)
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={assetForm.industry}
                      onChange={handleAssetChange("industry")}
                      placeholder="Consumer Electronics"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Countries (optional)
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={assetForm.countries}
                      onChange={handleAssetChange("countries")}
                      placeholder="United States, Canada"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Currency (optional)
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={assetForm.currency}
                      onChange={handleAssetChange("currency")}
                      placeholder="USD"
                    />
                  </label>
                </div>
              </details>

              {formError ? (
                <p className="text-sm text-rose-600">{formError}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  disabled={isSavingAsset}
                >
                  {isSavingAsset
                    ? "Saving..."
                    : editingId
                    ? "Update Asset"
                    : "Add Asset"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LongTerm;

