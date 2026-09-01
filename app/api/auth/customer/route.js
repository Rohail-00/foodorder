import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const action = body.action === "register" ? "register" : "login";
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();
  const address = String(body.address || "").trim();
  const city = String(body.city || "").trim();

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (action === "register") {
    if (!name || !address || !city) {
      return NextResponse.json({ error: "Name, city, and delivery address are required." }, { status: 400 });
    }
    if (user) {
      return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 });
    }
    const info = db
      .prepare("INSERT INTO users (name, email, password, role, city, address, status) VALUES (?, ?, ?, 'customer', ?, ?, 'Active')")
      .run(name, email, password, city, address);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  } else if (!user) {
    return NextResponse.json({ error: "No account exists with this email." }, { status: 404 });
  } else if (user.password !== password) {
    return NextResponse.json({ error: "Incorrect password for this customer." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      address: user.address,
      loyalty_points: user.loyalty_points
    }
  });
}
