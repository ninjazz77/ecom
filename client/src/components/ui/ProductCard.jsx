import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../button";
import { Heart, ShoppingCart, Sparkles } from "lucide-react";
import { Skeleton } from "./skeleton";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/productsSlice";
import api, { getApiErrorMessage } from "@/lib/api";

const ProductCard = ({ product, loading }) => {
  const { productImg = [], productPrice, productName } = product || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isActive = product?.isActive !== false;
  const stock = Number(product?.stock || 0);
  const canPurchase = isActive && stock > 0;

  const addtoCart = async (productId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Login to add items to your cart.");
      setTimeout(() => navigate("/login"), 900);
      return;
    }

    try {
      const res = await api.post("/cart/add", { productId });
      if (res.data.success) {
        toast.success("Added to cart");
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add item"));
    }
  };

  return (
    <div className="group overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/95 shadow-[0_25px_80px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_36px_110px_rgba(15,23,42,0.18)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-slate-100">
        {loading ? (
          <Skeleton className="h-full w-full rounded-[1.75rem]" />
        ) : (
          <>
            <img
              src={productImg[0]?.url || "/Flux.png"}
              alt={productName || "Product"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-amber-100/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {product?.isFeatured ? "Featured" : "Collection"}
            </div>
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition hover:bg-white"
              onClick={() => toast.info("Wishlist coming soon")}
            >
              <Heart className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-4 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
          <Skeleton className="h-11 rounded-[1.5rem]" />
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div>
            <h2 className="line-clamp-2 text-lg font-semibold text-slate-950">
              {productName}
            </h2>
            <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-500">
              {product?.category || "General"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {product?.isFeatured && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                Featured
              </span>
            )}
            {!isActive && (
              <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-600">
                Disabled
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Starting at
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                ₹{Number(productPrice || 0).toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Fast ship
            </span>
          </div>
          <Button
            onClick={() => addtoCart(product._id)}
            className="w-full"
            disabled={!canPurchase}
          >
            <ShoppingCart />
            {canPurchase ? "Add to cart" : "Unavailable"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
