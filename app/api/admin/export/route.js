import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      o.id as order_id,
      o.created_at,
      o.customer_name,
      o.customer_email,
      r.name as restaurant,
      p.name as product,
      c.name as category,
      oi.quantity,
      oi.unit_price,
      oi.subtotal,
      o.payment_method,
      o.status
    FROM orders o
    JOIN restaurants r ON r.id = o.restaurant_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    ORDER BY datetime(o.created_at) DESC
  `).all();

  const headers = Object.keys(rows[0] || {
    order_id: "",
    created_at: "",
    customer_name: "",
    customer_email: "",
    restaurant: "",
    product: "",
    category: "",
    quantity: "",
    unit_price: "",
    subtotal: "",
    payment_method: "",
    status: ""
  });
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=orders-export.csv"
    }
  });
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
