"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, CreditCard, MapPin, Package } from "lucide-react";
import { getCart, saveCart } from "@/components/CartTools";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ address: "", payment_method: "Cash" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(getCart());
    const storedUser = JSON.parse(localStorage.getItem("food_user") || "null");
    setUser(storedUser);
    setForm((current) => ({ ...current, address: storedUser?.address || "" }));
  }, []);

  async function placeOrder(event) {
    event.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        user_id: user.id,
        restaurant_id: cart[0]?.restaurant_id,
        items: cart,
        ...form,
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Order could not be placed.");
      return;
    }
    saveCart([]);
    router.push(`/orders?placed=${data.order.id}`);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 80 : 0;
  const total = subtotal + deliveryFee;

  if (!user) {
    return (
      <main className="narrow">
        <section className="panel" style={{ textAlign: "center", padding: "60px 40px" }}>
          <h1 style={{ fontSize: 24, marginTop: 0 }}>Sign in to checkout</h1>
          <p style={{ color: "var(--muted)" }}>You need to be signed in to place an order.</p>
          <a href="/login" className="button primary" style={{ marginTop: 8 }}>
            Sign in <ArrowRight size={15} />
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="narrow">
      <section className="section-heading compact">
        <p className="eyebrow">Checkout</p>
        <h1>Confirm your order</h1>
      </section>

      <div style={{ display: "grid", gap: 16 }}>
        {/* Order summary */}
        <div className="panel">
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={16} /> Order from {cart[0]?.restaurant_name || "restaurant"}
          </h2>
          <div className="checkout-lines">
            {cart.map((item) => (
              <div
                key={item.product_id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                  Rs. {Math.round(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12, display: "grid", gap: 6 }}>
            <div className="total-row" style={{ borderTop: 0, paddingTop: 0, fontWeight: 500 }}>
              <span style={{ color: "var(--muted)" }}>Subtotal</span>
              <span>Rs. {Math.round(subtotal).toLocaleString()}</span>
            </div>
            <div className="total-row" style={{ borderTop: 0, paddingTop: 0, fontWeight: 500 }}>
              <span style={{ color: "var(--muted)" }}>Delivery fee</span>
              <span>Rs. {deliveryFee}</span>
            </div>
            <div className="total-row">
              <span>Total</span>
              <strong>Rs. {Math.round(total).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="panel">
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={16} /> Delivery details
          </h2>
          <form className="form" onSubmit={placeOrder}>
            <label>
              Delivery address
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your full delivery address…"
              />
            </label>
            <label>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CreditCard size={14} /> Payment method
              </span>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </label>
            {error && <p className="error">{error}</p>}
            <button
              id="place-order-btn"
              className="button primary"
              disabled={cart.length === 0 || loading}
            >
              {loading ? "Placing order…" : "Place order"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
