import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  if (body.username === "admin" && body.password === "admin123") {
    return NextResponse.json({ admin: { username: "admin", role: "admin" } });
  }
  return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
}
