import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();
  const allowed = ["Pending", "Preparing", "Ready", "Completed", "Cancelled", "Delayed"];
  const status = allowed.includes(body.status) ? body.status : "Pending";
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  db.prepare("INSERT INTO order_status_history (order_id, status) VALUES (?, ?)").run(id, status);
  return NextResponse.json({ order: db.prepare("SELECT * FROM orders WHERE id = ?").get(id) });
}
