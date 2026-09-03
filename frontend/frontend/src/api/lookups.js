import { apiRequest } from "./client.js";

export function getLookups() {
  return apiRequest("/lookups");
}
