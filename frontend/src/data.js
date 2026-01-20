export const budgetItems = [
  { label: "Rent", amount: 1200 },
  { label: "Groceries", amount: 350 },
  { label: "Transport", amount: 150 },
  { label: "Utilities", amount: 120 },
];

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

// Category colors for consistent styling
export const categoryColors = {
  Groceries: "#10b981",
  Transport: "#3b82f6",
  Entertainment: "#f59e0b",
  Dining: "#ef4444",
  Shopping: "#8b5cf6",
  Utilities: "#06b6d4",
  Healthcare: "#ec4899",
  Other: "#6b7280",
};

// Spending transactions with dates for time-based analysis
export const spendingTransactions = [
  // This week (Mon-Sun, assuming today is mid-week)
  { date: "2026-01-12", category: "Groceries", amount: 45, description: "Weekly groceries" },
  { date: "2026-01-12", category: "Transport", amount: 12, description: "Bus fare" },
  { date: "2026-01-13", category: "Dining", amount: 28, description: "Lunch with friends" },
  { date: "2026-01-13", category: "Entertainment", amount: 15, description: "Movie ticket" },
  { date: "2026-01-14", category: "Shopping", amount: 65, description: "New shoes" },
  { date: "2026-01-14", category: "Groceries", amount: 22, description: "Snacks" },
  { date: "2026-01-15", category: "Transport", amount: 35, description: "Uber ride" },
  { date: "2026-01-15", category: "Utilities", amount: 85, description: "Electric bill" },
  { date: "2026-01-16", category: "Healthcare", amount: 40, description: "Pharmacy" },
  { date: "2026-01-17", category: "Dining", amount: 52, description: "Dinner date" },
  { date: "2026-01-18", category: "Groceries", amount: 78, description: "Weekend groceries" },
  { date: "2026-01-19", category: "Entertainment", amount: 25, description: "Concert ticket" },

  // Last week
  { date: "2026-01-05", category: "Groceries", amount: 52, description: "Weekly groceries" },
  { date: "2026-01-05", category: "Transport", amount: 18, description: "Metro card" },
  { date: "2026-01-06", category: "Dining", amount: 35, description: "Birthday dinner" },
  { date: "2026-01-06", category: "Entertainment", amount: 45, description: "Concert" },
  { date: "2026-01-07", category: "Shopping", amount: 120, description: "Winter jacket" },
  { date: "2026-01-07", category: "Groceries", amount: 18, description: "Coffee beans" },
  { date: "2026-01-08", category: "Transport", amount: 28, description: "Taxi" },
  { date: "2026-01-08", category: "Utilities", amount: 45, description: "Internet bill" },
  { date: "2026-01-09", category: "Healthcare", amount: 25, description: "Vitamins" },
  { date: "2026-01-10", category: "Dining", amount: 42, description: "Restaurant" },
  { date: "2026-01-11", category: "Groceries", amount: 65, description: "Groceries" },

  // Earlier this month (first week)
  { date: "2026-01-01", category: "Entertainment", amount: 100, description: "New Year party" },
  { date: "2026-01-01", category: "Dining", amount: 85, description: "Holiday dinner" },
  { date: "2026-01-02", category: "Shopping", amount: 200, description: "Post-holiday sale" },
  { date: "2026-01-03", category: "Groceries", amount: 95, description: "Restocking" },
  { date: "2026-01-04", category: "Transport", amount: 50, description: "Trip to mall" },

  // Last month (December 2025)
  { date: "2025-12-28", category: "Groceries", amount: 180, description: "Holiday groceries" },
  { date: "2025-12-27", category: "Shopping", amount: 350, description: "Christmas gifts" },
  { date: "2025-12-26", category: "Dining", amount: 120, description: "Family dinner" },
  { date: "2025-12-25", category: "Entertainment", amount: 50, description: "Christmas movie" },
  { date: "2025-12-20", category: "Transport", amount: 80, description: "Holiday travel" },
  { date: "2025-12-15", category: "Utilities", amount: 150, description: "Heating bill" },
  { date: "2025-12-10", category: "Healthcare", amount: 60, description: "Check-up" },
  { date: "2025-12-05", category: "Groceries", amount: 75, description: "Weekly groceries" },
  { date: "2025-12-01", category: "Shopping", amount: 90, description: "Winter clothes" },

  // Two months ago (November 2025)
  { date: "2025-11-25", category: "Dining", amount: 200, description: "Thanksgiving dinner" },
  { date: "2025-11-20", category: "Groceries", amount: 250, description: "Thanksgiving groceries" },
  { date: "2025-11-15", category: "Shopping", amount: 150, description: "Black Friday early" },
  { date: "2025-11-10", category: "Entertainment", amount: 80, description: "Concert tickets" },
  { date: "2025-11-05", category: "Transport", amount: 60, description: "Trip" },
  { date: "2025-11-01", category: "Utilities", amount: 120, description: "Bills" },

  // Last year same period (January 2025)
  { date: "2025-01-15", category: "Groceries", amount: 55, description: "Weekly groceries" },
  { date: "2025-01-15", category: "Transport", amount: 15, description: "Bus" },
  { date: "2025-01-14", category: "Dining", amount: 30, description: "Lunch" },
  { date: "2025-01-13", category: "Entertainment", amount: 20, description: "Movie" },
  { date: "2025-01-12", category: "Shopping", amount: 80, description: "Clothes" },
  { date: "2025-01-10", category: "Utilities", amount: 70, description: "Bills" },
  { date: "2025-01-08", category: "Healthcare", amount: 35, description: "Medicine" },
  { date: "2025-01-05", category: "Groceries", amount: 60, description: "Groceries" },
  { date: "2025-01-02", category: "Dining", amount: 45, description: "New Year brunch" },
  { date: "2025-01-01", category: "Entertainment", amount: 75, description: "New Year event" },
];

