import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, X, ShoppingCart, Menu, User, LayoutDashboard, LogOut, Zap } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import { setCart } from "@/redux/productsSlice";
import api from "@/lib/api";

const Navbar = () => {
  const { user } = useSelector((s) => s.user);
  const { cart } = useSelector((s) => s.product);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  const resolvedUserId = user?._id || user?.id;
  const cartCount =
    cart?.items?.reduce((count, item) => count + Number(item.quantity || 0), 0) ||
    0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMenuOpen(false);
      setSearchOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  const logout = async () => {
    try {
      await api.post("/user/logout", {});
    } catch {
      // Local logout should still proceed if the server session is gone.
    }
    localStorage.removeItem("token");
    dispatch(setUser(null));
    dispatch(setCart(null));
    toast.success("See you soon!");
    navigate("/login");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setSearchOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 animate-gradient" />
              <Zap className="relative z-10 h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-white hidden sm:block">
              Flux<span className="gradient-text">.</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/6"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen((p) => !p)}
              className="h-10 w-10 flex items-center justify-center rounded-full glass text-white/70 hover:text-white transition"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative h-10 w-10 flex items-center justify-center rounded-full glass text-white/70 hover:text-white transition"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-[10px] font-bold text-white px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="hidden sm:flex h-10 px-4 items-center gap-2 rounded-full glass text-white/70 hover:text-white text-sm font-medium transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}

            {/* Account / Login */}
            {resolvedUserId ? (
              <Link
                to={`/profile/${resolvedUserId}`}
                className="hidden sm:flex h-10 px-4 items-center gap-2 rounded-full glass text-white/70 hover:text-white text-sm font-medium transition"
              >
                <User className="h-4 w-4" />
                Account
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex btn-glow text-sm py-2 px-5"
              >
                Sign in
              </Link>
            )}

            {resolvedUserId && (
              <button
                onClick={logout}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full glass text-white/50 hover:text-red-400 transition"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full glass text-white/70 hover:text-white transition"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-white/8 px-4 py-3 lg:px-6 animate-fade-up glass">
            <form onSubmit={submitSearch} className="mx-auto max-w-2xl flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  className="input-dark w-full pl-11"
                />
              </div>
              <button type="submit" className="btn-glow py-2 px-5 text-sm">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/8 glass animate-fade-up">
            <div className="px-4 py-5 space-y-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/6 text-sm font-medium transition"
                >
                  {label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/6 text-sm font-medium transition"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
              {resolvedUserId ? (
                <>
                  <Link
                    to={`/profile/${resolvedUserId}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/6 text-sm font-medium transition"
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-400/10 text-sm font-medium transition w-full"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center btn-glow text-sm py-2.5 rounded-2xl"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
