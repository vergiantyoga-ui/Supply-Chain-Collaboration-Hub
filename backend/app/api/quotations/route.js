import { listQuotationsForSupplier, createQuotation } from "../../../lib/repository.js";
import { getRequestUserEmail } from "../../../lib/requestUser.js";
import { ok, created, unauthorized, badRequest } from "../../../lib/http.js";

export async function GET(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const list = await listQuotationsForSupplier(email);
  return ok(list);
}

export async function POST(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!body?.rfxId || !body?.currency || !body?.validUntil || !Array.isArray(body?.items) || body.items.length === 0) {
    return badRequest("Lengkapi RFx, mata uang, masa berlaku, dan minimal satu item penawaran.");
  }

  const result = await createQuotation(email, body);
  if (result?.error === "not_found") return badRequest("Profil pemasok tidak ditemukan.");
  if (result?.error === "invalid_rfx") return badRequest("RFx tidak ditemukan atau bukan untuk akun ini.");
  if (result?.error === "rfx_closed") return badRequest("RFx ini sudah ditutup dan tidak lagi menerima penawaran.");
  return created(result.data);
}
