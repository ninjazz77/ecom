import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/productsSlice";
import api, { getApiErrorMessage } from "@/lib/api";

const ProductCard = ({ product, loading, onOpenDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productImg = [], productPrice, productName } = product || {};
  const isActive = product?.isActive !== false;
  const stock = Number(product?.stock || 0);
  const canPurchase = isActive && stock > 0;

  const addToCart = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Sign in to add items to cart.");
      setTimeout(() => navigate("/login"), 800);
      return;
    }
    try {
      const res = await api.post("/cart/add", { productId: product._id });
      if (res.data.success) {
        toast.success("Added to cart ✨");
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add item"));
    }
  };

  if (loading) {
    return (
      <div className="product-card rounded-3xl overflow-hidden">
        <div className="aspect-[4/5] animate-shimmer" />
        <div className="p-5 space-y-3">
          <div className="h-4 w-3/4 rounded-full animate-shimmer" />
          <div className="h-4 w-1/2 rounded-full animate-shimmer" />
          <div className="h-10 rounded-2xl animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="product-card"
      onClick={() => onOpenDetails && onOpenDetails(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpenDetails && onOpenDetails(product)}
      aria-label={`View details for ${productName}`}
    >
      <div className="img-wrap">
        <img
          src={productImg[0]?.url || "/Ekart.png"}
          alt={productName || "Product"}
          loading="lazy"
        />
        {/* overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product?.isFeatured && (
            <span className="badge badge-purple">
              <Star className="h-2.5 w-2.5" /> Featured
            </span>
          )}
          {stock <= 5 && stock > 0 && (
            <span className="badge badge-amber">
              <Zap className="h-2.5 w-2.5" /> Low Stock
            </span>
          )}
          {!canPurchase && (
            <span className="badge badge-red">Sold Out</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toast.info("Wishlist coming soon!"); }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-pink-400 transition"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {product?.category || "General"}
          </p>
          <h3 className="mt-1.5 text-base font-semibold text-white line-clamp-2 leading-snug">
            {productName}
          </h3>
        </div>

        {/* Rating mock */}
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              className={`h-3 w-3 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
            />
          ))}
          <span className="text-[10px] text-white/30 ml-1">(48)</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-display font-black text-white">
              ₹{Number(productPrice || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">Free shipping over ₹999</p>
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={!canPurchase}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              canPurchase
                ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-glow hover:-translate-y-0.5"
                : "bg-white/8 text-white/30 cursor-not-allowed"
            }`}
            aria-label={canPurchase ? "Add to cart" : "Unavailable"}
          >
            <ShoppingCart className="h-4 w-4" />
            {canPurchase ? "Add" : "Out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
