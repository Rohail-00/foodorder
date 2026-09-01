import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const restaurants = db
    .prepare(`
      SELECT r.*,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count
      FROM restaurants r
      LEFT JOIN products p ON p.restaurant_id = r.id
      LEFT JOIN orders o ON o.restaurant_id = r.id
      GROUP BY r.id
      ORDER BY r.name
    `)
    .all();
  return NextResponse.json({ restaurants });
}

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Restaurant name is required." }, { status: 400 });
  const info = db
    .prepare("INSERT INTO restaurants (name, city, description, hero_image, rating, delivery_time) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      name,
      body.city || "Lahore",
      body.description || `${name} restaurant`,
      body.hero_image || "/images/restaurant-1.svg",
      Number(body.rating) || 4.2,
      body.delivery_time || "25-35 min"
    );
  return NextResponse.json({ restaurant: db.prepare("SELECT * FROM restaurants WHERE id = ?").get(info.lastInsertRowid) });
}
