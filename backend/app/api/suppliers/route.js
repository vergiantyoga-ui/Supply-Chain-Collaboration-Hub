import { listSubmissions, createSubmission } from "../../../lib/repository.js";
import { validateSubmissionPayload } from "../../../lib/validators.js";
import { ok, created, badRequest, serverError } from "../../../lib/http.js";

export async function GET() {
  try {
    const data = await listSubmissions();
    return ok(data);
  } catch (err) {
    console.error(err);
    return serverError();
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Payload registrasi tidak valid.");

  const { valid, errors } = validateSubmissionPayload(body);
  if (!valid) {
    return badRequest("Beberapa kolom belum valid.", errors);
  }

  try {
    const result = await createSubmission(body);
    return created(result);
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
