import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isDashboardPage = location.pathname.startsWith("/dashboard");

  return (
    <header className="siteHeader">
      <Link className="brand" to="/">
        <span className="brandMark">X</span>
        <span>
          <strong>StakersPro</strong>
          <small>Affiliate Program</small>
        </span>
      </Link>

      <nav className="headerNav">
        {!isDashboardPage && !isAdminPage && (
          <>
            <Link to="/">Home</Link>
            <a href="#how-it-works">How it works</a>
          </>
        )}

        {isAdminPage && (
          <Link className="active" to="/admin">
            Admin Panel
          </Link>
        )}
      </nav>
    </header>
  );
}
