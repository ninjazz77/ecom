import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Headphones,
  Laptop,
  MonitorSmartphone,
  Sparkles,
  Truck,
  Watch,
} from "lucide-react";

import Features from "@/components/ui/Features";
import Hero from "@/components/ui/Hero";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const featured = useMemo(
    () => products.filter((product) => product.isFeatured).slice(0, 4),
    [products],
  );

  const categories = [
    {
      icon: Laptop,
      label: "Electronics",
      description: "Laptops, tablets, and ergonomic accessories.",
    },
    {
      icon: MonitorSmartphone,
      label: "Smart Living",
      description: "Connected devices for modern homes.",
    },
    {
      icon: Headphones,
      label: "Audio",
      description: "Immersive sound for every room.",
    },
    {
      icon: Watch,
      label: "Wearables",
      description: "Lifestyle tech that moves with you.",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/product/getallproducts");
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-slate-950 text-white">
      <Hero />
      <Features />

      <section className="bg-[#fff3c4] text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-700">
                  Product milestones
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  10 Cr+ happy buyers and counting
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  New drops daily
                </span>
                <span className="rounded-full bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white">
                  Fast delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] items-center">
          <div className="rounded-[2rem] bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)] border border-white/10">
            <span className="badge-pill bg-[#fff4d2] text-slate-950">
              Shop by category
            </span>
            <h2 className="mt-6 text-4xl font-semibold text-white md:text-5xl">
              Find what fits your mood in seconds.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              High-impact category cards, bold visuals, and a shopping path
              designed for effortless browsing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">
                Shop all
              </Link>
              <Link to="/cart" className="btn-secondary">
                View cart
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.label} className="category-card p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-amber-300 text-slate-950">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-slate-950">
                    {category.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="badge-pill">Featured collection</p>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Curated products with a premium visual story.
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-cyan-300 transition hover:text-white"
          >
            Explore all products
            <ArrowRight className="inline-block h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ProductCard key={index} product={{ productImg: [] }} loading />
            ))
          ) : featured.length > 0 ? (
            featured.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                loading={false}
              />
            ))
          ) : (
            <div className="col-span-full surface-card p-10 text-center text-slate-300">
              No featured products available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
