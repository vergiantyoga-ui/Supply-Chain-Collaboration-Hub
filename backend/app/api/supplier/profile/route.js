import { getSupplierProfile } from "../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../lib/requestUser.js";
import { ok, unauthorized, notFound } from "../../../../lib/http.js";

export async function GET(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const profile = await getSupplierProfile(email);
  if (!profile) return notFound("Profil pemasok belum tersedia untuk akun ini.");
  return ok(profile);
}
