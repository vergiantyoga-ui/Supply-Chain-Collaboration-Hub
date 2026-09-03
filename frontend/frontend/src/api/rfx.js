import { apiRequest } from "./client.js";

export function listRfx() {
  return apiRequest("/rfx");
}

export function getRfx(id) {
  return apiRequest(`/rfx/${id}`);
}
