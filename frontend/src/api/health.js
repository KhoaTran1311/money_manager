import { fetchJson } from "./client";

export const getHealth = () => fetchJson("/health/");

