import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_request, { params }) {
  const db = getDb();
  const { id } = await params;
  const restaurant = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

  const products = db
    .prepare(`
      SELECT p.*, c.name as category
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.restaurant_id = ?
      ORDER BY c.name, p.name
    `)
    .all(id);

  const categories = [...new Set(products.map((product) => product.category))];
  return NextResponse.json({ restaurant, products, categories });
}

export async function PUT(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();
  db.prepare("UPDATE restaurants SET name = ?, city = ?, description = ?, delivery_time = ?, rating = ? WHERE id = ?").run(
    body.name,
    body.city,
    body.description,
    body.delivery_time,
    Number(body.rating) || 4.2,
    id
  );
  return NextResponse.json({ restaurant: db.prepare("SELECT * FROM restaurants WHERE id = ?").get(id) });
}
