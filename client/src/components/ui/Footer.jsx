import React from "react";
import { Link } from "react-router-dom";
import {
  RiFacebookFill,
  RiInstagramLine,
  RiTwitterFill,
  RiMailLine,
} from "react-icons/ri";

const Footer = () => {
  return (
    <footer className="bg-[#fff8e3] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)] p-10">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
            <div className="space-y-4">
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="logo inline-flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-slate-950 text-lg font-black text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                  F
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-950">Flux</p>
                  <p className="text-sm text-slate-500">
                    A vibrant shopping destination
                  </p>
                </div>
              </Link>
              <p className="text-sm leading-7 text-slate-600">
                A bold new storefront crafted for speed, clarity, and premium
                discovery.
              </p>
              <div className="space-y-1 text-sm text-slate-500">
                <p>33 Neon Way, Suite 10</p>
                <p>Modern City, SG 20034</p>
                <p>Email: support@flux.com</p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Shop
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li>
                  <Link
                    to="/products"
                    className="transition hover:text-slate-950"
                  >
                    Product catalog
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="transition hover:text-slate-950">
                    Cart experience
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="transition hover:text-slate-950"
                  >
                    Account hub
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin-login"
                    className="transition hover:text-slate-950"
                  >
                    Admin console
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Stay connected
              </h3>
              <div className="mb-4 flex gap-3 text-xl text-slate-700">
                <RiFacebookFill className="cursor-pointer transition hover:text-amber-500" />
                <RiInstagramLine className="cursor-pointer transition hover:text-amber-500" />
                <RiTwitterFill className="cursor-pointer transition hover:text-amber-500" />
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950/5 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-800">
                  <RiMailLine className="h-5 w-5 text-amber-500" />
                  <span>support@flux.com</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Subscribe for new launches, product drops, and platform
                  updates.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Flux. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
