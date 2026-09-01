export function money(value) {
  return `Rs. ${Math.round(Number(value) || 0).toLocaleString()}`;
}
