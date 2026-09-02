import { addBankAccount, updateBankAccount, removeBankAccount } from "../../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../../lib/requestUser.js";
import { ok, created, unauthorized, notFound, badRequest } from "../../../../../lib/http.js";

function validateAccountPayload(body) {
  return body?.bankName && body?.accountNumber && body?.accountHolder && body?.currency && body?.termsOfPayment;
}

export async function POST(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!validateAccountPayload(body)) return badRequest("Semua kolom rekening bank wajib diisi.");

  const account = await addBankAccount(email, body);
  if (!account) return notFound("Profil pemasok tidak ditemukan.");
  return created(account);
}

export async function PUT(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!body?.id || !validateAccountPayload(body)) return badRequest("Data rekening bank tidak lengkap.");

  const account = await updateBankAccount(email, body.id, body);
  if (!account) return notFound("Rekening bank tidak ditemukan.");
  return ok(account);
}

export async function DELETE(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const accountId = new URL(request.url).searchParams.get("id");
  if (!accountId) return badRequest("Parameter id wajib disertakan.");

  const removed = await removeBankAccount(email, accountId);
  if (!removed) return notFound("Rekening bank tidak ditemukan.");
  return ok({ removed: true });
}
