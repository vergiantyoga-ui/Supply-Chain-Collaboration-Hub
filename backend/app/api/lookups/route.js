import { getLookups } from "../../../lib/repository.js";
import { ok } from "../../../lib/http.js";

export async function GET() {
  const data = await getLookups();
  return ok(data);
}
