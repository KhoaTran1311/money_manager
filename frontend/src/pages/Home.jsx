import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ShortTermDashboard from "../components/ShortTermDashboard.jsx";
import NetworthStackedChart from "../components/NetworthStackedChart.jsx";
import { getHealth } from "../api/health.js";

function Home() {
  const [backendStatus, setBackendStatus] = useState({
    state: "loading",
    message: "Connecting…",
  });

  useEffect(() => {
    let isActive = true;

    getHealth()
      .then(() => {
        if (!isActive) return;
        setBackendStatus({ state: "ok", message: "Backend connected" });
      })
      .catch(() => {
        if (!isActive) return;
        setBackendStatus({ state: "error", message: "Backend unavailable" });
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Money Manager Prototype
            </p>
            <h1 className="text-2xl font-semibold">Overview Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                backendStatus.state === "ok"
                  ? "bg-emerald-100 text-emerald-700"
                  : backendStatus.state === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {backendStatus.message}
            </span>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Export Summary
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        {/* Short Term Money Dashboard */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
                Short Term Money
              </p>
              <h2 className="mt-2 text-xl font-semibold">Day-to-Day Spending</h2>
              <p className="mt-1 text-sm text-slate-500">
                Track and compare your spending patterns over time.
              </p>
            </div>
            <Link
              to="/shortterm"
              className="rounded-lg border border-emerald-200 bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              View Details →
            </Link>
          </div>
          <ShortTermDashboard />
        </section>

        <NetworthStackedChart
          eyebrow="Long Term Money"
          title="Net Worth Composition"
          description="See how each category contributes to your net worth over time."
          showLink
        />
      </main>
    </div>
  );
}

export default Home;

