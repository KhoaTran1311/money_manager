export const assets = [
  { label: "Cash", value: 3200 },
  { label: "Stocks", value: 12500 },
  { label: "Crypto", value: 2100 },
  { label: "Retirement", value: 18400 },
];

export const portfolio = [
  { label: "Stocks", percent: 55 },
  { label: "Bonds", percent: 20 },
  { label: "Cash", percent: 15 },
  { label: "Alternative", percent: 10 },
];

const NETWORTH_NOW = new Date("2026-01-19");

const monthlyNetworthHistory = (() => {
  const points = [];
  let value = 42000;
  const monthlyDeltas = [800, 1200, -500, 1400, 600, 900, -300, 1100, 700, 500, -200, 1000];

  for (let i = 23; i >= 2; i -= 1) {
    const date = new Date(NETWORTH_NOW);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    value += monthlyDeltas[(23 - i) % monthlyDeltas.length];
    points.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(value),
    });
  }

  return points;
})();

const dailyNetworthHistory = (() => {
  const points = [];
  let value = monthlyNetworthHistory[monthlyNetworthHistory.length - 1]?.value ?? 52000;
  const dailyDeltas = [120, -40, 60, -20, 80, -50, 30];

  for (let i = 60; i >= 0; i -= 1) {
    const date = new Date(NETWORTH_NOW);
    date.setDate(date.getDate() - i);
    value += dailyDeltas[(60 - i) % dailyDeltas.length];
    points.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(value),
    });
  }

  return points;
})();

export const networthHistory = [...monthlyNetworthHistory, ...dailyNetworthHistory];

export const networthCategories = [
  { key: "cash", label: "Cash", percent: 12, color: "#38bdf8" },
  { key: "bonds", label: "Bonds", percent: 18, color: "#22c55e" },
  { key: "stocks", label: "Stocks", percent: 45, color: "#6366f1" },
  { key: "crypto", label: "Crypto", percent: 8, color: "#f59e0b" },
  { key: "realEstate", label: "Real Estate", percent: 17, color: "#a855f7" },
];

export const networthCategoryHistory = networthHistory.map((point, index) => {
  const adjustedPercents = networthCategories.map((category, categoryIndex) => {
    const drift = Math.sin((index + categoryIndex) * 0.6) * 2;
    return category.percent + drift;
  });
  const totalPercent = adjustedPercents.reduce((sum, value) => sum + value, 0);

  const entry = { date: point.date, total: point.value };
  networthCategories.forEach((category, categoryIndex) => {
    const normalized = adjustedPercents[categoryIndex] / totalPercent;
    entry[category.key] = Math.round(point.value * normalized);
  });

  return entry;
});

export const portfolioHoldings = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    type: "Stock",
    price: 187.12,
    shares: 24,
    pctChange: 1.8,
    amountChange: 78.4,
    broker: "Fidelity",
    sector: "Technology",
    currency: "USD",
    country: "United States",
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    type: "ETF",
    price: 441.55,
    shares: 10,
    pctChange: -0.6,
    amountChange: -26.3,
    broker: "Vanguard",
    sector: "Large Cap",
    currency: "USD",
    country: "United States",
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond ETF",
    type: "Bond",
    price: 72.31,
    shares: 36,
    pctChange: 0.3,
    amountChange: 7.8,
    broker: "Vanguard",
    sector: "Fixed Income",
    currency: "USD",
    country: "United States",
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    type: "Crypto",
    price: 48250,
    shares: 0.18,
    pctChange: 2.4,
    amountChange: 203.2,
    broker: "Coinbase",
    sector: "Digital Assets",
    currency: "USD",
    country: "Global",
  },
  {
    ticker: "ETH",
    name: "Ethereum",
    type: "Crypto",
    price: 3250,
    shares: 1.4,
    pctChange: -1.2,
    amountChange: -54.6,
    broker: "Coinbase",
    sector: "Digital Assets",
    currency: "USD",
    country: "Global",
  },
  {
    ticker: "CASH",
    name: "High-Yield Savings",
    type: "Cash",
    price: 1,
    shares: 6400,
    pctChange: 0.1,
    amountChange: 6.4,
    broker: "Marcus",
    sector: "Cash",
    currency: "USD",
    country: "United States",
  },
];

// Subscriptions data
