import { getEmailOutbox } from "../../../../lib/repository.js";
import { ok } from "../../../../lib/http.js";

// Without this, Next.js statically pre-renders this GET handler at build
// time (it reads nothing from `request`), caching an empty result forever
// instead of reflecting live mock data.
export const dynamic = "force-dynamic";

/**
 * Dev/QA-only endpoint: lists every simulated outbound email (see PRD 9.8).
 * No real email provider is wired up in this build, so this is the only way
 * to see the credentials sent to a newly-approved supplier. Remove or
 * protect this route before deploying anywhere a real user could reach it.
 */
export async function GET() {
  const outbox = await getEmailOutbox();
  return ok(outbox);
}
