import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api, { getApiErrorMessage } from "@/lib/api";

const Signup = () => {
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", password: "" });
  const navigate              = useNavigate();

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post("/user/register", form);
      if (res.data.success) {
        localStorage.setItem("pendingVerificationEmail", form.email);
        toast.success(res.data.message || "Account created! Check your email.");
        navigate("/verify");
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Signup failed");
      toast.error(errorMessage);
      console.error("Signup error:", err.response?.data || err.message);
    } finally { setLoading(false); }
  };

  const PERKS = [
    "Personalized recommendations",
    "Order history & tracking",
    "Exclusive member deals",
    "Faster checkout every time",
  ];

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="glow-orb w-96 h-96 bg-pink-600 -top-24 -right-24 opacity-20" />
      <div className="glow-orb w-80 h-80 bg-cyan-600 -bottom-24 -left-24 opacity-15" />
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
            <span className="badge badge-pink mb-4">
              <Sparkles className="h-3 w-3" /> Join Flux
            </span>
            <h1 className="font-display text-5xl text-white leading-tight">
              Create your account today.
            </h1>
            <p className="mt-4 text-white/45 leading-relaxed">
              Join millions of shoppers who trust Flux for premium products and a seamless experience.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-sm text-white/60">
                <span className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Right – form */}
        <div className="glass-strong rounded-4xl p-8 animate-scale-in">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-black text-white">Flux.</span>
          </Link>

          <h2 className="font-display text-3xl text-white">Create Account</h2>
          <p className="text-sm text-white/40 mt-2">Fill in the details to get started</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">First Name</label>
                <input name="firstName" type="text" required value={form.firstName} onChange={onChange}
                  placeholder="John" className="input-dark w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Last Name</label>
                <input name="lastName" type="text" required value={form.lastName} onChange={onChange}
                  placeholder="Doe" className="input-dark w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Email</label>
              <input name="email" type="email" required value={form.email} onChange={onChange}
                placeholder="you@example.com" className="input-dark w-full" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? "text" : "password"} required value={form.password} onChange={onChange}
                  placeholder="Create a password" className="input-dark w-full pr-12" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-glow w-full justify-center py-3.5 text-base disabled:opacity-50 mt-2">
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                <><UserPlus className="h-4 w-4" /> Create Account</>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-white/35">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
