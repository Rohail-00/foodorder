"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  Bot,
  Brain,
  Download,
  FileSpreadsheet,
  Save,
  Trash2,
  TrendingUp,
  Wand2,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [admin, setAdmin] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    restaurant_id: "",
    name: "",
    category: "Mains",
    price: "",
    description: "",
  });

  useEffect(() => {
    setAdmin(JSON.parse(localStorage.getItem("food_admin") || "null"));
    load();
  }, []);

  async function load() {
    const [restaurantsRes, productsRes, ordersRes, statsRes] = await Promise.all([
      fetch("/api/restaurants"),
      fetch("/api/products"),
      fetch("/api/orders"),
      fetch("/api/admin/stats"),
    ]);
    setRestaurants((await restaurantsRes.json()).restaurants || []);
    setProducts((await productsRes.json()).products || []);
    setOrders((await ordersRes.json()).orders || []);
    setStats(await statsRes.json());
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(productForm),
    });
    setProductForm({ ...productForm, name: "", price: "", description: "" });
    setSaving(false);
    await load();
  }

  async function updateStatus(orderId, status) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function hideProduct(productId) {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    await load();
  }

  function dummyAlert(feature) {
    alert(`${feature} — coming soon! This will be implemented by the AI/ML or Data Science team.`);
  }

  const recentOrders = useMemo(() => orders.slice(0, 25), [orders]);

  if (!admin) {
    return (
      <main className="narrow">
        <section className="panel" style={{ textAlign: "center", padding: "60px 40px" }}>
          <h1 style={{ marginTop: 0, fontSize: 24 }}>Admin access required</h1>
          <p style={{ color: "var(--muted)" }}>
            Use username <strong>admin</strong> and password <strong>admin123</strong> on the login page.
          </p>
          <Link href="/login" className="button primary" style={{ marginTop: 8 }}>
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <section className="section-heading">
        <p className="eyebrow">Admin Dashboard</p>
        <h1>Restaurant operations</h1>
      </section>

      {/* AI / DS Feature bar (dummy) */}
      <div className="admin-feature-bar">
        <span className="admin-feature-bar-label">Coming soon</span>
        <p>Future AI &amp; Data Science features:</p>
        <button
          className="button ai small"
          onClick={() => dummyAlert("AI Voice Assistant")}
          id="btn-voice-assistant"
        >
          <Bot size={14} /> Voice Assistant
        </button>
        <button
          className="button ai small"
          onClick={() => dummyAlert("AI Sales Insights")}
          id="btn-ai-insights"
        >
          <Brain size={14} /> AI Insights
        </button>
        <button
          className="button ds small"
          onClick={() => dummyAlert("Demand Forecasting")}
          id="btn-demand-forecast"
        >
          <TrendingUp size={14} /> Demand Forecast
        </button>
        <button
          className="button ds small"
          onClick={() => dummyAlert("Product Recommendations")}
          id="btn-recommendations"
        >
          <Wand2 size={14} /> Recommendations
        </button>
        <button
          className="button ds small"
          onClick={() => dummyAlert("Analytics Dashboard")}
          id="btn-analytics"
        >
          <BarChart2 size={14} /> Analytics
        </button>
      </div>

      {/* Stats */}
      <section className="stats-grid">
        <Stat label="Total orders" value={stats?.summary?.total_orders ?? "—"} />
        <Stat
          label="Revenue"
          value={
            stats?.summary?.revenue != null
              ? `Rs. ${Math.round(stats.summary.revenue).toLocaleString()}`
              : "—"
          }
        />
        <Stat
          label="Average order"
          value={
            stats?.summary?.average_order != null
              ? `Rs. ${Math.round(stats.summary.average_order).toLocaleString()}`
              : "—"
          }
        />
        <Stat label="Pending" value={stats?.summary?.pending_orders ?? "—"} />
      </section>

      {/* Product form + Top products */}
      <section className="admin-grid">
        <div className="panel">
          <div className="panel-title">
            <h2>Add product</h2>
            <div className="panel-actions">
              <a
                className="button secondary small"
                href="/api/admin/export"
                id="btn-export-csv"
                title="Export orders as CSV"
              >
                <FileSpreadsheet size={14} /> Export CSV
              </a>
            </div>
          </div>
          <form className="form" onSubmit={saveProduct}>
            <label>
              Restaurant
              <select
                value={productForm.restaurant_id}
                onChange={(e) =>
                  setProductForm({ ...productForm, restaurant_id: e.target.value })
                }
                required
              >
                <option value="">Select restaurant</option>
                {restaurants.map((r) => (
                  <option value={r.id} key={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product name
              <input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                required
                placeholder="e.g. Chicken Burger"
              />
            </label>
            <label>
              Category
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              >
                <option>Mains</option>
                <option>Sides</option>
                <option>Drinks</option>
                <option>Desserts</option>
              </select>
            </label>
            <label>
              Price (Rs.)
              <input
                type="number"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                required
                min="1"
                placeholder="e.g. 750"
              />
            </label>
            <label>
              Description
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                placeholder="Brief product description…"
              />
            </label>
            <button
              id="btn-save-product"
              className="button primary"
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save product"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 style={{ margin: "0 0 16px" }}>Top selling products</h2>
          <div className="table-list">
            {(stats?.topProducts || []).slice(0, 10).map((product, i) => (
              <div key={`${product.restaurant}-${product.name}`}>
                <span>
                  <strong style={{ fontSize: 14 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 700, marginRight: 6 }}>#{i + 1}</span>
                    {product.name}
                  </strong>
                  <small>{product.restaurant}</small>
                </span>
                <strong>{product.quantity} sold</strong>
              </div>
            ))}
            {!(stats?.topProducts?.length) && (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>No sales data yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Menu management */}
      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">
          <h2>Menu management</h2>
          <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="admin-table">
          {products.slice(0, 50).map((product) => (
            <div className="admin-row" key={product.id}>
              <span>
                <strong>{product.name}</strong>
                <small>
                  {product.restaurant} · {product.category}
                </small>
              </span>
              <span style={{ fontWeight: 700 }}>Rs. {Math.round(product.price).toLocaleString()}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: product.available ? "var(--green)" : "var(--muted)",
                }}
              >
                {product.available ? "● Available" : "○ Hidden"}
              </span>
              <button
                className="ghost-icon"
                onClick={() => hideProduct(product.id)}
                title="Remove product"
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Orders */}
      <section className="panel">
        <div className="panel-title">
          <h2>Recent orders</h2>
          <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            {recentOrders.length} shown
          </span>
        </div>
        <div className="admin-table">
          {recentOrders.map((order) => (
            <div className="admin-row order-admin-row" key={order.id}>
              <span>
                <strong>
                  #{order.id} {order.customer_name}
                </strong>
                <small>
                  {order.restaurant_name} · Rs. {Math.round(order.total).toLocaleString()}
                </small>
              </span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
              </span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                aria-label={`Status for order #${order.id}`}
                style={{ borderRadius: "999px", fontSize: 13, fontWeight: 600 }}
              >
                {["Pending", "Preparing", "Ready", "Completed", "Delayed", "Cancelled"].map(
                  (status) => (
                    <option key={status}>{status}</option>
                  )
                )}
              </select>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>No orders yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <article className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
