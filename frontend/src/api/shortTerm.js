import { fetchJson } from "./client";

export const getTransactions = () => fetchJson("/short-term/transactions/");
export const createTransaction = (payload) =>
  fetchJson("/short-term/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getSubscriptions = () => fetchJson("/short-term/subscriptions/");
export const getAccounts = () => fetchJson("/short-term/accounts/");
export const getCreditCards = () => fetchJson("/short-term/credit-cards/");

