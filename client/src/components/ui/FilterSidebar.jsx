import React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Filter, RotateCcw, Search } from "lucide-react";

const FilterSidebar = ({
  search,
  setSearch,
  category,
  setCategory,
  brand,
  setBrand,
  setPriceRange,
  allProducts,
  priceRange,
}) => {
  const Categories = allProducts.map((p) => p.category?.trim().toLowerCase());
  const UniqueCategory = ["all", ...new Set(Categories)];

  const Brands = allProducts.map((p) => p.brand?.trim().toLowerCase());
  const UniqueBrand = ["all", ...new Set(Brands)];

  const handleCategoryClick = (val) => {
    setCategory(val);
  };

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
  };

  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    if (value <= priceRange[1]) {
      setPriceRange([value, priceRange[1]]);
    }
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value >= priceRange[0]) {
      setPriceRange([priceRange[0], value]);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setBrand("all");
    setPriceRange([0, 999999]);
  };

  return (
    <aside className="sticky top-24 hidden w-80 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl md:block">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-cyan-400/15 text-cyan-300 shadow-[0_18px_40px_rgba(56,189,248,0.16)]">
          <Filter className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            curated filters
          </p>
          <h2 className="text-lg font-semibold text-white">
            Refine your search
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search within products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {UniqueCategory.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCategoryClick(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-white/10 text-slate-200 hover:bg-white/15"
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Brand
          </h3>
          <select
            className="w-full rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            value={brand}
            onChange={handleBrandChange}
          >
            {UniqueBrand.map((item, index) => (
              <option key={index} value={item}>
                {item.toUpperCase()}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Price range
            </h3>
            <p className="text-sm font-semibold text-slate-200">
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              value={priceRange[0]}
              onChange={handleMinChange}
              className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none"
            />
            <input
              type="number"
              min="0"
              value={priceRange[1]}
              onChange={handleMaxChange}
              className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none"
            />
          </div>

          <input
            type="range"
            min="0"
            max="999999"
            step="100"
            className="w-full accent-cyan-400"
            value={priceRange[0]}
            onChange={handleMinChange}
          />
          <input
            type="range"
            min="0"
            max="999999"
            step="100"
            className="w-full accent-cyan-400"
            value={priceRange[1]}
            onChange={handleMaxChange}
          />
        </section>

        <Button onClick={resetFilters} className="w-full" variant="secondary">
          <RotateCcw className="h-4 w-4" />
          Reset filters
        </Button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
