import React, { useEffect, useMemo, useState } from "react";
import Table from "../components/Table.jsx";
import { apiFetch, clearAffiliateSession, getAffiliateToken } from "../utils/api.js";
import { formatNaira, shortWallet } from "../utils/format.js";

export default function Dashboard() {
  const token = getAffiliateToken();
  const [data, setData] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const progress = useMemo(() => {
    if (!data) return 0;
    return Math.min((data.affiliate.approvedWalletCount / data.requiredWallets) * 100, 100);
  }, [data]);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setError("");
    try {
      setData(await apiFetch("/affiliate/me", { token }));
    } catch (err) {
      handleSessionError(err);
    }
  }

  async function addWallet(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await apiFetch("/affiliate/members/add", { method: "POST", token, body: JSON.stringify({ walletAddress }) });
      setResults([response.result]);
      setWalletAddress("");
      setMessage("Wallet processed successfully");
      await loadDashboard();
    } catch (err) { handleSessionError(err); }
  }

  async function bulkUpload(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await apiFetch("/affiliate/members/bulk", { method: "POST", token, body: JSON.stringify({ walletsText: bulkText }) });
      setResults(response.results || []);
      setBulkText("");
      setMessage(`${response.totalSubmitted} wallets processed`);
      await loadDashboard();
    } catch (err) { handleSessionError(err); }
  }

  function handleSessionError(err) {
    if (err.status === 401) {
      clearAffiliateSession();
      location.href = "/";
      return;
    }
    setError(err.message);
  }

  function logout() {
    clearAffiliateSession();
    location.href = "/";
  }

  if (!data) return <main className="dashboardShell"><div className="panel">{error || "Loading affiliate dashboard..."}</div></main>;

  const affiliate = data.affiliate;

  return (
    <main className="dashboardShell">
      <section className="dashboardHero">
        <div><span className="pill">Affiliate Dashboard</span><h1>Welcome back, {affiliate.fullName}</h1><p>Track wallet uploads, verification status, eligibility, and payout records.</p></div>
        <button className="softButton" onClick={logout}>Logout</button>
      </section>
      <section className="profileStrip">
        <div><span>Name</span><strong>{affiliate.fullName}</strong></div>
        <div><span>Email</span><strong>{affiliate.email}</strong></div>
        <div><span>Wallet</span><strong>{shortWallet(affiliate.walletAddress)}</strong></div>
        <div><span>Status</span><strong>{affiliate.status}</strong></div>
      </section>
      {error ? <div className="errorBox">{error}</div> : null}
      {message ? <div className="successBox">{message}</div> : null}
      <section className="statsGrid">
        <div className="statCard"><span>Approved Wallets</span><strong>{affiliate.approvedWalletCount}/{data.requiredWallets}</strong></div>
        <div className="statCard"><span>Rejected Wallets</span><strong>{affiliate.rejectedWalletCount}</strong></div>
        <div className="statCard"><span>Remaining</span><strong>{data.remainingWallets}</strong></div>
        <div className="statCard highlight"><span>Weekly Reward</span><strong>{formatNaira(data.weeklyRewardNaira)}</strong></div>
      </section>
      <section className="panel">
        <div className="progressTop"><h2>Eligibility Progress</h2><strong>{progress.toFixed(0)}%</strong></div>
        <div className="progressBar"><div style={{ width: `${progress}%` }} /></div>
        <p className={affiliate.eligible ? "goodText" : "muted"}>{affiliate.eligible ? "You are eligible for weekly affiliate payout." : "Reach 100 approved wallets to become eligible."}</p>
      </section>
      <section className="uploadGrid">
        <div className="panel"><h2>Add one wallet</h2><form className="form" onSubmit={addWallet}><input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x smart wallet address" /><button className="primaryButton">Add Wallet</button></form></div>
        <div className="panel"><h2>Bulk upload wallets</h2><form className="form" onSubmit={bulkUpload}><textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="Paste wallet addresses here, one per line or comma separated" /><button className="primaryButton">Upload Wallets</button></form></div>
      </section>
      {results.length ? <section className="panel"><h2>Latest Upload Results</h2><Table columns={["Wallet", "Status", "Reason"]} rows={results.map((r) => ({ key: `${r.walletAddress}-${r.reason}`, cells: [r.walletAddress, <span className={r.status === "approved" ? "goodText" : "badText"}>{r.status}</span>, r.reason] }))} /></section> : null}
      <section className="contentGrid">
        <div className="panel"><h2>Recent Members</h2><Table columns={["Wallet", "Status", "Reason"]} rows={data.recentMembers.map((m) => ({ key: m._id, cells: [m.walletAddress, <span className={m.status === "approved" ? "goodText" : "badText"}>{m.status}</span>, m.rejectionReason || "-"] }))} /></div>
        <div className="panel"><h2>Payout History</h2><Table columns={["Cycle", "Amount", "Status", "Tx"]} rows={data.payouts.map((p) => ({ key: p._id, cells: [p.cycleKey, formatNaira(p.amountNaira), p.status, p.txHash || "-"] }))} /></div>
      </section>
    </main>
  );
}
