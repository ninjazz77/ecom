import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Zap, ArrowRight, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import { setCart } from "@/redux/productsSlice";
import api, { getApiErrorMessage } from "@/lib/api";

const Login = () => {
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState({ email: "", password: "" });
  const navigate                  = useNavigate();
  const dispatch                  = useDispatch();

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    
    if (!form.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post("/user/login", form);
      if (res.data.success) {
        // Store token first
        localStorage.setItem("accessToken", res.data.accessToken);
        
        // Then dispatch user (this triggers cart loading in App.jsx)
        dispatch(setUser(res.data.user));
        
        // Load cart immediately
        try {
          const cartRes = await api.get("/cart");
          if (cartRes.data?.success) {
            dispatch(setCart(cartRes.data.cart));
          }
        } catch {
          dispatch(setCart(null));
        }
        
        toast.success("Welcome back! ✨");
        navigate("/");
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Login failed");
      toast.error(errorMessage);
      console.error("Login error:", err.response?.data || err.message);
      
      // Special handling for unverified email
      if (err.response?.data?.message?.toLowerCase().includes("not verified")) {
        setTimeout(() => {
          const shouldResend = window.confirm("Your email is not verified. Would you like to resend the verification email?");
          if (shouldResend) {
            navigate("/verify");
          }
        }, 1500);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Orbs */}
      <div className="glow-orb w-96 h-96 bg-violet-700 -top-20 -left-20 opacity-20" />
      <div className="glow-orb w-80 h-80 bg-pink-600 -bottom-20 -right-20 opacity-20" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left – brand panel */}
        <div className="hidden lg:flex flex-col gap-8 animate-fade-up">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <span className="font-display text-2xl font-black text-white">Flux.</span>
          </Link>

          <div>
            <span className="badge badge-purple mb-4">
              <Sparkles className="h-3 w-3" /> Welcome Back
            </span>
            <h1 className="font-display text-5xl text-white leading-tight">
              Sign back in and continue your journey.
            </h1>
            <p className="mt-4 text-white/45 leading-relaxed">
              Access your orders, wishlist, and personalized recommendations instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Secure Session", text: "End-to-end protected" },
              { icon: ArrowRight, title: "Fast Checkout", text: "Skip the long forms" },
            ].map(({ icon, title, text }) => (
              <div key={title} className="glass-card p-5">
                {React.createElement(icon, {
                  className: "h-5 w-5 text-violet-400 mb-3",
                })}
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-white/40 mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right – form */}
        <div className="glass-strong rounded-4xl p-8 animate-scale-in">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-black text-white">Flux.</span>
          </Link>

          <h2 className="font-display text-3xl text-white">Sign In</h2>
          <p className="text-sm text-white/40 mt-2">Enter your credentials to continue</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Email</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={onChange}
                placeholder="you@example.com"
                className="input-dark w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPw ? "text" : "password"} required
                  value={form.password} onChange={onChange}
                  placeholder="••••••••"
                  className="input-dark w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-glow w-full justify-center py-3.5 text-base disabled:opacity-50">
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-sm text-center text-white/35">
            <p>
              No account?{" "}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition">
                Create one
              </Link>
            </p>
            <p>
              Admin?{" "}
              <Link to="/admin-login" className="text-pink-400 hover:text-pink-300 font-semibold transition">
                Admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
