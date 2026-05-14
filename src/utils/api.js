export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4100/api";

export function getAffiliateToken() {
  return localStorage.getItem("affiliate_token") || "";
}

export function getAdminToken() {
  return localStorage.getItem("affiliate_admin_token") || "";
}

export function saveAffiliateToken(token) {
  localStorage.setItem("affiliate_token", token);
}

export function saveAdminToken(token) {
  localStorage.setItem("affiliate_admin_token", token);
}

export function clearAffiliateSession() {
  localStorage.removeItem("affiliate_token");
}

export function clearAdminSession() {
  localStorage.removeItem("affiliate_admin_token");
}

export async function apiFetch(path, options = {}) {
  const token = options.token || "";

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}
