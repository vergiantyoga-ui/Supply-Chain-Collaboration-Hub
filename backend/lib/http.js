import { NextResponse } from "next/server";

export function ok(data, init = {}) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created(data, init = {}) {
  return NextResponse.json({ success: true, data }, { status: 201, ...init });
}

export function badRequest(message, errors = null) {
  return NextResponse.json({ success: false, message, errors }, { status: 400 });
}

export function unauthorized(message = "Email atau kata sandi salah.") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function notFound(message = "Data tidak ditemukan.") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function serverError(message = "Terjadi kesalahan pada server.") {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
