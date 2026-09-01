import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, Search, ShoppingBag, Star, Utensils } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <Reveal className="hero-copy">
          <p className="eyebrow">Restaurant ordering platform</p>
          <h1>
            Order<br />Fresh.
          </h1>
          <p>
            Choose from the best local restaurants, build your meal, and checkout in seconds. No extra steps.
          </p>
          <div className="actions">
            <Link href="/restaurants" className="button primary">
              Browse restaurants <ArrowRight size={15} />
            </Link>
            <Link href="/login" className="button secondary">
              Create account
            </Link>
          </div>
        </Reveal>
        <Reveal className="hero-visual" delay={100}>
          <Image
            src="/images/hero-food.png"
            alt="Fresh restaurant food on a white table"
            width={1536}
            height={1024}
            priority
            className="hero-image"
          />
          <div className="floating-note">
            <span>Currently active</span>
            <strong>12 restaurants nearby</strong>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="flow-band">
        <Reveal className="flow-step">
          <div className="flow-step-icon">
            <Search size={18} />
          </div>
          <div>
            <strong>Find a kitchen</strong>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Browse local spots</p>
          </div>
        </Reveal>
        <Reveal className="flow-step" delay={80}>
          <div className="flow-step-icon">
            <Utensils size={18} />
          </div>
          <div>
            <strong>Pick your meal</strong>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Build your order</p>
          </div>
        </Reveal>
        <Reveal className="flow-step" delay={160}>
          <div className="flow-step-icon">
            <ShoppingBag size={18} />
          </div>
          <div>
            <strong>Checkout cleanly</strong>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>One-tap confirm</p>
          </div>
        </Reveal>
        <Reveal className="flow-step" delay={240}>
          <div className="flow-step-icon">
            <Clock size={18} />
          </div>
          <div>
            <strong>Track history</strong>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>All orders saved</p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
