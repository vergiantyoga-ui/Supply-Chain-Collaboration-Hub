import { getRfxById } from "../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../lib/requestUser.js";
import { ok, unauthorized, notFound } from "../../../../lib/http.js";

export async function GET(request, { params }) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const rfx = await getRfxById(email, params.id);
  if (!rfx) return notFound("RFx tidak ditemukan.");
  return ok(rfx);
}
