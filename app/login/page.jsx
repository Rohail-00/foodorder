"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  city: "",
  address: ""
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (mode === "login" && form.email.trim() === "admin" && form.password === "admin123") {
      localStorage.setItem("food_admin", JSON.stringify({ username: "admin", role: "admin" }));
      router.push("/admin");
      return;
    }

    const response = await fetch("/api/auth/customer", {
      method: "POST",
      body: JSON.stringify({ ...form, action: mode })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Please check your details and try again.");
      return;
    }

    localStorage.setItem("food_user", JSON.stringify(data.user));
    router.push("/restaurants");
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Image src="/images/dish-burger.png" alt="Fresh burger meal" width={900} height={900} priority />
        <div>
          <p className="eyebrow">TableLine account</p>
          <h1>Ready when you are.</h1>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Sign in
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Create account
          </button>
        </div>

        <div className="section-heading compact">
          <p className="eyebrow">{mode === "register" ? "New customer" : "Welcome back"}</p>
          <h1>{mode === "register" ? "Create your account" : "Sign in to order"}</h1>
          <p>
            {mode === "register"
              ? "Add your delivery details once. Checkout will use them automatically."
              : "Use your email and password to continue your order."}
          </p>
        </div>

        <form onSubmit={submit} className="form auth-form">
          {mode === "register" ? (
            <>
              <label>Full name<input value={form.name} onChange={(event) => update("name", event.target.value)} required /></label>
              <div className="form-grid">
                <label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></label>
                <label>City<input value={form.city} onChange={(event) => update("city", event.target.value)} required /></label>
              </div>
              <label>Delivery address<textarea value={form.address} onChange={(event) => update("address", event.target.value)} required /></label>
            </>
          ) : (
            <label>Email or admin username<input value={form.email} onChange={(event) => update("email", event.target.value)} required /></label>
          )}

          <label>Password<input type="password" minLength={mode === "login" ? 1 : 6} value={form.password} onChange={(event) => update("password", event.target.value)} required /></label>

          {error && <p className="error">{error}</p>}
          <button className="button primary auth-submit" type="submit">
            {mode === "register" ? "Create account" : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}
