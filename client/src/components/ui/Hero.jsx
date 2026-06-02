import React from "react";
import { Button } from "../button";
import { Link } from "react-router-dom";
import {
  RiSparklingLine,
  RiShieldCheckLine,
  RiTruckLine,
} from "react-icons/ri";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#fff7dd] px-4 py-16 lg:px-6 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),transparent_35%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <div className="space-y-8">
            <span className="brand-mark bg-slate-950/10 text-slate-950">
              <span className="logo bg-slate-950 text-white">F</span>
              Flux store
            </span>

            <div className="space-y-6">
              <h1 className="section-hero text-slate-950">
                Shop for the latest drops, styles, and curated essentials.
              </h1>
              <p className="section-subtitle max-w-3xl text-slate-700">
                Discover bold fashion picks, fast delivery, and a curated retail
                experience designed for everyday shoppers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild>
                <Link to="/products" className="inline-flex items-center gap-2">
                  Shop now
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/cart" className="inline-flex items-center gap-2">
                  Your cart
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  RiSparklingLine,
                  "Curated drops",
                  "Fresh collections released regularly.",
                ],
                [
                  RiTruckLine,
                  "Fast shipping",
                  "Quick delivery across the catalog.",
                ],
                [
                  RiShieldCheckLine,
                  "Trusted payments",
                  "Secure checkout every time.",
                ],
              ].map(([Icon, title, text]) => (
                <div key={title} className="surface-card p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-slate-950/10 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex rounded-[1.5rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  Shop for
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  New drop
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">
                    Men's tees
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Everyday essentials
                  </h3>
                </div>
                <div className="rounded-[1.75rem] bg-slate-950/95 p-6 text-white">
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">
                    Women’s top picks
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Bold hues & playful styles
                  </h3>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
                Pick your vibe
              </p>
              <h3 className="mt-4 text-2xl font-semibold">
                Fresh looks for every mood
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Easier browsing, richer visuals, and a shopping flow designed to
                keep customers moving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
