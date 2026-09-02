import { authenticate } from "../../../../lib/repository.js";
import { ok, badRequest, unauthorized } from "../../../../lib/http.js";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return badRequest("Email dan kata sandi wajib diisi.");
  }

  const user = await authenticate(body.email, body.password);
  if (!user) {
    return unauthorized();
  }

  // Mock session token — replace with a real signed JWT / server session in production.
  const token = `mock-session-${Buffer.from(user.email).toString("base64")}`;

  return ok({
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
  });
}
