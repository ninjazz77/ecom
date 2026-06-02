import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingCart,
  Heart,
  Star,
  Zap,
  CheckCircle2,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/productsSlice";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/api";

const ProductDetailsModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const images = product?.productImg?.length
    ? product.productImg
    : [{ url: "/Flux.png" }];
  const price = Number(product?.productPrice || 0);
  const stock = Number(product?.stock || 0);
  const canPurchase = product?.isActive !== false && stock > 0;

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const nextImg = () => setActiveImg((p) => (p + 1) % images.length);
  const prevImg = () =>
    setActiveImg((p) => (p - 1 + images.length) % images.length);

  const addToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Sign in to add items to cart.");
      setTimeout(() => navigate("/login"), 800);
      return;
    }
    try {
      setAddingToCart(true);
      const res = await api.post("/cart/add", {
        productId: product._id,
        quantity: qty,
      });
      if (res.data.success) {
        toast.success(`Added ${qty} item${qty > 1 ? "s" : ""} to cart ✨`);
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add item"));
    } finally {
      setAddingToCart(false);
    }
  };

  const PERKS = [
    { icon: Truck, text: "Free delivery on orders over ₹999" },
    { icon: Shield, text: "Secure & encrypted checkout" },
    { icon: Package, text: "Easy 30-day returns" },
    { icon: CheckCircle2, text: "Authentic & quality guaranteed" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product?.productName}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-4xl max-h-[95vh] overflow-y-auto thin-scroll rounded-t-3xl sm:rounded-3xl animate-modal-in bg-[#0f0f14] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid sm:grid-cols-2 gap-0">
          {/* Image section */}
          <div className="relative bg-white/3 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={images[activeImg]?.url}
                alt={product?.productName}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f0f14] to-transparent" />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full glass flex items-center justify-center text-white hover:bg-white/15 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full glass flex items-center justify-center text-white hover:bg-white/15 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product?.isFeatured && (
                  <span className="badge badge-purple">
                    <Star className="h-2.5 w-2.5" /> Featured
                  </span>
                )}
                {stock <= 5 && stock > 0 && (
                  <span className="badge badge-amber">
                    <Zap className="h-2.5 w-2.5" /> Only {stock} left
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto thin-scroll">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 h-14 w-14 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImg ? "border-violet-500" : "border-white/10"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="p-7 flex flex-col gap-5">
            {/* Category & brand */}
            <div className="flex items-center gap-2">
              <span className="badge badge-cyan">
                {product?.category || "General"}
              </span>
              {product?.brand && (
                <span className="badge badge-slate">{product?.brand}</span>
              )}
            </div>

            <div>
              <h2 className="font-display text-2xl text-white leading-tight">
                {product?.productName}
              </h2>

              {/* Stars */}
              <div className="flex items-center gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-white/15"}`}
                  />
                ))}
                <span className="text-sm text-white/40 ml-1">
                  4.0 (48 reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <p className="font-display text-4xl font-black gradient-text">
                ₹{price.toLocaleString()}
              </p>
              <p className="text-sm text-white/30 mb-1 line-through">
                ₹{(price * 1.2).toLocaleString()}
              </p>
              <span className="badge badge-green mb-1">20% OFF</span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {canPurchase ? (
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  In stock ({stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-400">Out of stock</span>
              )}
            </div>

            {/* Description */}
            {product?.productDesc && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">
                  Description
                </p>
                <p className="text-sm text-white/60 leading-relaxed line-clamp-4">
                  {product.productDesc}
                </p>
              </div>
            )}

            {/* Quantity + Add to cart */}
            {canPurchase && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-7 w-7 rounded-xl bg-white/8 flex items-center justify-center text-white hover:bg-white/15 transition text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-white font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    className="h-7 w-7 rounded-xl bg-white/8 flex items-center justify-center text-white hover:bg-white/15 transition text-lg font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={addToCart}
                  disabled={addingToCart}
                  className="flex-1 btn-glow justify-center py-3 disabled:opacity-60"
                >
                  {addingToCart ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Adding…
                    </span>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={() => toast.info("Wishlist coming soon!")}
                  className="h-12 w-12 rounded-2xl glass flex items-center justify-center text-white/50 hover:text-pink-400 transition"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Perks */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {PERKS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/40 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
