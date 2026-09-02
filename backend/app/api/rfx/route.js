import { listRfxForSupplier } from "../../../lib/repository.js";
import { getRequestUserEmail } from "../../../lib/requestUser.js";
import { ok, unauthorized } from "../../../lib/http.js";

export async function GET(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const list = await listRfxForSupplier(email);
  return ok(list);
}
