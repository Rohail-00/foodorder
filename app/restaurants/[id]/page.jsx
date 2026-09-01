"use client";

import ProductCard from "@/components/ProductCard";
import { Clock, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((res) => res.json())
      .then(setData);
  }, [id]);

  if (!data) {
    return (
      <main>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>Loading menu…</p>
      </main>
    );
  }

  if (!data.restaurant) {
    return (
      <main>
        <p>Restaurant not found.</p>
      </main>
    );
  }

  const { restaurant, products } = data;

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <main>
      {/* Hero banner */}
      <section className="menu-hero polished">
        <div>
          <p className="eyebrow">{restaurant.city} · {restaurant.delivery_time}</p>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <div className="menu-meta-badges">
            <span><Star size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{restaurant.rating} rating</span>
            <span><Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{restaurant.delivery_time}</span>
            <span><MapPin size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{restaurant.city}</span>
            <span>{products.length} items on menu</span>
          </div>
        </div>
      </section>

      {/* Category filter tabs */}
      {categories.length > 2 && (
        <div className="category-tabs" role="tablist" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`category-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <section className="menu-list single-menu" aria-label="Menu items">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} restaurant={restaurant} />
        ))}
        {filtered.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 15, gridColumn: "1 / -1" }}>
            No items in this category.
          </p>
        )}
      </section>
    </main>
  );
}
