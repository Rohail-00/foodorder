"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      });
  }, []);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    (r.city || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main>
      <section className="section-heading">
        <p className="eyebrow">Restaurants</p>
        <h1>Choose a kitchen.</h1>
        <p>Browse local restaurant menus and start an order from the kitchen you want.</p>
      </section>

      <div className="restaurants-toolbar">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search restaurants or cities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search restaurants"
          />
        </div>
        {!loading && (
          <span className="restaurant-count">
            {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: 15 }}>Loading restaurants…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 15 }}>
          No restaurants match &ldquo;{query}&rdquo;.{" "}
          <button
            className="button ghost small"
            style={{ display: "inline-flex", minHeight: "auto", padding: 0, border: 0, fontWeight: 700 }}
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </p>
      ) : (
        <section className="restaurant-grid">
          {filtered.map((restaurant, index) => (
            <Link
              href={`/restaurants/${restaurant.id}`}
              className="restaurant-card"
              key={restaurant.id}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Image
                src={restaurant.hero_image}
                alt={`${restaurant.name} food spread`}
                width={720}
                height={480}
              />
              <div>
                <div className="card-title-row">
                  <h2>{restaurant.name}</h2>
                  <span>
                    <Star size={13} fill="currentColor" /> {restaurant.rating}
                  </span>
                </div>
                <p>{restaurant.description}</p>
                <div className="meta-row">
                  <span>{restaurant.city}</span>
                  <span>{restaurant.delivery_time}</span>
                  <span>{restaurant.product_count} items</span>
                </div>
                <span className="text-link">
                  View menu <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
