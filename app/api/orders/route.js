import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const where = userId ? "WHERE o.user_id = ?" : "";
  const orders = db
    .prepare(`
      SELECT o.*, r.name as restaurant_name
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      ${where}
      ORDER BY datetime(o.created_at) DESC
      LIMIT 250
    `)
    .all(...(userId ? [userId] : []));

  const itemStmt = db.prepare(`
    SELECT oi.*, p.name, p.image
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `);

  return NextResponse.json({ orders: orders.map((order) => ({ ...order, items: itemStmt.all(order.id) })) });
}

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const userId = Number(body.user_id);
  const restaurantId = Number(body.restaurant_id);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!userId || !restaurantId || items.length === 0) {
    return NextResponse.json({ error: "A customer, restaurant, and cart items are required." }, { status: 400 });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const productStmt = db.prepare("SELECT id, price, available FROM products WHERE id = ? AND restaurant_id = ?");
  const validated = items.map((item) => {
    const product = productStmt.get(item.product_id, restaurantId);
    if (!product || !product.available) throw new Error("One cart item is no longer available.");
    const quantity = Math.max(1, Number(item.quantity) || 1);
    return {
      product_id: product.id,
      quantity,
      unit_price: product.price,
      subtotal: Number((product.price * quantity).toFixed(2))
    };
  });
  const total = Number(validated.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

  function create() {
    db.exec("BEGIN");
    try {
    const info = db
      .prepare(`
        INSERT INTO orders (user_id, restaurant_id, customer_name, customer_email, address, payment_method, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `)
      .run(userId, restaurantId, user.name, user.email, body.address || user.address || "", body.payment_method || "Cash", total);

    const orderId = info.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const item of validated) {
      insertItem.run(orderId, item.product_id, item.quantity, item.unit_price, item.subtotal);
    }
    db.prepare("INSERT INTO order_status_history (order_id, status) VALUES (?, 'Pending')").run(orderId);
    db.exec("COMMIT");
    return orderId;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const orderId = create();
  return NextResponse.json({ order: db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) }, { status: 201 });
}
