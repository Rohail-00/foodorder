"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { addToCart } from "./CartTools";
import { money } from "@/lib/format";

export default function ProductCard({ product, restaurant }) {
  return (
    <article className="product-card" aria-label={product.name}>
      <div className="product-media">
        <Image
          src={product.image}
          alt={product.name}
          width={420}
          height={320}
          className="food-thumb"
        />
      </div>
      <div className="product-body">
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <strong>{money(product.price)}</strong>
        </div>
        {product.description && (
          <p>{product.description}</p>
        )}
        <div className="product-footer">
          <span>{product.category}</span>
          <button
            id={`add-to-cart-${product.id}`}
            disabled={!product.available}
            onClick={() => addToCart(product, restaurant)}
            title={product.available ? `Add ${product.name} to cart` : "Currently unavailable"}
            style={!product.available ? { opacity: 0.4, cursor: "not-allowed" } : {}}
          >
            <Plus size={15} /> {product.available ? "Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}
