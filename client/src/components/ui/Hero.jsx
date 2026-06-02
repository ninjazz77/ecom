import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

const STATS = [
  { value: "10Cr+", label: "Happy Buyers" },
  { value: "50K+", label: "Products" },
  { value: "4.9★", label: "Avg Rating" },
];

const Hero = () => {
  const orb1 = useRef(null);
  const orb2 = useRef(null);

  useEffect(() => {
    const move = (e) => {
      const { clientX: x, clientY: y } = e;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dx = (x / w - 0.5) * 40;
      const dy = (y / h - 0.5) * 40;
      if (orb1.current)
        orb1.current.style.transform = `translate(${dx}px, ${dy}px)`;
      if (orb2.current)
        orb2.current.style.transform = `translate(${-dx * 0.6}px, ${-dy * 0.6}px)`;
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-bg pt-20">
      {/* Orbs */}
      <div
        ref={orb1}
        className="glow-orb w-[600px] h-[600px] bg-violet-600 -top-40 -left-40 transition-transform duration-700 ease-out"
      />
      <div
        ref={orb2}
        className="glow-orb w-[500px] h-[500px] bg-pink-600 -bottom-32 -right-32 transition-transform duration-700 ease-out"
      />
      <div className="glow-orb w-[300px] h-[300px] bg-cyan-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 lg:px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-8">
            <div className="animate-fade-up">
              <span className="badge badge-purple">
                <Sparkles className="h-3 w-3" /> New Collection 2026
              </span>
            </div>

            <h1 className="section-title text-white animate-fade-up delay-100 opacity-0">
              Discover{" "}
              <span className="gradient-text">Bold</span>
              <br />
              Fashion &amp;
              <br />
              <span className="gradient-text-2">Essentials</span>
            </h1>

            <p className="text-base text-white/55 leading-relaxed max-w-xl animate-fade-up delay-200 opacity-0">
              Curated drops, premium quality, and lightning-fast delivery.
              A shopping experience built for the modern era.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up delay-300 opacity-0">
              <Link to="/products" className="btn-glow">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products?featured=true" className="btn-ghost">
                View Featured
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4 animate-fade-up delay-400 opacity-0">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-black text-white">
                    {value}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual cards */}
          <div className="relative animate-fade-up delay-200 opacity-0">
            {/* Floating badge */}
            <div className="absolute -top-6 -left-6 z-20 animate-float">
              <div className="glass-strong rounded-2xl p-4 shadow-glow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Flash Sale</p>
                    <p className="text-sm font-bold text-white">Up to 60% OFF</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main card grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="glass-card p-6 rounded-3xl h-48 flex flex-col justify-end bg-gradient-to-br from-violet-500/20 to-transparent">
                  <span className="section-label text-violet-400">New Drop</span>
                  <h3 className="font-display text-xl text-white mt-2">Men's Collection</h3>
                  <p className="text-xs text-white/40 mt-1">Starting ₹499</p>
                </div>
                <div className="glass-card p-6 rounded-3xl h-32 bg-gradient-to-br from-cyan-500/15 to-transparent flex flex-col justify-end">
                  <span className="section-label text-cyan-400">Trending</span>
                  <h3 className="font-display text-lg text-white mt-1">Electronics</h3>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="glass-card p-6 rounded-3xl h-32 bg-gradient-to-br from-pink-500/15 to-transparent flex flex-col justify-end">
                  <span className="section-label text-pink-400">Hot</span>
                  <h3 className="font-display text-lg text-white mt-1">Women's Picks</h3>
                </div>
                <div className="glass-card p-6 rounded-3xl h-48 bg-gradient-to-br from-amber-500/15 to-transparent flex flex-col justify-end">
                  <span className="section-label text-amber-400">Limited</span>
                  <h3 className="font-display text-xl text-white mt-2">Wearables</h3>
                  <p className="text-xs text-white/40 mt-1">Premium tech</p>
                </div>
              </div>
            </div>

            {/* Bottom live badge */}
            <div className="absolute -bottom-4 -right-4 z-20">
              <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
                <p className="text-xs text-white/70">
                  <strong className="text-white">1.2K</strong> shopping now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="h-10 w-6 rounded-full border border-white/30 flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
        <p className="text-[10px] text-white/40 tracking-widest uppercase">Scroll</p>
      </div>
    </section>
  );
};

export default Hero;
