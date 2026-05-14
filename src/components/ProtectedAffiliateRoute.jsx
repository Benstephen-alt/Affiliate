import React from "react";
import { Navigate } from "react-router-dom";
import { getAffiliateToken } from "../utils/api.js";

export default function ProtectedAffiliateRoute({ children }) {
  const token = getAffiliateToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
