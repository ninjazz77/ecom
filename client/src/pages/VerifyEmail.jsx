import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/api";

const VerifyEmail = () => {
  const { token }       = useParams();
  const navigate        = useNavigate();
  const [state, setState] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setState("error"); setMessage("Verification token is missing."); return; }
    (async () => {
      try {
        const res = await api.post("/user/verify", { token }, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
          setState("success");
          setMessage("Email verified! Redirecting to login…");
          setTimeout(() => navigate("/login"), 2500);
        }
      } catch (err) {
        setState("error");
        setMessage(getApiErrorMessage(err, "Token invalid or expired."));
      }
    })();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="glow-orb w-80 h-80 bg-violet-700 top-0 right-0 opacity-20" />
      <div className="glow-orb w-64 h-64 bg-pink-700 bottom-0 left-0 opacity-15" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-black text-white">Flux.</span>
        </Link>

        <div className="glass-strong rounded-4xl p-10 flex flex-col items-center text-center space-y-6">
          {state === "loading" && (
            <>
              <div className="h-16 w-16 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
              <p className="font-display text-2xl text-white">Verifying…</p>
              <p className="text-sm text-white/40">Please wait a moment.</p>
            </>
          )}
          {state === "success" && (
            <>
              <div className="h-16 w-16 rounded-3xl bg-green-500/15 border border-green-500/25 flex items-center justify-center animate-scale-in">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <p className="font-display text-2xl text-white">Verified!</p>
              <p className="text-sm text-white/50">{message}</p>
            </>
          )}
          {state === "error" && (
            <>
              <div className="h-16 w-16 rounded-3xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <p className="font-display text-2xl text-white">Verification Failed</p>
              <p className="text-sm text-white/50">{message}</p>
              <Link to="/verify" className="btn-glow py-2 px-6 text-sm">
                Try Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
