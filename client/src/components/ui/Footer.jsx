import React from "react";
import { Link } from "react-router-dom";
import { Zap, Twitter, Instagram, Github, Mail } from "lucide-react";

const LINKS = [
  { heading: "Shop", items: [
    { label: "All Products", to: "/products" },
    { label: "Cart", to: "/cart" },
    { label: "My Account", to: "/profile" },
  ]},
  { heading: "Company", items: [
    { label: "About", to: "/" },
    { label: "Careers", to: "/" },
    { label: "Press", to: "/" },
  ]},
  { heading: "Support", items: [
    { label: "Help Center", to: "/" },
    { label: "Returns", to: "/" },
    { label: "Track Order", to: "/" },
  ]},
];

const Footer = () => (
  <footer className="relative overflow-hidden bg-bg border-t border-white/6">
    {/* Glow */}
    <div className="glow-orb w-96 h-96 bg-violet-700 -bottom-48 left-1/2 -translate-x-1/2 opacity-15" />

    <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6 pt-20 pb-10">
      <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="space-y-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-black text-white">Flux.</span>
          </Link>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs">
            A bold new storefront crafted for speed, clarity, and premium discovery. Built for modern shoppers.
          </p>
          <div className="flex gap-3">
            {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
              <button
                key={i}
                className="h-9 w-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-violet-400 transition"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        {LINKS.map(({ heading, items }) => (
          <div key={heading}>
            <p className="section-label text-white/30 mb-5">{heading}</p>
            <ul className="space-y-3">
              {items.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-white/50 hover:text-white transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-16 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/25">
          &copy; {new Date().getFullYear()} Flux. All rights reserved.
        </p>
        <div className="flex gap-5 text-sm text-white/25">
          <Link to="/" className="hover:text-white/60 transition">Privacy</Link>
          <Link to="/" className="hover:text-white/60 transition">Terms</Link>
          <Link to="/" className="hover:text-white/60 transition">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
