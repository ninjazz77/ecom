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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#e2e8f0)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <h2 className="text-3xl font-semibold text-slate-950">
            Check your email
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            We sent a verification link to your inbox. If it does not arrive,
            resend it below or check spam and junk folders.
          </p>

          <form onSubmit={resendVerification} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending..." : "Resend verification email"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              Back to login
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("pendingVerificationEmail");
                setEmail("");
              }}
              className="font-semibold text-slate-600 underline underline-offset-4"
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
