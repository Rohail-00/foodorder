import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const root = process.cwd();
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "app.db");
const csvPath = path.join(dataDir, "foodpanda.csv");

let db;

export function getDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!db) {
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
    createSchema(db);
    seedIfEmpty(db);
  }
  return db;
}

export function createSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      city TEXT,
      address TEXT,
      gender TEXT,
      age_group TEXT,
      loyalty_points INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      city TEXT,
      description TEXT,
      hero_image TEXT,
      rating REAL DEFAULT 4.2,
      delivery_time TEXT DEFAULT '25-35 min',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(restaurant_id, name)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      user_id INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      address TEXT,
      payment_method TEXT DEFAULT 'Cash',
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      rating INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);
  ensureColumn(database, "users", "address", "TEXT");
}

export function resetAndSeed() {
  const database = getDb();
  database.exec(`
    DROP TABLE IF EXISTS order_status_history;
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS restaurants;
    DROP TABLE IF EXISTS users;
  `);
  createSchema(database);
  seed(database);
}

function seedIfEmpty(database) {
  const count = database.prepare("SELECT COUNT(*) as count FROM restaurants").get().count;
  if (count === 0) seed(database);
}

function seed(database) {
  const rows = readCsv(csvPath);
  if (!rows.length) {
    seedFallback(database);
    return;
  }

  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users (external_id, name, email, password, role, city, address, gender, age_group, loyalty_points, status, created_at)
    VALUES (@external_id, @name, @email, 'customer123', 'customer', @city, @address, @gender, @age_group, @loyalty_points, @status, @created_at)
  `);
  const insertRestaurant = database.prepare(`
    INSERT OR IGNORE INTO restaurants (name, city, description, hero_image, rating, delivery_time)
    VALUES (@name, @city, @description, @hero_image, @rating, @delivery_time)
  `);
  const insertCategory = database.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  const insertProduct = database.prepare(`
    INSERT OR IGNORE INTO products (restaurant_id, category_id, name, description, price, image, available)
    VALUES (@restaurant_id, @category_id, @name, @description, @price, @image, 1)
  `);
  const insertOrder = database.prepare(`
    INSERT OR IGNORE INTO orders (external_id, user_id, restaurant_id, customer_name, customer_email, address, payment_method, total, status, rating, created_at)
    VALUES (@external_id, @user_id, @restaurant_id, @customer_name, @customer_email, @address, @payment_method, @total, @status, @rating, @created_at)
  `);
  const insertItem = database.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    VALUES (@order_id, @product_id, @quantity, @unit_price, @subtotal)
  `);
  const insertHistory = database.prepare("INSERT INTO order_status_history (order_id, status, created_at) VALUES (?, ?, ?)");

  const tx = () => {
    database.exec("BEGIN");
    try {
    const productPrices = new Map();

    for (const row of rows) {
      const city = clean(row.city) || "Lahore";
      const restaurantName = clean(row.restaurant_name) || "Main Kitchen";
      const dishName = clean(row.dish_name) || "Chef Special";
      const category = canonicalCategory(dishName);
      const key = `${restaurantName}::${dishName}`;
      const price = Number(row.price) || 500;

      insertUser.run({
        external_id: row.customer_id,
        name: `Customer ${String(row.customer_id || "").replace(/^C/, "")}`,
        email: `${String(row.customer_id || Date.now()).toLowerCase()}@demo.local`,
        city,
        address: `${city} customer address`,
        gender: clean(row.gender),
        age_group: clean(row.age),
        loyalty_points: Number(row.loyalty_points) || 0,
        status: clean(row.churned) || "Active",
        created_at: toIso(row.signup_date)
      });

      insertRestaurant.run({
        name: restaurantName,
        city,
        description: `${restaurantName} serves quick favorites for ${city} customers with a focused menu and reliable checkout flow.`,
        hero_image: imageForRestaurant(restaurantName),
        rating: averageRating(rows, restaurantName),
        delivery_time: deliveryTimeFor(restaurantName)
      });

      insertCategory.run(category);

      if (!productPrices.has(key)) productPrices.set(key, []);
      productPrices.get(key).push(price);
    }

    for (const [key, prices] of productPrices) {
      const [restaurantName, dishName] = key.split("::");
      const category = canonicalCategory(dishName);
      const restaurant = database.prepare("SELECT id FROM restaurants WHERE name = ?").get(restaurantName);
      const categoryRow = database.prepare("SELECT id FROM categories WHERE name = ?").get(category);
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      insertProduct.run({
        restaurant_id: restaurant.id,
        category_id: categoryRow.id,
        name: dishName,
        description: descriptionFor(dishName, category, restaurantName),
        price: Number(avg.toFixed(2)),
        image: imageForDish(dishName)
      });
    }

    for (const row of rows) {
      const user = database.prepare("SELECT id, name, email, city FROM users WHERE external_id = ?").get(row.customer_id);
      const restaurant = database.prepare("SELECT id FROM restaurants WHERE name = ?").get(clean(row.restaurant_name));
      const category = database.prepare("SELECT id FROM categories WHERE name = ?").get(canonicalCategory(row.dish_name));
      if (!user || !restaurant || !category) continue;
      const product = database.prepare(`
        SELECT id FROM products WHERE restaurant_id = ? AND name = ?
      `).get(restaurant.id, clean(row.dish_name));
      if (!product) continue;

      const quantity = Math.max(1, Number(row.quantity) || 1);
      const unitPrice = Number(row.price) || 0;
      const status = mapStatus(row.delivery_status);
      const createdAt = toIso(row.order_date);
      const total = Number((quantity * unitPrice).toFixed(2));

      insertOrder.run({
        external_id: row.order_id,
        user_id: user.id,
        restaurant_id: restaurant.id,
        customer_name: user.name,
        customer_email: user.email,
        address: `${user.city || "Lahore"} customer address`,
        payment_method: clean(row.payment_method) || "Cash",
        total,
        status,
        rating: Number(row.rating) || null,
        created_at: createdAt
      });
      const order = database.prepare("SELECT id FROM orders WHERE external_id = ?").get(row.order_id);
      const existingItems = database.prepare("SELECT COUNT(*) as count FROM order_items WHERE order_id = ?").get(order.id).count;
      if (existingItems === 0) {
        insertItem.run({
          order_id: order.id,
          product_id: product.id,
          quantity,
          unit_price: unitPrice,
          subtotal: total
        });
        insertHistory.run(order.id, status, createdAt);
      }
    }

    database.prepare(`
      INSERT OR IGNORE INTO users (external_id, name, email, password, role, city, address, loyalty_points, status)
      VALUES ('DEMO', 'Demo Customer', 'demo@food.local', 'demo123', 'customer', 'Lahore', 'Main Road, Lahore', 120, 'Active')
    `).run();
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  };

  tx();
}

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift()).map((h) => h.trim());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function clean(value) {
  return String(value || "").trim();
}

