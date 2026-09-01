import "./globals.css";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "TableLine — Restaurant Ordering Platform",
  description: "Browse top restaurants, order your favorite meals, and track your delivery — all in one place."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Nav />
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="brand-icon">TL</span>
              <span>TableLine</span>
            </div>
            <p className="footer-copy">© {new Date().getFullYear()} TableLine. Restaurant ordering platform.</p>
            <div className="footer-links">
              <a href="/restaurants">Restaurants</a>
              <a href="/orders">My Orders</a>
              <a href="/admin">Admin</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
