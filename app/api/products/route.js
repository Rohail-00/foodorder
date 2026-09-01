import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const products = db
    .prepare(`
      SELECT p.*, c.name as category, r.name as restaurant
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN restaurants r ON r.id = p.restaurant_id
      ORDER BY r.name, p.name
    `)
    .all();
  return NextResponse.json({ products });
}

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const name = String(body.name || "").trim();
  const restaurantId = Number(body.restaurant_id);
  const categoryName = String(body.category || "Popular").trim();
  if (!name || !restaurantId) return NextResponse.json({ error: "Product name and restaurant are required." }, { status: 400 });

  db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(categoryName);
  const category = db.prepare("SELECT id FROM categories WHERE name = ?").get(categoryName);
  const info = db
    .prepare(`
      INSERT INTO products (restaurant_id, category_id, name, description, price, image, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      restaurantId,
      category.id,
      name,
      body.description || "",
      Number(body.price) || 0,
      body.image || "/images/dish-sandwich.svg",
      body.available === false ? 0 : 1
    );

  return NextResponse.json({ product: db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid) });
}
