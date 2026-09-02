import { updateTaxDetail } from "../../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../../lib/requestUser.js";
import { ok, unauthorized, notFound, badRequest } from "../../../../../lib/http.js";

export async function PUT(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Payload tidak valid.");

  const result = await updateTaxDetail(email, {
    nik: body.nik || "",
    npwp: body.npwp || "",
    ktp: body.ktp || "",
    siup: body.siup || "",
  });
  if (!result) return notFound("Profil pemasok tidak ditemukan.");
  return ok(result);
}
