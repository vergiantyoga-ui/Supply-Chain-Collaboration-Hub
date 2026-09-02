import { addProfileContact, updateProfileContact, removeProfileContact } from "../../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../../lib/requestUser.js";
import { ok, created, unauthorized, notFound, badRequest } from "../../../../../lib/http.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TITLES = ["miss", "mr", "madam"];
const POSITIONS = ["finance", "sales", "quality", "other"];

function validateContactPayload(body) {
  return (
    body?.contactName?.trim() &&
    TITLES.includes(body?.title) &&
    POSITIONS.includes(body?.jobPosition) &&
    EMAIL_RE.test(body?.email || "") &&
    body?.mobilePhone?.trim()
  );
}

export async function POST(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!validateContactPayload(body)) return badRequest("Data kontak tidak lengkap atau tidak valid.");

  const result = await addProfileContact(email, body);
  if (result?.error === "not_found") return notFound("Profil pemasok tidak ditemukan.");
  if (result?.error === "max_reached") return badRequest("Maksimal 10 kontak untuk satu pemasok.");
  return created(result.data);
}

export async function PUT(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!body?.id || !validateContactPayload(body)) return badRequest("Data kontak tidak lengkap atau tidak valid.");

  const contact = await updateProfileContact(email, body.id, body);
  if (!contact) return notFound("Kontak tidak ditemukan.");
  return ok(contact);
}

export async function DELETE(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const contactId = new URL(request.url).searchParams.get("id");
  if (!contactId) return badRequest("Parameter id wajib disertakan.");

  const removed = await removeProfileContact(email, contactId);
  if (!removed) return notFound("Kontak tidak ditemukan.");
  return ok({ removed: true });
}
