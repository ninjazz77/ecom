import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api, { getApiErrorMessage } from "@/lib/api";

const Verify = () => {
  const [email, setEmail] = useState(
    localStorage.getItem("pendingVerificationEmail") || "",
  );
  const [loading, setLoading] = useState(false);

  const resendVerification = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Enter the email address used during signup.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/user/reVerify", { email });
      toast.success(res.data?.message || "Verification email sent.");
      localStorage.setItem("pendingVerificationEmail", email);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to resend verification email."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center justify-center">
        <div className="w-full surface-card p-10">
          <div className="mb-6">
            <p className="badge-pill mb-4">Email verification</p>
            <h2 className="text-3xl font-semibold text-white">
              Check your inbox
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              We sent a verification link to your email. If it does not arrive,
              resend it below or check your spam folder.
            </p>
          </div>

          <form onSubmit={resendVerification} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? "Sending..." : "Resend verification email"}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <Link
              to="/login"
              className="font-semibold text-cyan-300 transition hover:text-white"
            >
              Back to login
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("pendingVerificationEmail");
                setEmail("");
              }}
              className="font-semibold text-slate-400 transition hover:text-white"
            >
              Clear saved email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
