import { getSubmissionById } from "../../../../lib/repository.js";
import { ok, notFound, serverError } from "../../../../lib/http.js";

export async function GET(_request, { params }) {
  try {
    const submission = await getSubmissionById(params.id);
    if (!submission) return notFound("Pengajuan tidak ditemukan.");
    return ok(submission);
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
