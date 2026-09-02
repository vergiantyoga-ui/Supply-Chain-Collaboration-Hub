import { requestPasswordReset } from "../../../../lib/repository.js";
import { ok, badRequest } from "../../../../lib/http.js";
import { isValidEmail } from "../../../../lib/validators.js";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidEmail(body.email)) {
    return badRequest("Masukkan alamat email yang valid.");
  }

  await requestPasswordReset(body.email);

  // Generic response regardless of whether the email is registered
  // (PRD 7.3, FORGOT-02 — prevents account enumeration).
  return ok({ message: "Jika email terdaftar, tautan reset kata sandi telah dikirim." });
}
