import { API_URL } from "./config.js";

/**
 * fetch con JSON + Bearer si hay token.
 * Por que: el backend exige Authorization en rutas protegidas.
 */
export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (DELETE ok) no tiene body
  if (res.status === 204) {
    return { ok: true, status: 204, data: null };
  }

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}
