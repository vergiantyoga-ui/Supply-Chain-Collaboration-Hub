import { rejectSubmission } from "../../../../../lib/repository.js";
import { ok, badRequest, serverError } from "../../../../../lib/http.js";

export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const reason = (body?.reason || "").trim();
  const actorEmail = body?.actorEmail || "unknown@paragon-corp.com";

  if (!reason) {
    return badRequest("Alasan penolakan wajib diisi.", { reason: "Alasan penolakan wajib diisi." });
  }

  try {
    const result = await rejectSubmission(params.id, reason, actorEmail);
    if (!result) return badRequest("Pengajuan tidak ditemukan atau sudah diputuskan sebelumnya.");
    return ok(result);
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
