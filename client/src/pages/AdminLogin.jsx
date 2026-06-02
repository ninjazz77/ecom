import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Eye, EyeOff, Shield, LayoutDashboard, Zap } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import api, { getApiErrorMessage } from "@/lib/api";

const AdminLogin = () => {
  const { user }      = useSelector((s) => s.user);
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ email: "", password: "" });

  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/user/login", form);
      if (res.data.success && res.data.user?.role === "admin") {
        dispatch(setUser(res.data.user));
        localStorage.setItem("accessToken", res.data.accessToken);
        toast.success("Admin access granted");
        navigate("/admin");
      } else {
        toast.error("Admin access required");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Login failed"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="glow-orb w-96 h-96 bg-violet-800 -top-20 -left-20 opacity-25" />
      <div className="glow-orb w-80 h-80 bg-pink-700 -bottom-20 right-0 opacity-15" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left */}
        <div className="hidden lg:flex flex-col gap-8 animate-fade-up">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <span className="font-display text-2xl font-black text-white">Flux.</span>
          </Link>

          <div>
            <span className="badge badge-purple mb-4">
              <Shield className="h-3 w-3" /> Restricted Access
            </span>
            <h1 className="font-display text-5xl text-white leading-tight">
              Admin Control Center
            </h1>
            <p className="mt-4 text-white/45 leading-relaxed">
              Manage products, orders, customers, coupons and more from a unified production dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield,          title: "Role Protected",   text: "Admin-only access" },
              { icon: LayoutDashboard, title: "Full Dashboard",   text: "12 management sections" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass-card p-5">
                <Icon className="h-5 w-5 text-violet-400 mb-3" />
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-white/40 mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="glass-strong rounded-4xl p-8 animate-scale-in">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-black text-white">Flux.</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-white">Admin Sign In</h2>
              <p className="text-xs text-white/35">Restricted to admin accounts only</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Admin Email</label>
              <input
                name="email" type="email" required value={form.email} onChange={onChange}
                placeholder="admin@example.com" className="input-dark w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPw ? "text" : "password"} required value={form.password} onChange={onChange}
                  placeholder="••••••••" className="input-dark w-full pr-12"
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-glow w-full justify-center py-3.5 text-base disabled:opacity-50">
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Authenticating…
                </>
              ) : (
                <><Shield className="h-4 w-4" /> Enter Dashboard</>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-white/35">
            Regular user?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
