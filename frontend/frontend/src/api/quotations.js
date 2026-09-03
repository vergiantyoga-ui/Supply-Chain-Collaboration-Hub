import { apiRequest } from "./client.js";

export function listQuotations() {
  return apiRequest("/quotations");
}

export function createQuotation(payload) {
  return apiRequest("/quotations", { method: "POST", body: payload });
}
