import React from "react";
import { Filter, RotateCcw, Search, Tag, DollarSign } from "lucide-react";

const FilterSidebar = ({
  search, setSearch,
  category, setCategory,
  brand, setBrand,
  setPriceRange, allProducts,
  priceRange,
}) => {
  const uniqueCategories = ["all", ...new Set(allProducts.map((p) => p.category?.trim().toLowerCase()).filter(Boolean))];
  const uniqueBrands     = ["all", ...new Set(allProducts.map((p) => p.brand?.trim().toLowerCase()).filter(Boolean))];

  const reset = () => {
    setSearch("");
    setCategory("all");
    setBrand("all");
    setPriceRange([0, 999999]);
  };

  return (
    <aside className="sticky top-24 hidden md:flex flex-col gap-5 w-72">
      {/* Header */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="section-label text-violet-400">Filters</p>
            <p className="font-display text-white text-base font-bold">Refine Results</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-10 text-sm"
          />
        </div>
      </div>

      {/* Category */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-cyan-400" />
          <p className="section-label text-cyan-400">Category</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                category === c
                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-glow"
                  : "glass text-white/50 hover:text-white"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-pink-400" />
          <p className="section-label text-pink-400">Brand</p>
        </div>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="input-dark w-full text-sm capitalize"
        >
          {uniqueBrands.map((b) => (
            <option key={b} value={b} className="bg-[#0f0f14]">
              {b === "all" ? "All Brands" : b}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <p className="section-label text-amber-400">Price Range</p>
          </div>
          <span className="text-xs text-white/40">
            ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
          </span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={priceRange[0]}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]);
              }}
              className="input-dark text-sm text-center"
              placeholder="Min"
            />
            <input
              type="number"
              min="0"
              value={priceRange[1]}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
              }}
              className="input-dark text-sm text-center"
              placeholder="Max"
            />
          </div>
          <input
            type="range" min="0" max="999999" step="500"
            value={priceRange[1]}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
            }}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-violet-500 [&::-webkit-slider-thumb]:to-pink-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        className="btn-ghost w-full justify-center text-sm"
      >
        <RotateCcw className="h-4 w-4" /> Reset Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;
