"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, Package } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const placedId = searchParams.get("placed");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("food_user") || "null");
    const url = user ? `/api/orders?userId=${user.id}` : "/api/orders?userId=0";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main>
      {placedId && (
        <div
          className="panel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
            background: "#f0fdf4",
            border: "1.5px solid #16a34a",
            padding: "18px 22px",
          }}
        >
          <CheckCircle size={22} style={{ color: "#16a34a", flexShrink: 0 }} />
          <div>
            <strong style={{ color: "#16a34a" }}>Order #{placedId} placed successfully!</strong>
            <p style={{ margin: 0, fontSize: 13.5, color: "#166534" }}>
              The restaurant has received your order and will start preparing it shortly.
            </p>
          </div>
        </div>
      )}

      <section className="section-heading">
        <p className="eyebrow">History</p>
        <h1>Your orders</h1>
        {!loading && orders.length > 0 && (
          <p>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        )}
      </section>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "60px 40px" }}>
          <Package size={40} style={{ color: "var(--muted)", marginBottom: 16 }} />
          <h2 style={{ margin: 0 }}>No orders yet</h2>
          <p style={{ color: "var(--muted)" }}>
            Sign in and place an order to see your history here.
          </p>
          <Link href="/restaurants" className="button primary" style={{ marginTop: 8 }}>
            Browse restaurants
          </Link>
        </div>
      ) : (
        <section className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <span>
                  {order.restaurant_name}
                </span>
                <span style={{ fontSize: 12 }}>
                  <Clock size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <span key={item.id}>
                    {item.quantity}× {item.name}
                  </span>
                ))}
              </div>
              <div className="order-side">
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                <strong>Rs. {Math.round(order.total).toLocaleString()}</strong>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {order.payment_method}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<main><p style={{ color: "var(--muted)" }}>Loading…</p></main>}>
      <OrdersContent />
    </Suspense>
  );
}
