import { ok } from "../../../../lib/http.js";

/**
 * Stub SSO endpoint. In production this route (or a dedicated /auth/callback
 * route) would complete a SAML 2.0 / OpenID Connect handshake with the
 * corporate Identity Provider (PRD section 6) and issue a real session.
 * For this mock build it simulates a successful internal-staff SSO login.
 */
export async function POST() {
  const token = "mock-sso-session";
  return ok({
    token,
    user: { id: "11111111-1111-1111-1111-111111111111", email: "reviewer@paragon-corp.com", role: "internal_staff", fullName: "Nadia Putri" },
  });
}
