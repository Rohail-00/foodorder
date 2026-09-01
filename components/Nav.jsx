"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, UserRound, LogOut, LayoutDashboard } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setUser(JSON.parse(localStorage.getItem("food_user") || "null"));
      setAdmin(JSON.parse(localStorage.getItem("food_admin") || "null"));
      const cart = JSON.parse(localStorage.getItem("food_cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("cart-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("cart-updated", refresh);
    };
  }, []);

  function logout() {
    localStorage.removeItem("food_user");
    localStorage.removeItem("food_admin");
    setUser(null);
    setAdmin(null);
    window.dispatchEvent(new Event("cart-updated"));
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/restaurants", label: "Restaurants" },
    { href: "/orders", label: "My Orders" },
  ];

  const displayName = admin
    ? "Admin"
    : user?.name
    ? user.name.split(" ")[0]
    : null;

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span>TL</span>
        TableLine
      </Link>
      <nav className="nav-primary">
        {navItems.map((item) => (
          <Link
            className={pathname === item.href ? "active" : ""}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        {!admin && (
          <Link href="/cart" className="nav-cart" aria-label={`Cart (${cartCount} items)`}>
            <ShoppingBag size={17} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
        )}
        {admin ? (
          <Link href="/admin" className="staff-link" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <LayoutDashboard size={15} />
            Admin Panel
          </Link>
        ) : (
          <Link href="/login" className="icon-link" aria-label="Account">
            <UserRound size={16} />
            <span>{displayName || "Sign in"}</span>
          </Link>
        )}
        {(user || admin) && (
          <button className="nav-logout" onClick={logout} aria-label="Logout" title="Logout">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