function ensureColumn(database, table, column, definition) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
  if (!columns.includes(column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function toIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function mapStatus(status) {
  const value = clean(status).toLowerCase();
  if (value.includes("cancel")) return "Cancelled";
  if (value.includes("delay")) return "Delayed";
  if (value.includes("deliver")) return "Completed";
  return "Pending";
}

function averageRating(rows, restaurant) {
  const ratings = rows
    .filter((row) => clean(row.restaurant_name) === restaurant)
    .map((row) => Number(row.rating))
    .filter(Boolean);
  const avg = ratings.reduce((sum, rating) => sum + rating, 0) / Math.max(1, ratings.length);
  return Number((Math.max(3.8, avg + 1.2)).toFixed(1));
}

function deliveryTimeFor(name) {
  const times = ["20-30 min", "25-35 min", "30-40 min", "18-28 min", "35-45 min"];
  return times[Math.abs(hash(name)) % times.length];
}

function imageForRestaurant(name) {
  const normalized = clean(name).toLowerCase();
  if (normalized.includes("pizza")) return "/images/dish-pizza.png";
  if (normalized.includes("subway")) return "/images/dish-sandwich.png";
  if (normalized.includes("kfc")) return "/images/dish-fries.png";
  return "/images/dish-burger.png";
}

function imageForDish(name) {
  const normalized = clean(name).toLowerCase();
  if (normalized.includes("burger")) return "/images/dish-burger.png";
  if (normalized.includes("pizza")) return "/images/dish-pizza.png";
  if (normalized.includes("fries")) return "/images/dish-fries.png";
  if (normalized.includes("pasta")) return "/images/dish-pasta.png";
  return "/images/dish-sandwich.png";
}

function descriptionFor(dish, category, restaurant) {
  const copy = {
    Burger: "A stacked house burger with crisp lettuce, tomato, onion, and a rich cheese finish.",
    Fries: "Golden fries served hot with a clean salty crunch and a classic dipping sauce.",
    Pizza: "A crisp slice with melted cheese, tomato sauce, peppers, olives, and a toasted crust.",
    Pasta: "Creamy rigatoni finished with herbs and parmesan-style garnish.",
    Sandwich: "Toasted sandwich triangles with fresh salad crunch and a creamy filling."
  };
  return copy[dish] || `${dish} from ${restaurant}, priced from historical order data.`;
}

function canonicalCategory(dish) {
  const normalized = clean(dish).toLowerCase();
  if (normalized.includes("fries")) return "Sides";
  return "Mains";
}

function hash(value) {
  return String(value).split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function seedFallback(database) {
  database.prepare("INSERT OR IGNORE INTO restaurants (name, city, description, hero_image) VALUES (?, ?, ?, ?)").run(
    "Demo Kitchen",
    "Lahore",
    "A fallback restaurant used when the CSV is not available.",
    "/images/restaurant-1.svg"
  );
}