// Helper function to get spending data for a specific time range
export const getSpendingByPeriod = (period) => {
  const now = new Date("2026-01-19"); // Current date
  const transactions = spendingTransactions.map((t) => ({
    ...t,
    date: new Date(t.date),
  }));

  let currentStart, currentEnd, previousStart, previousEnd;

  if (period === "week") {
    // Get Monday of current week
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - mondayOffset);
    currentStart.setHours(0, 0, 0, 0);
    currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);
    currentEnd.setHours(23, 59, 59, 999);

    previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 7);
    previousEnd = new Date(currentEnd);
    previousEnd.setDate(currentEnd.getDate() - 7);
  } else if (period === "month") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else {
    // year
    currentStart = new Date(now.getFullYear(), 0, 1);
    currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    previousStart = new Date(now.getFullYear() - 1, 0, 1);
    previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  }

  const currentTransactions = transactions.filter(
    (t) => t.date >= currentStart && t.date <= currentEnd
  );
  const previousTransactions = transactions.filter(
    (t) => t.date >= previousStart && t.date <= previousEnd
  );

  return { currentTransactions, previousTransactions, currentStart, currentEnd, previousStart, previousEnd };
};

// Aggregate spending by category
export const aggregateByCategory = (transactions) => {
  const byCategory = {};
  transactions.forEach((t) => {
    if (!byCategory[t.category]) {
      byCategory[t.category] = 0;
    }
    byCategory[t.category] += t.amount;
  });
  return Object.entries(byCategory).map(([category, amount]) => ({
    category,
    amount,
    color: categoryColors[category] || categoryColors.Other,
  }));
};

