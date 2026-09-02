import { apiRequest } from "./client.js";

export function login(email, password) {
  return apiRequest("/auth/login", { method: "POST", body: { email, password } });
}

export function loginWithSso() {
  return apiRequest("/auth/sso", { method: "POST", body: {} });
}

export function requestPasswordReset(email) {
  return apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
}
