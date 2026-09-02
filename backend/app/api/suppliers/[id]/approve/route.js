import { approveSubmission } from "../../../../../lib/repository.js";
import { ok, badRequest, notFound, serverError } from "../../../../../lib/http.js";

export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const actorEmail = body?.actorEmail || "unknown@paragon-corp.com";

  try {
    const result = await approveSubmission(params.id, actorEmail);
    if (!result) return badRequest("Pengajuan tidak ditemukan atau sudah diputuskan sebelumnya.");
    return ok(result);
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
