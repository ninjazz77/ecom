import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { Grid3X3, LayoutList, SlidersHorizontal, Search, X } from "lucide-react";
import { toast } from "sonner";

import FilterSidebar from "@/components/ui/FilterSidebar";
import ProductCard from "@/components/ui/ProductCard";
import ProductDetailsModal from "@/components/ui/ProductDetailsModal";
import { setProducts } from "@/redux/productsSlice";
import api from "@/lib/api";

const Products = () => {
  const { products } = useSelector((s) => s.product);
  const dispatch     = useDispatch();

  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("all");
  const [brand, setBrand]             = useState("all");
  const [priceRange, setPriceRange]   = useState([0, 999999]);
  const [sortOrder, setSortOrder]     = useState("");
  const [viewMode, setViewMode]       = useState("grid"); // grid | list
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct]   = useState(null);

  const counts = useMemo(() => ({
    total:    (products || []).length,
    featured: (products || []).filter((p) => p.isFeatured).length,
    active:   (products || []).filter((p) => p.isActive !== false).length,
  }), [products]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/product/getallproducts");
        const list = res.data.products || [];
        setAllProducts(list);
        dispatch(setProducts(list));
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("category") || "";
    if (q) setSearch(q);
    if (c) setCategory(c);
  }, [searchParams]);

  useEffect(() => {
    if (!allProducts.length) return;

    let filtered = [...allProducts];
    if (search.trim()) filtered = filtered.filter((p) => p.productName?.toLowerCase().includes(search.toLowerCase()));
    if (category !== "all") filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    if (brand !== "all")    filtered = filtered.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    filtered = filtered.filter((p) => p.productPrice >= priceRange[0] && p.productPrice <= priceRange[1]);

    if (sortOrder === "lowToHigh") filtered.sort((a, b) => a.productPrice - b.productPrice);
    if (sortOrder === "highToLow") filtered.sort((a, b) => b.productPrice - a.productPrice);
    if (sortOrder === "newest")    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    dispatch(setProducts(filtered));
  }, [search, category, brand, priceRange, sortOrder, allProducts, dispatch]);

  const SORT_OPTIONS = [
    { value: "",           label: "Relevance" },
    { value: "newest",     label: "Newest First" },
    { value: "lowToHigh",  label: "Price: Low → High" },
    { value: "highToLow",  label: "Price: High → Low" },
  ];

  return (
    <div className="min-h-screen bg-bg text-white pt-20">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/6 py-16 px-4 lg:px-6">
        <div className="glow-orb w-96 h-96 bg-violet-700 -top-48 right-0 opacity-20" />
        <div className="glow-orb w-64 h-64 bg-pink-600 bottom-0 left-0 opacity-15" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <span className="section-label text-violet-400">Product Catalog</span>
          <h1 className="font-display text-5xl md:text-7xl text-white mt-3 animate-fade-up">
            Explore <span className="gradient-text">Everything</span>
          </h1>
          <p className="mt-4 text-white/45 max-w-xl animate-fade-up delay-100 opacity-0">
            Discover thousands of premium products with powerful filters and a seamless browsing experience.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8 animate-fade-up delay-200 opacity-0">
            {[
              { n: counts.total,    l: "Products" },
              { n: counts.featured, l: "Featured" },
              { n: counts.active,   l: "In Stock" },
            ].map(({ n, l }) => (
              <div key={l} className="glass rounded-2xl px-5 py-3 flex items-center gap-3">
                <p className="font-display text-2xl font-black text-white">{n}</p>
                <p className="text-xs text-white/30 uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            brand={brand} setBrand={setBrand}
            priceRange={priceRange} setPriceRange={setPriceRange}
            allProducts={allProducts}
          />

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm text-white/40">
                Showing <strong className="text-white">{(products || []).length}</strong> results
              </p>
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="md:hidden btn-ghost text-sm py-2 px-4"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>

                {/* Sort */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="input-dark text-sm py-2.5 pr-8 rounded-2xl"
                  style={{ width: "180px" }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0f0f14]">
                      {o.label}
                    </option>
                  ))}
                </select>

                {/* View toggle */}
                <div className="flex glass rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30"}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30"}`}
                    aria-label="List view"
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <ProductCard key={i} product={{ productImg: [] }} loading />
                  ))
                : (products || []).length === 0
                ? (
                  <div className="col-span-full glass rounded-3xl p-16 text-center">
                    <Search className="h-10 w-10 text-white/20 mx-auto mb-4" />
                    <p className="font-display text-xl text-white/40">No products found</p>
                    <p className="text-sm text-white/25 mt-2">Try adjusting your filters</p>
                  </div>
                )
                : (products || []).map((p) => (
                    <ProductCard key={p._id} product={p} onOpenDetails={setSelectedProduct} />
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-[320px] bg-[#0f0f14] border-l border-white/8 overflow-y-auto thin-scroll p-5 animate-slide-right">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-white text-xl">Filters</p>
              <button onClick={() => setMobileFilterOpen(false)} className="h-9 w-9 glass rounded-full flex items-center justify-center text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterSidebar
              search={search} setSearch={setSearch}
              category={category} setCategory={setCategory}
              brand={brand} setBrand={setBrand}
              priceRange={priceRange} setPriceRange={setPriceRange}
              allProducts={allProducts}
            />
          </div>
        </div>
      )}

      {/* Product details modal */}
      {selectedProduct && (
        <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default Products;
