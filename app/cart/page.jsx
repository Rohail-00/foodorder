"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getCart, saveCart } from "@/components/CartTools";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  useEffect(() => setCart(getCart()), []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 80 : 0;
  const total = subtotal + deliveryFee;

  function update(productId, delta) {
    const next = cart
      .map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCart(next);
    saveCart(next);
  }

  function remove(productId) {
    const next = cart.filter((item) => item.product_id !== productId);
    setCart(next);
    saveCart(next);
  }

  if (cart.length === 0) {
    return (
      <main className="narrow">
        <section className="panel" style={{ textAlign: "center", padding: "60px 40px" }}>
          <ShoppingBag size={40} style={{ color: "var(--muted)", marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, marginTop: 0 }}>Your cart is empty</h1>
          <p style={{ color: "var(--muted)" }}>
            Add items from a restaurant to get started.
          </p>
          <Link href="/restaurants" className="button primary" style={{ marginTop: 8 }}>
            Browse restaurants <ArrowRight size={15} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="section-heading">
        <p className="eyebrow">Cart</p>
        <h1>{cart[0]?.restaurant_name || "Your cart"}</h1>
      </section>
      <section className="cart-layout">
        {/* Items list */}
        <div className="panel" style={{ padding: "8px 24px" }}>
          {cart.map((item) => (
            <div className="cart-line" key={item.product_id}>
              <Image
                src={item.image}
                alt={item.name}
                width={68}
                height={68}
                style={{ borderRadius: 12, objectFit: "cover" }}
              />
              <div>
                <strong>{item.name}</strong>
                <span>Rs. {Math.round(item.price).toLocaleString()} each</span>
              </div>
              <div className="qty">
                <button onClick={() => update(item.product_id, -1)} aria-label="Decrease">
                  <Minus size={13} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => update(item.product_id, 1)} aria-label="Increase">
                  <Plus size={13} />
                </button>
              </div>
              <button
                className="ghost-icon"
                onClick={() => remove(item.product_id)}
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="summary">
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Order summary</h2>
          <div className="checkout-lines">
            <div className="total-row" style={{ borderTop: 0, paddingTop: 0 }}>
              <span>Subtotal</span>
              <span>Rs. {Math.round(subtotal).toLocaleString()}</span>
            </div>
            <div className="total-row" style={{ borderTop: 0, paddingTop: 0 }}>
              <span>Delivery fee</span>
              <span>Rs. {deliveryFee}</span>
            </div>
          </div>
          <div className="total-row">
            <span>Total</span>
            <strong>Rs. {Math.round(total).toLocaleString()}</strong>
          </div>
          <Link href="/checkout" className="button primary">
            Checkout <ArrowRight size={15} />
          </Link>
          <Link href="/restaurants" className="button secondary" style={{ textAlign: "center" }}>
            Continue shopping
          </Link>
        </aside>
      </section>
    </main>
  );
}
