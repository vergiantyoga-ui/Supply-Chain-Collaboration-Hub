/**
 * Tiny in-memory + localStorage-backed holder for the current user's email.
 * client.js reads this to attach an X-User-Email header on every request —
 * the mock-auth stand-in the backend reads via lib/requestUser.js. In
 * production this header would be replaced by a real Authorization bearer
 * token verified server-side.
 */
const STORAGE_KEY = "psch.session";

export function getSessionEmail() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw)?.user?.email ?? null : null;
  } catch {
    return null;
  }
}
