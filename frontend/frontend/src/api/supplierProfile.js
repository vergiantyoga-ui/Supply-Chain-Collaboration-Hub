import { apiRequest } from "./client.js";

export function getProfile() {
  return apiRequest("/supplier/profile");
}

export function updateTaxDetail(payload) {
  return apiRequest("/supplier/profile/tax", { method: "PUT", body: payload });
}

export function addDocument(payload) {
  return apiRequest("/supplier/profile/documents", { method: "POST", body: payload });
}
export function removeDocument(id) {
  return apiRequest(`/supplier/profile/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function addLicense(payload) {
  return apiRequest("/supplier/profile/licenses", { method: "POST", body: payload });
}
export function removeLicense(id) {
  return apiRequest(`/supplier/profile/licenses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function addBankAccount(payload) {
  return apiRequest("/supplier/profile/bank-accounts", { method: "POST", body: payload });
}
export function updateBankAccount(id, payload) {
  return apiRequest("/supplier/profile/bank-accounts", { method: "PUT", body: { id, ...payload } });
}
export function removeBankAccount(id) {
  return apiRequest(`/supplier/profile/bank-accounts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function addContact(payload) {
  return apiRequest("/supplier/profile/contacts", { method: "POST", body: payload });
}
export function updateContact(id, payload) {
  return apiRequest("/supplier/profile/contacts", { method: "PUT", body: { id, ...payload } });
}
export function removeContact(id) {
  return apiRequest(`/supplier/profile/contacts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}
