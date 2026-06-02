import React from "react";
import { Zap, Shield, Headphones, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    color: "from-violet-500 to-purple-600",
    glow: "rgba(168,85,247,0.3)",
    title: "Lightning Fast",
    text: "Same-day dispatch on thousands of products across the catalog.",
  },
  {
    icon: Shield,
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.3)",
    title: "Secure Checkout",
    text: "Enterprise-grade encryption keeps your payments 100% safe.",
  },
  {
    icon: Headphones,
    color: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.3)",
    title: "24/7 Support",
    text: "Our team is always on standby to solve any issue, anytime.",
  },
  {
    icon: Trophy,
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.3)",
    title: "Top Rated",
    text: "Voted #1 for customer satisfaction three years running.",
  },
];

const Features = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-surface/30 to-bg" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center mb-14">
          <span className="section-label text-violet-400">Why Flux</span>
          <h2 className="font-display text-4xl text-white mt-3">
            Built for the <span className="gradient-text">Modern Shopper</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, color, glow, title, text }, i) => (
            <div
              key={title}
              className="glass-card p-7 rounded-3xl animate-fade-up opacity-0 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}
                style={{ boxShadow: `0 0 30px ${glow}` }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-lg text-white">{title}</h3>
              <p className="mt-3 text-sm text-white/45 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
