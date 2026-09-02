import { NextResponse } from "next/server";

/**
 * CORS middleware for the API-only Next.js backend.
 * The frontend (Vite dev server, typically http://localhost:5173) runs on a
 * different origin than this backend (http://localhost:4000), so every
 * /api/* route needs permissive CORS headers. Tighten `Access-Control-Allow-Origin`
 * to a specific origin list before deploying to production.
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function middleware(request) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }

  const response = NextResponse.next();
  const headers = corsHeaders();
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
