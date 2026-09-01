# TableLine Food Ordering App

Next.js + React restaurant ordering prototype backed by a local SQLite database seeded from `data/foodpanda.csv`.

## What is included

- Customer sign-in and account creation with saved delivery address
- Restaurant selection
- Menu browsing by category
- Cart, checkout, order placement, and order history
- Admin login with `admin` / `admin123`
- Admin stats dashboard
- Product/menu management
- Order status management
- CSV export at `/api/admin/export`
- SQLite schema and seed script
- Simple white interface with black accents and local placeholder assets

## Run locally

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`.

## Demo credentials

Demo customer:

- Email: `demo@food.local`
- Password: `demo123`

New customers can create an account from `/login` with full name, email, password, city, and delivery address. Those details are stored in SQLite and the saved address is reused at checkout.

Admin:

- Username: `admin`
- Password: `admin123`

## Useful commands

```bash
npm run build
npm run seed
```

The SQLite database is created at `data/app.db`. Run `npm run seed` again to rebuild it from the CSV.
