const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

import { getSessionEmail } from "./session.js";

/**
 * Thin fetch wrapper shared by every module in src/api/*.
 * Every backend response follows { success, data } or { success:false, message, errors }.
 * This wrapper normalizes both into either a resolved value or a thrown ApiError,
 * so calling code (pages/components) can just try/catch.
 */
export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors || null;
  }
}

export async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const sessionEmail = getSessionEmail();

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(sessionEmail ? { "X-User-Email": sessionEmail } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError("Tidak dapat terhubung ke server. Periksa koneksi Anda dan pastikan backend berjalan.", {
      status: 0,
    });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // no JSON body (e.g. 204) — treat as empty success payload
  }

  if (!response.ok || (payload && payload.success === false)) {
    throw new ApiError(payload?.message || `Permintaan gagal (${response.status}).`, {
      status: response.status,
      errors: payload?.errors,
    });
  }

  return payload?.data ?? null;
}
