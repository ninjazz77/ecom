import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Zap,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/productsSlice";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const formatCurrency = (value) => `₹${currencyFormatter.format(Number(value || 0))}`;

const getCartItemDetails = (item) => {
  const product =
    item?.productId && typeof item.productId === "object" ? item.productId : null;
  const productId = product?._id || item?.productId || item?._id;
  const price = Number(product?.productPrice ?? item?.price ?? 0);
  const quantity = Number(item?.quantity || 0);

  return {
    id: String(productId || item?._id || ""),
    name: product?.productName || item?.productName || "Product unavailable",
    image: product?.productImg?.[0]?.url || item?.productImg?.[0]?.url || "/Flux.png",
    price,
    quantity,
    category: product?.category || item?.category || "Cart item",
    lineTotal: price * quantity,
    isAvailable: Boolean(product),
  };
};

const Cart = () => {
  const [cart, setCartState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const dispatch = useDispatch();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      if (res.data.success) {
        setCartState(res.data.cart);
        dispatch(setCart(res.data.cart));
      }
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQty = async (productId, type) => {
    try {
      setBusyId(`${productId}-${type}`);
      const res = await api.put("/cart/update", { productId, type });
      if (res.data.success) {
        setCartState(res.data.cart);
        dispatch(setCart(res.data.cart));
      }
    } catch {
      toast.error("Unable to update cart");
    } finally {
      setBusyId("");
    }
  };

  const removeItem = async (productId) => {
    try {
      setBusyId(productId);
      const res = await api.delete("/cart/remove", { data: { productId } });
      if (res.data.success) {
        setCartState(res.data.cart);
        dispatch(setCart(res.data.cart));
        toast.success("Item removed");
      }
    } catch {
      toast.error("Unable to remove item");
    } finally {
      setBusyId("");
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Enter a shipping address");
      return;
    }
    try {
      setCheckoutLoading(true);
      const res = await api.post("/order/checkout", { shippingAddress });
      if (res.data?.success) {
        const empty = { items: [], totalPrice: 0 };
        setCartState(empty);
        dispatch(setCart(empty));
        setShippingAddress("");
        toast.success("Order placed successfully! 🎉");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const items = cart?.items || [];
  const total = Number(cart?.totalPrice || 0);
  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen bg-bg text-white pt-20">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/6 py-14 px-4 lg:px-6">
        <div className="glow-orb w-80 h-80 bg-violet-700 -top-40 right-0 opacity-20" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <span className="section-label text-pink-400">Your Bag</span>
          <h1 className="font-display text-5xl text-white mt-3">
            Shopping <span className="gradient-text">Cart</span>
          </h1>
          <p className="mt-3 text-white/40">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="h-12 w-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <p className="text-white/40">Loading your cart…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="h-24 w-24 rounded-4xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/8 flex items-center justify-center animate-float">
              <ShoppingBag className="h-10 w-10 text-violet-400" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-3xl text-white">
                Your cart is empty
              </h2>
              <p className="mt-2 text-white/40">
                Start shopping to add items here
              </p>
            </div>
            <Link to="/products" className="btn-glow">
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Items */}
            <div className="space-y-4">
              {items.map((item) => {
                const details = getCartItemDetails(item);
                const pid = details.id;
                const isBusy = busyId.startsWith(String(pid));

                return (
                  <div
                    key={item._id || pid}
                    className="glass-card p-5 flex gap-5"
                  >
                    {/* Image */}
                    <div className="h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden bg-white/4">
                      <img
                        src={details.image}
                        alt={details.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        {details.category}
                      </p>
                      <h3 className="font-semibold text-white mt-0.5 truncate">
                        {details.name}
                      </h3>
                      <p className="mt-1 font-display text-lg font-black gradient-text">
                        {formatCurrency(details.price)}
                      </p>
                      {!details.isAvailable && (
                        <p className="mt-1 text-xs text-amber-400">
                          This product needs to be refreshed or removed.
                        </p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end justify-between gap-3">
                      <button
                        onClick={() => removeItem(pid)}
                        disabled={isBusy}
                        className="btn-danger p-2 rounded-xl"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-2 glass rounded-2xl p-1.5">
                        <button
                          onClick={() => updateQty(pid, "decrease")}
                          disabled={
                            !details.isAvailable ||
                            busyId === `${pid}-decrease`
                          }
                          className="h-8 w-8 rounded-xl bg-white/8 flex items-center justify-center text-white hover:bg-white/15 transition font-bold text-lg"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-white">
                          {details.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(pid, "increase")}
                          disabled={
                            !details.isAvailable ||
                            busyId === `${pid}-increase`
                          }
                          className="h-8 w-8 rounded-xl bg-white/8 flex items-center justify-center text-white hover:bg-white/15 transition font-bold text-lg"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm text-white/40">
                        {formatCurrency(details.lineTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              {/* Coupon */}
              <div className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">
                    Coupon Code
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code…"
                    className="input-dark flex-1 text-sm"
                  />
                  <button
                    onClick={() => toast.info("Coupon feature coming soon!")}
                    className="btn-outline-accent text-sm py-2.5 px-4 whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="glass rounded-3xl p-5 space-y-4">
                <p className="font-display text-white text-lg font-bold">
                  Order Summary
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Shipping</span>
                    <span
                      className={
                        shipping === 0 ? "text-green-400" : "text-white"
                      }
                    >
                      {shipping === 0 ? "Free" : formatCurrency(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-amber-400 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Add {formatCurrency(999 - total)} more for free
                      shipping
                    </p>
                  )}
                  <div className="border-t border-white/8 pt-3 flex justify-between font-semibold text-white text-base">
                    <span>Total</span>
                    <span className="font-display font-black gradient-text text-xl">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Shipping address…"
                  className="input-dark w-full text-sm"
                />

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !items.length}
                  className="btn-glow w-full justify-center py-3.5 text-base disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {["Secure Pay", "Easy Returns", "24/7 Support"].map((t) => (
                    <div key={t} className="text-center">
                      <p className="text-[10px] text-white/30 leading-snug">
                        {t}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/products"
                className="btn-ghost w-full justify-center text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
