import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api, { getApiErrorMessage } from "@/lib/api";

const Verify = () => {
  const [email, setEmail] = useState(localStorage.getItem("pendingVerificationEmail") || "");
  const [loading, setLoading] = useState(false);

  const resend = async (e) => {
    e.preventDefault();
    if (!email.trim()) { 
      toast.error("Please enter your email address"); 
      return; 
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post("/user/reVerify", { email });
      toast.success(res.data?.message || "Verification email sent. Check your inbox!");
      localStorage.setItem("pendingVerificationEmail", email);
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Unable to resend verification email");
      toast.error(errorMessage);
      console.error("Resend verification error:", err.response?.data || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="glow-orb w-80 h-80 bg-cyan-700 -top-20 left-0 opacity-20" />
      <div className="glow-orb w-64 h-64 bg-violet-700 bottom-0 right-0 opacity-15" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-black text-white">Flux.</span>
        </Link>

        <div className="glass-strong rounded-4xl p-8 space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
            <Mail className="h-7 w-7 text-cyan-400" />
          </div>

          <div>
            <h2 className="font-display text-3xl text-white">Check your inbox</h2>
            <p className="mt-2 text-sm text-white/45 leading-relaxed">
              We sent a verification link to your email. Didn't get it? Resend it below.
            </p>
          </div>

          <form onSubmit={resend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/35">Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-dark w-full"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-glow w-full justify-center py-3 disabled:opacity-50">
              {loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Sending…</>
              ) : (
                <><RefreshCw className="h-4 w-4" />Resend Verification</>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-sm pt-2">
            <Link to="/login" className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
            <button onClick={() => { localStorage.removeItem("pendingVerificationEmail"); setEmail(""); }}
              className="text-white/25 hover:text-white/60 transition">
              Clear saved email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
