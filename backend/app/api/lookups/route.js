import { getLookups } from "../../../lib/repository.js";
import { ok } from "../../../lib/http.js";

// See app/api/dev/email-outbox/route.js for why this is needed.
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getLookups();
  return ok(data);
}
