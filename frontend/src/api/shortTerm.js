import { fetchJson } from "./client";

export const getTransactions = () => fetchJson("/short-term/transactions/");
export const createTransaction = (payload) =>
  fetchJson("/short-term/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const deleteTransaction = (id) =>
  fetchJson(`/short-term/transactions/${id}`, {
    method: "DELETE",
  });

export const updateTransaction = (id, payload) =>
  fetchJson(`/short-term/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const generateRecurringTransactions = (startDate, endDate) =>
  fetchJson("/short-term/recurring/generate", {
    method: "POST",
    body: JSON.stringify({ startDate, endDate }),
  });

export const getSubscriptions = () => fetchJson("/short-term/subscriptions/");
export const getAccounts = () => fetchJson("/short-term/accounts/");
export const getCreditCards = () => fetchJson("/short-term/credit-cards/");

