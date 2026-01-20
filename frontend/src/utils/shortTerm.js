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

const normalizeTransactions = (transactions) =>
  transactions.map((t) => ({
    ...t,
    amount: Number(t.amount ?? 0),
    dateObj: new Date(t.date),
  }));

const getDateRange = (period, now) => {
  let currentStart;
  let currentEnd;
  let previousStart;
  let previousEnd;

  if (period === "week") {
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
    currentStart = new Date(now.getFullYear(), 0, 1);
    currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    previousStart = new Date(now.getFullYear() - 1, 0, 1);
    previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
};

export const getSpendingByPeriod = (transactions, period, now = new Date()) => {
  const normalized = normalizeTransactions(transactions);
  const { currentStart, currentEnd, previousStart, previousEnd } = getDateRange(period, now);

  const currentTransactions = normalized.filter(
    (t) => t.dateObj >= currentStart && t.dateObj <= currentEnd
  );
  const previousTransactions = normalized.filter(
    (t) => t.dateObj >= previousStart && t.dateObj <= previousEnd
  );

  return { currentTransactions, previousTransactions };
};

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

export const getComparisonData = (transactions, period) => {
  const { currentTransactions, previousTransactions } = getSpendingByPeriod(transactions, period);

  const currentByCategory = aggregateByCategory(currentTransactions);
  const previousByCategory = aggregateByCategory(previousTransactions);

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

