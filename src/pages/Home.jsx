import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, saveAffiliateToken } from "../utils/api.js";
import { formatNaira } from "../utils/format.js";

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("register");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", walletAddress: "", groupLink: "", password: "" });
  const [login, setLogin] = useState({ email: "", password: "" });

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function register(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/auth/affiliate/register", { method: "POST", body: JSON.stringify(form) });
      saveAffiliateToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  async function affiliateLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/auth/affiliate/login", { method: "POST", body: JSON.stringify(login) });
      saveAffiliateToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <section className="heroSection">
        <div className="heroText">
          <span className="pill">Verified Affiliate System</span>
          <h1>Build your StakersPro network and earn <span>{formatNaira(120000)} weekly</span></h1>
          <p>Register as an affiliate, upload group wallet addresses, and qualify when 100 verified StakersPro wallets are approved.</p>
          <div className="heroActions">
            <a className="primaryButton" href="#join">Join Affiliate Program</a>
            <a className="softButton" href="#how-it-works">See How It Works</a>
          </div>
        </div>
        <div className="heroCard">
          <div className="metricCircle"><strong>100</strong><span>Verified Wallets</span></div>
          <div className="rewardBox"><span>Weekly Reward</span><strong>{formatNaira(120000)}</strong><small>$80 equivalent</small></div>
        </div>
      </section>
      <section className="featureGrid">
        <div className="featureCard"><span>01</span><h3>Real verification</h3><p>Uploaded wallets are checked from the StakersPro database before they count.</p></div>
        <div className="featureCard"><span>02</span><h3>Retry rejected wallets</h3><p>If a wallet was not a StakersPro user before, upload it again after it becomes verified. and make sure the user has staked befor uploading</p></div>
        <div className="featureCard"><span>03</span><h3>Duplicate protection</h3><p>Approved wallets cannot be counted under multiple affiliate groups.</p></div>
      </section>
      <section id="join" className="authSection">
        <div className="authCard">
          <div className="tabRow">
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          </div>
          {mode === "register" ? (
            <form className="form" onSubmit={register}>
              <input placeholder="Full name" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
              <input placeholder="Email address" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
              <input placeholder="Phone number" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
              <input placeholder="Your wallet address" value={form.walletAddress} onChange={(e) => updateForm("walletAddress", e.target.value)} />
              <input placeholder="WhatsApp or Telegram group link" value={form.groupLink} onChange={(e) => updateForm("groupLink", e.target.value)} />
              <input type="password" placeholder="Password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
              <button className="primaryButton">Create Account</button>
            </form>
          ) : (
            <form className="form" onSubmit={affiliateLogin}>
              <input placeholder="Email address" value={login.email} onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))} />
              <input type="password" placeholder="Password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} />
              <button className="primaryButton">Login</button>
            </form>
          )}
          {error ? <div className="errorBox">{error}</div> : null}
        </div>
        <div id="how-it-works" className="stepsPanel">
          <h2>How it works</h2>
          <div className="stepItem"><strong>1</strong><p>Register and wait for admin approval.</p></div>
          <div className="stepItem"><strong>2</strong><p>Upload wallets from your group or downline.</p></div>
          <div className="stepItem"><strong>3</strong><p>System verifies wallets from the StakersPro database.</p></div>
          <div className="stepItem"><strong>4</strong><p>Reach 100 approved wallets and qualify for weekly payout.</p></div>
        </div>
      </section>
    </main>
  );
}
