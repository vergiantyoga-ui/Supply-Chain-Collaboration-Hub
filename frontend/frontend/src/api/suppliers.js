import { apiRequest } from "./client.js";

export function listSubmissions() {
  return apiRequest("/suppliers");
}

export function getSubmission(id) {
  return apiRequest(`/suppliers/${id}`);
}

export function createSubmission(payload) {
  return apiRequest("/suppliers", { method: "POST", body: payload });
}

export function approveSubmission(id, actorEmail) {
  return apiRequest(`/suppliers/${id}/approve`, { method: "POST", body: { actorEmail } });
}

export function rejectSubmission(id, reason, actorEmail) {
  return apiRequest(`/suppliers/${id}/reject`, { method: "POST", body: { reason, actorEmail } });
}
