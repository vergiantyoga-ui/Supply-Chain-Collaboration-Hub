import { addProfileLicense, removeProfileLicense } from "../../../../../lib/repository.js";
import { getRequestUserEmail } from "../../../../../lib/requestUser.js";
import { ok, created, unauthorized, notFound, badRequest } from "../../../../../lib/http.js";

const VALID_TYPES = ["gmp", "cpkb", "halal"];

export async function POST(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const body = await request.json().catch(() => null);
  if (!body?.type || !VALID_TYPES.includes(body.type) || !body?.certificateNumber || !body?.fileName) {
    return badRequest("Jenis, nomor sertifikat, atau nama file tidak valid.");
  }

  const license = await addProfileLicense(email, {
    type: body.type,
    certificateNumber: body.certificateNumber,
    issueDate: body.issueDate || "",
    expiryDate: body.expiryDate || "",
    fileName: body.fileName,
  });
  if (!license) return notFound("Profil pemasok tidak ditemukan.");
  return created(license);
}

export async function DELETE(request) {
  const email = getRequestUserEmail(request);
  if (!email) return unauthorized("Sesi tidak valid. Silakan masuk kembali.");

  const licenseId = new URL(request.url).searchParams.get("id");
  if (!licenseId) return badRequest("Parameter id wajib disertakan.");

  const removed = await removeProfileLicense(email, licenseId);
  if (!removed) return notFound("Sertifikat tidak ditemukan.");
  return ok({ removed: true });
}
