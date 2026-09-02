/**
 * Reads the logged-in user's email from the X-User-Email request header.
 *
 * This is a MOCK auth stand-in. The frontend attaches this header on every
 * authenticated request (see frontend/src/api/client.js). In production,
 * replace this with real session/JWT verification — the header should never
 * be trusted as-is once real authentication exists, since a client could
 * set it to any value.
 */
export function getRequestUserEmail(request) {
  return request.headers.get("x-user-email") || null;
}
