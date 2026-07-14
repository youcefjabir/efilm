"use client";

import { useEffect, useState } from "react";

type Stats = {
  providers: Record<string, string | boolean>;
  flags: Record<string, boolean>;
  usageByKind: { kind: string; total: number; cost: number; count: number }[];
  jobStats: { type: string; status: string; count: number }[];
  avgRender: { mode: string; avgSeconds: number; count: number }[];
  gateStats: { passed: boolean; count: number }[];
  recentJobs: {
    id: string;
    type: string;
    status: string;
    error: string | null;
    message: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  recentAudit: { id: string; actorEmail: string | null; action: string; subject: string | null; createdAt: string }[];
};

export function SystemClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () =>
      fetch("/api/system/stats")
        .then((r) => r.json())
        .then((d) => (d.error ? setError(d.error) : setStats(d)))
        .catch(() => setError("Could not load stats"));
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (error) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!stats) return <div className="page"><p className="muted">Loading…</p></div>;

  const totalCost = stats.usageByKind.reduce((a, u) => a + u.cost, 0);
  const gatePass = stats.gateStats.find((g) => g.passed)?.count ?? 0;
  const gateFail = stats.gateStats.find((g) => !g.passed)?.count ?? 0;
  const fallbackRate = gatePass + gateFail > 0 ? gateFail / (gatePass + gateFail) : 0;
  const failedJobs = stats.jobStats.filter((j) => j.status === "failed").reduce((a, j) => a + j.count, 0);

  return (
    <div className="page">
      <h1>System</h1>
      <p className="muted">Cost, jobs, quality gates and provider status.</p>

      <div className="grid cols-4" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Total estimated cost</h3>
          <p style={{ fontSize: "1.5rem", margin: 0 }}>${totalCost.toFixed(3)}</p>
        </div>
        <div className="panel">
          <h3>Failed jobs</h3>
          <p style={{ fontSize: "1.5rem", margin: 0 }}>{failedJobs}</p>
        </div>
        <div className="panel">
          <h3>Gate first-pass failures</h3>
          <p style={{ fontSize: "1.5rem", margin: 0 }}>{Math.round(fallbackRate * 100)}%</p>
        </div>
        <div className="panel">
          <h3>Avg render time</h3>
          {stats.avgRender.map((r) => (
            <p key={r.mode} style={{ margin: 0 }}>
              {r.mode}: {r.avgSeconds ? r.avgSeconds.toFixed(0) : "–"}s{" "}
              <span className="faint">({r.count})</span>
            </p>
          ))}
          {stats.avgRender.length === 0 && <p className="faint" style={{ margin: 0 }}>no renders yet</p>}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <h2>Providers &amp; flags</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(stats.providers).map(([k, v]) => (
            <span key={k} className="badge">
              {k}: {String(v)}
            </span>
          ))}
          {Object.entries(stats.flags).map(([k, v]) => (
            <span key={k} className={`badge ${v ? "warn" : ""}`}>
              {k}: {String(v)}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Usage</h2>
        <table className="data">
          <thead>
            <tr><th>Kind</th><th>Quantity</th><th>Events</th><th>Est. cost</th></tr>
          </thead>
          <tbody>
            {stats.usageByKind.map((u) => (
              <tr key={u.kind}>
                <td>{u.kind}</td>
                <td className="mono">{Math.round(u.total).toLocaleString()}</td>
                <td className="mono">{u.count}</td>
                <td className="mono">${u.cost.toFixed(4)}</td>
              </tr>
            ))}
            {stats.usageByKind.length === 0 && (
              <tr><td colSpan={4} className="faint">No usage yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Recent jobs</h2>
        <table className="data">
          <thead>
            <tr><th>Type</th><th>Status</th><th>Message / error</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {stats.recentJobs.map((j) => (
              <tr key={j.id}>
                <td>{j.type}</td>
                <td>
                  <span className={`badge ${j.status === "completed" ? "ok" : j.status === "failed" ? "err" : ""}`}>
                    {j.status}
                  </span>
                </td>
                <td className="mono" style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {j.error ?? j.message ?? ""}
                </td>
                <td className="faint">{new Date(j.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Audit log</h2>
        <table className="data">
          <thead>
            <tr><th>Actor</th><th>Action</th><th>Subject</th><th>When</th></tr>
          </thead>
          <tbody>
            {stats.recentAudit.map((a) => (
              <tr key={a.id}>
                <td>{a.actorEmail ?? "—"}</td>
                <td>{a.action}</td>
                <td className="mono">{a.subject ?? ""}</td>
                <td className="faint">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
