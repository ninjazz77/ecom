import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Laptop, Headphones, Watch, ShoppingBag, Sparkles } from "lucide-react";

import Features from "@/components/ui/Features";
import Hero from "@/components/ui/Hero";
import ProductCard from "@/components/ui/ProductCard";
import ProductDetailsModal from "@/components/ui/ProductDetailsModal";
import api from "@/lib/api";

const CATEGORIES = [
  { icon: Laptop,     label: "Electronics",   color: "from-cyan-500/20 to-cyan-500/5",  border: "border-cyan-500/20",  text: "text-cyan-400" },
  { icon: ShoppingBag,label: "Fashion",        color: "from-pink-500/20 to-pink-500/5",  border: "border-pink-500/20",  text: "text-pink-400" },
  { icon: Headphones, label: "Audio",          color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", text: "text-violet-400" },
  { icon: Watch,      label: "Wearables",      color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20",  text: "text-amber-400" },
];

const Home = () => {
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const featured = useMemo(() => products.filter((p) => p.isFeatured).slice(0, 8), [products]);
  const newest   = useMemo(() => [...products].slice(0, 4), [products]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/product/getallproducts");
        setProducts(res.data.products || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-bg text-white">
      <Hero />
      <Features />

      {/* ─── Categories ─────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="glow-orb w-96 h-96 bg-pink-600 -top-48 right-0 opacity-15" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="section-label text-pink-400">Browse by Category</span>
              <h2 className="font-display text-4xl text-white mt-3">
                Shop by <span className="gradient-text">Your Vibe</span>
              </h2>
            </div>
            <Link to="/products" className="btn-ghost text-sm">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map(({ icon: Icon, label, color, border, text }) => (
              <Link
                key={label}
                to={`/products?category=${label.toLowerCase()}`}
                className={`group relative overflow-hidden rounded-3xl border ${border} bg-gradient-to-br ${color} p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-card`}
              >
                <div className={`h-14 w-14 rounded-2xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${text}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl text-white">{label}</h3>
                <p className="mt-1.5 text-sm text-white/40">Explore now →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ───────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="glow-orb w-[500px] h-[500px] bg-violet-700 -bottom-64 -left-24 opacity-12" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="section-label text-violet-400 flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Featured Collection
              </span>
              <h2 className="font-display text-4xl text-white mt-3">
                Curated <span className="gradient-text">Picks</span> For You
              </h2>
            </div>
            <Link to="/products" className="btn-ghost text-sm">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCard key={i} product={{ productImg: [] }} loading />
                ))
              : featured.length > 0
              ? featured.slice(0, 4).map((p) => (
                  <ProductCard key={p._id} product={p} onOpenDetails={setSelectedProduct} />
                ))
              : (
                <div className="col-span-full glass rounded-3xl p-16 text-center text-white/40">
                  No featured products yet.
                </div>
              )
            }
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ────────────────────── */}
      {newest.length > 0 && !loading && (
        <section className="py-24 relative overflow-hidden">
          <div className="glow-orb w-96 h-96 bg-cyan-600 top-0 right-0 opacity-10" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="section-label text-cyan-400">Fresh Drops</span>
                <h2 className="font-display text-4xl text-white mt-3">
                  New <span className="gradient-text-2">Arrivals</span>
                </h2>
              </div>
              <Link to="/products" className="btn-ghost text-sm">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {newest.map((p) => (
                <ProductCard key={p._id} product={p} onOpenDetails={setSelectedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Promo banner ───────────────────── */}
      <section className="py-16 px-4 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-cyan-600/20 border border-white/8 p-12 text-center">
            <div className="glow-orb w-64 h-64 bg-violet-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
            <div className="relative z-10">
              <span className="badge badge-purple mb-4">Limited Time</span>
              <h2 className="font-display text-5xl text-white mt-2">
                Free Shipping<br />
                <span className="gradient-text">Over ₹999</span>
              </h2>
              <p className="mt-4 text-white/50 max-w-md mx-auto">
                Order today and get fast, tracked delivery right to your door. No minimum drama.
              </p>
              <Link to="/products" className="btn-glow inline-flex mt-8">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Home;
