export function getCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("food_cart") || "[]");
}

export function saveCart(cart) {
  localStorage.setItem("food_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(product, restaurant) {
  const cart = getCart();
  const existingRestaurant = cart[0]?.restaurant_id;
  const nextCart = existingRestaurant && existingRestaurant !== restaurant.id ? [] : cart;
  const found = nextCart.find((item) => item.product_id === product.id);
  if (found) found.quantity += 1;
  else {
    nextCart.push({
      product_id: product.id,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  saveCart(nextCart);
}
