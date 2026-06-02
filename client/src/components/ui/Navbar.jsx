import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, X, ShoppingCart } from "lucide-react";
import { RiMenu3Line, RiDashboardLine, RiUser3Line } from "react-icons/ri";

import { Button } from "../button";
import { Input } from "../input";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import { setCart } from "@/redux/productsSlice";
import api from "@/lib/api";

const Navbar = () => {
  const { user } = useSelector((store) => store.user);
  const { cart } = useSelector((store) => store.product);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const resolvedUserId = user?._id || user?.id;
  const cartCount = cart?.items?.length || 0;

  const logoutHandler = async () => {
    try {
      await api.post("/user/logout", {});
    } catch {
      console.log("Backend logout failed, forcing frontend logout");
    } finally {
      localStorage.removeItem("accessToken");
      dispatch(setUser(null));
      dispatch(setCart(null));
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    navigate(`/products?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-[#ffd500] text-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] sm:flex-nowrap">
          <span>10 Cr+ products sold</span>
          <span className="text-slate-800/90">
            Free shipping on orders above ₹999 • 24x7 support
          </span>
        </div>
      </div>
      <div className="bg-white shadow-[0_15px_45px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link to="/" className="flex items-center gap-3 text-slate-950">
            <span className="logo inline-flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-black text-lg font-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.15)]">
              F
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-900">
                Flux
              </p>
              <p className="text-base font-semibold text-slate-700">
                Shop the latest
              </p>
            </div>
          </Link>

          <form
            onSubmit={submitSearch}
            className="hidden flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 lg:flex"
          >
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, brands or styles"
              className="h-auto border-0 bg-transparent px-0 py-0 text-slate-950 placeholder:text-slate-500 shadow-none focus-visible:ring-0"
            />
          </form>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/products"
              className="text-sm font-semibold text-slate-900 transition hover:text-slate-700"
            >
              Shop
            </Link>
            {user?.role === "admin" ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-200"
              >
                <RiDashboardLine className="h-4 w-4" /> Admin
              </Link>
            ) : null}
            {resolvedUserId ? (
              <Link
                to={`/profile/${resolvedUserId}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-200"
              >
                <RiUser3Line className="h-4 w-4" /> Account
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-900 transition hover:text-slate-700"
              >
                Login
              </Link>
            )}
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-3 py-3 text-slate-900 transition hover:bg-slate-200"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-950 px-2 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            {resolvedUserId ? (
              <Button onClick={logoutHandler} variant="secondary">
                Logout
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")}>Get started</Button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-900 shadow-[0_15px_35px_rgba(15,23,42,0.12)] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <RiMenu3Line className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen ? (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4">
            <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <form onSubmit={submitSearch} className="space-y-3">
                <div className="relative rounded-[1.5rem] border border-slate-200 bg-white px-4 py-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search the catalog"
                    className="pl-11 bg-transparent text-slate-950"
                  />
                </div>
              </form>
              <div className="grid gap-3">
                <Link
                  to="/products"
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Shop
                </Link>
                {user?.role === "admin" ? (
                  <Link
                    to="/admin"
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                ) : null}
                {resolvedUserId ? (
                  <Link
                    to={`/profile/${resolvedUserId}`}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/cart"
                  className="relative inline-flex h-12 min-w-[3rem] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-100 text-slate-900 transition hover:bg-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-950 px-2 text-[11px] font-semibold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
                {resolvedUserId ? (
                  <Button
                    onClick={logoutHandler}
                    className="flex-1"
                    variant="secondary"
                  >
                    Logout
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/login")} className="flex-1">
                    Get started
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
