import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const summary = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      ROUND(COALESCE(SUM(total), 0), 2) as revenue,
      ROUND(COALESCE(AVG(total), 0), 2) as average_order,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_orders
    FROM orders
  `).get();

  const topProducts = db.prepare(`
    SELECT p.name, r.name as restaurant, SUM(oi.quantity) as quantity, ROUND(SUM(oi.subtotal), 2) as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN restaurants r ON r.id = p.restaurant_id
    GROUP BY p.id
    ORDER BY quantity DESC
    LIMIT 8
  `).all();

  const dailySales = db.prepare(`
    SELECT substr(created_at, 1, 10) as day, COUNT(*) as orders, ROUND(SUM(total), 2) as revenue
    FROM orders
    GROUP BY day
    ORDER BY day DESC
    LIMIT 14
  `).all().reverse();

  const byRestaurant = db.prepare(`
    SELECT r.name, COUNT(o.id) as orders, ROUND(COALESCE(SUM(o.total), 0), 2) as revenue
    FROM restaurants r
    LEFT JOIN orders o ON o.restaurant_id = r.id
    GROUP BY r.id
    ORDER BY revenue DESC
  `).all();

  return NextResponse.json({ summary, topProducts, dailySales, byRestaurant });
}
