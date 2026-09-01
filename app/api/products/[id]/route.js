import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();
  const categoryName = String(body.category || "Popular").trim();
  db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(categoryName);
  const category = db.prepare("SELECT id FROM categories WHERE name = ?").get(categoryName);

  db.prepare(`
    UPDATE products
    SET restaurant_id = ?, category_id = ?, name = ?, description = ?, price = ?, available = ?
    WHERE id = ?
  `).run(
    Number(body.restaurant_id),
    category.id,
    body.name,
    body.description || "",
    Number(body.price) || 0,
    body.available ? 1 : 0,
    id
  );

  return NextResponse.json({ product: db.prepare("SELECT * FROM products WHERE id = ?").get(id) });
}

export async function DELETE(_request, { params }) {
  const db = getDb();
  const { id } = await params;
  db.prepare("UPDATE products SET available = 0 WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