// Get comparison data for chart
export const getComparisonData = (period) => {
  const { currentTransactions, previousTransactions } = getSpendingByPeriod(period);

  const currentByCategory = aggregateByCategory(currentTransactions);
  const previousByCategory = aggregateByCategory(previousTransactions);

  // Get all unique categories
  const allCategories = [
    ...new Set([
      ...currentByCategory.map((c) => c.category),
      ...previousByCategory.map((c) => c.category),
    ]),
  ];

  return allCategories.map((category) => {
    const current = currentByCategory.find((c) => c.category === category);
    const previous = previousByCategory.find((c) => c.category === category);
    return {
      category,
      current: current?.amount || 0,
      previous: previous?.amount || 0,
      color: categoryColors[category] || categoryColors.Other,
    };
  });
};

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
export const subscriptions = [
  {
    id: 1,
    name: "Netflix",
    category: "Entertainment",
    amount: 15.99,
    billingCycle: "monthly",
    nextBilling: "2026-02-01",
    icon: "🎬",
    status: "active",
  },
  {
    id: 2,
    name: "Spotify",
    category: "Entertainment",
    amount: 10.99,
    billingCycle: "monthly",
    nextBilling: "2026-01-25",
    icon: "🎵",
    status: "active",
  },
  {
    id: 3,
    name: "iCloud Storage",
    category: "Utilities",
    amount: 2.99,
    billingCycle: "monthly",
    nextBilling: "2026-01-28",
    icon: "☁️",
    status: "active",
  },
  {
    id: 4,
    name: "Gym Membership",
    category: "Healthcare",
    amount: 49.99,
    billingCycle: "monthly",
    nextBilling: "2026-02-05",
    icon: "💪",
    status: "active",
  },
  {
    id: 5,
    name: "Adobe Creative Cloud",
    category: "Shopping",
    amount: 54.99,
    billingCycle: "monthly",
    nextBilling: "2026-02-10",
    icon: "🎨",
    status: "active",
  },
  {
    id: 6,
    name: "Amazon Prime",
    category: "Shopping",
    amount: 139,
    billingCycle: "yearly",
    nextBilling: "2026-06-15",
    icon: "📦",
    status: "active",
  },
  {
    id: 7,
    name: "YouTube Premium",
    category: "Entertainment",
    amount: 13.99,
    billingCycle: "monthly",
    nextBilling: "2026-01-22",
    icon: "▶️",
    status: "active",
  },
];

// Account balances data
export const accountBalances = [
  {
    id: 1,
    name: "Primary Checking",
    institution: "Chase Bank",
    type: "checking",
    balance: 4250.82,
    lastUpdated: "2026-01-19",
    accountNumber: "****4521",
    icon: "🏦",
  },
  {
    id: 2,
    name: "High-Yield Savings",
    institution: "Marcus by Goldman Sachs",
    type: "savings",
    balance: 12500.0,
    lastUpdated: "2026-01-19",
    accountNumber: "****8832",
    apy: 4.5,
    icon: "💰",
  },
  {
    id: 3,
    name: "Emergency Fund",
    institution: "Ally Bank",
    type: "savings",
    balance: 8750.25,
    lastUpdated: "2026-01-18",
    accountNumber: "****2201",
    apy: 4.25,
    icon: "🛡️",
  },
  {
    id: 4,
    name: "Travel Fund",
    institution: "SoFi",
    type: "savings",
    balance: 2340.0,
    lastUpdated: "2026-01-19",
    accountNumber: "****6654",
    apy: 4.0,
    icon: "✈️",
  },
];

// Credit card rewards data
export const creditCards = [
  {
    id: 1,
    name: "Chase Sapphire Preferred",
    institution: "Chase",
    type: "Travel",
    lastFour: "4892",
    currentBalance: -1245.67,
    creditLimit: 15000,
    pointsBalance: 48250,
    pointsName: "Ultimate Rewards",
    pointsValue: 0.02, // $ per point
    cashbackRate: null,
    rewardsThisMonth: 1250,
    icon: "💎",
    color: "#1a365d",
  },
  {
    id: 2,
    name: "Citi Double Cash",
    institution: "Citi",
    type: "Cash Back",
    lastFour: "7721",
    currentBalance: -892.34,
    creditLimit: 10000,
    pointsBalance: null,
    pointsName: null,
    pointsValue: null,
    cashbackRate: 2.0,
    cashbackEarned: 156.42,
    rewardsThisMonth: 32.5,
    icon: "💵",
    color: "#065f46",
  },
  {
    id: 3,
    name: "Amex Gold",
    institution: "American Express",
    type: "Travel & Dining",
    lastFour: "1005",
    currentBalance: -2156.89,
    creditLimit: 20000,
    pointsBalance: 72400,
    pointsName: "Membership Rewards",
    pointsValue: 0.018,
    cashbackRate: null,
    rewardsThisMonth: 3200,
    icon: "✨",
    color: "#92400e",
  },
];

export const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatMoneyDecimal = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

