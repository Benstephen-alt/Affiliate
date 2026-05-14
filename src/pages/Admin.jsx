import React, { useEffect, useState } from "react";
import Table from "../components/Table.jsx";
import { apiFetch, clearAdminSession, getAdminToken, saveAdminToken } from "../utils/api.js";
import { formatNaira, shortWallet } from "../utils/format.js";

export default function Admin() {
  const token = getAdminToken();
  const [login, setLogin] = useState({ email: "", password: "" });
  const [overview, setOverview] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [eligibleAffiliates, setEligibleAffiliates] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [cycleKey, setCycleKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (token) loadAll(); }, [token]);

  async function adminLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const response = await apiFetch("/auth/admin/login", { method: "POST", body: JSON.stringify(login) });
      saveAdminToken(response.token);
      location.reload();
    } catch (err) { setError(err.message); }
  }

  async function loadAll() {
    setError("");
    try {
      const [overviewRes, affiliatesRes, eligibleRes, payoutsRes] = await Promise.all([apiFetch("/admin/overview", { token }), apiFetch("/admin/affiliates", { token }), apiFetch("/admin/payouts/eligible", { token }), apiFetch("/admin/payouts", { token })]);
      setOverview(overviewRes); setAffiliates(affiliatesRes.affiliates || []); setEligibleAffiliates(eligibleRes.affiliates || []); setPayouts(payoutsRes.payouts || []);
    } catch (err) { handleSessionError(err); }
  }

  function handleSessionError(err) {
    if (err.status === 401) { clearAdminSession(); location.reload(); return; }
    setError(err.message);
  }

  async function updateStatus(id, status) {
    await apiFetch(`/admin/affiliates/${id}/status`, { method: "PATCH", token, body: JSON.stringify({ status }) });
    await loadAll();
  }

  async function createWeeklyPayouts() {
    const res = await apiFetch("/admin/payouts/create-weekly", { method: "POST", token, body: JSON.stringify({ cycleKey: cycleKey || undefined }) });
    setMessage(`Created or checked payout records for ${res.results.length} affiliates`);
    await loadAll();
  }

  async function markPaid(id) {
    const txHash = prompt("Enter transaction hash:");
    if (txHash === null) return;
    await apiFetch(`/admin/payouts/${id}/mark-paid`, { method: "PATCH", token, body: JSON.stringify({ txHash }) });
    await loadAll();
  }

  if (!token) {
    return <main className="authOnly"><div className="authCard adminLogin"><span className="pill">Admin Access</span><h1>Affiliate Admin</h1><form className="form" onSubmit={adminLogin}><input placeholder="Admin email" value={login.email} onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))} /><input type="password" placeholder="Admin password" value={login.password} onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))} /><button className="primaryButton">Login</button></form>{error ? <div className="errorBox">{error}</div> : null}</div></main>;
  }

  return (
    <main className="dashboardShell">
      <section className="dashboardHero"><div><span className="pill">Admin Dashboard</span><h1>Affiliate Program Control</h1><p>Approve affiliates, review eligibility, create weekly payout records, and monitor uploaded wallets.</p></div><button className="softButton" onClick={() => { clearAdminSession(); location.reload(); }}>Logout</button></section>
      {error ? <div className="errorBox">{error}</div> : null}{message ? <div className="successBox">{message}</div> : null}
      {overview ? <section className="statsGrid"><div className="statCard"><span>Total Affiliates</span><strong>{overview.totalAffiliates}</strong></div><div className="statCard"><span>Pending</span><strong>{overview.pendingAffiliates}</strong></div><div className="statCard"><span>Eligible</span><strong>{overview.eligibleAffiliates}</strong></div><div className="statCard highlight"><span>Weekly Reward</span><strong>{formatNaira(overview.weeklyRewardNaira)}</strong></div></section> : null}
      <section className="panel"><div className="payoutHeader"><div><h2>Weekly Payout</h2><p>Create pending payout records for eligible affiliates. Payment is still manual until marked paid.</p></div><div className="inlineForm"><input value={cycleKey} onChange={(e) => setCycleKey(e.target.value)} placeholder="Optional cycle e.g. 2026-W20" /><button className="primaryButton" onClick={createWeeklyPayouts}>Create Weekly Payouts</button></div></div></section>
      <section className="panel"><h2>Eligible Affiliates</h2><Table columns={["Name", "Wallet", "Approved", "Reward"]} rows={eligibleAffiliates.map((a) => ({ key: a._id, cells: [a.fullName, shortWallet(a.walletAddress), `${a.approvedWalletCount}/100`, formatNaira(a.weeklyRewardNaira)] }))} /></section>
      <section className="panel"><h2>All Affiliates</h2><div className="tableWrap"><table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Approved</th><th>Eligible</th><th>Actions</th></tr></thead><tbody>{affiliates.map((a) => <tr key={a._id}><td>{a.fullName}</td><td>{a.email}</td><td>{a.status}</td><td>{a.approvedWalletCount}/100</td><td>{a.eligible ? "Yes" : "No"}</td><td><div className="actionButtons"><button onClick={() => updateStatus(a._id, "approved")}>Approve</button><button onClick={() => updateStatus(a._id, "rejected")}>Reject</button><button onClick={() => updateStatus(a._id, "suspended")}>Suspend</button></div></td></tr>)}</tbody></table></div></section>
      <section className="panel"><h2>Payout Records</h2><div className="tableWrap"><table><thead><tr><th>Affiliate</th><th>Wallet</th><th>Cycle</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{payouts.map((p) => <tr key={p._id}><td>{p.affiliateId?.fullName || "-"}</td><td>{shortWallet(p.walletAddress)}</td><td>{p.cycleKey}</td><td>{formatNaira(p.amountNaira)}</td><td>{p.status}</td><td>{p.status !== "paid" ? <button onClick={() => markPaid(p._id)}>Mark Paid</button> : p.txHash || "Paid"}</td></tr>)}</tbody></table></div></section>
    </main>
  );
}
