import { addProfileDocument, removeProfileDocument } from "../../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../../lib/requestUser.js";
import { ok, created, unauthorized, notFound, badRequest } from "../../../../../lib/http.js";

const VALID_TYPES = ["akta_pendirian", "sk_pendirian", "izin_usaha"];

export async function POST(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!body?.type || !VALID_TYPES.includes(body.type) || !body?.fileName) {
    return badRequest("Jenis dokumen atau nama file tidak valid.");
  }

  const doc = await addProfileDocument(email, { type: body.type, fileName: body.fileName });
  if (!doc) return notFound("Profil pemasok tidak ditemukan.");
  return created(doc);
}

export async function DELETE(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const docId = new URL(request.url).searchParams.get("id");
  if (!docId) return badRequest("Parameter id wajib disertakan.");

  const removed = await removeProfileDocument(email, docId);
  if (!removed) return notFound("Dokumen tidak ditemukan.");
  return ok({ removed: true });
}
