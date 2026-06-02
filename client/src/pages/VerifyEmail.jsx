import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  const verifyEmail = async () => {
    if (!token) {
      setStatus(
        "❌ Verification token is missing. Please use the link from your email.",
      );
      return;
    }

    try {
      const res = await api.post(
        "/user/verify",
        { token },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        setStatus("✅ Email verified successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setStatus(
        `❌ ${getApiErrorMessage(
          error,
          "Verification failed. The token may be invalid or expired.",
        )}`,
      );
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-md surface-card p-10 text-center">
        <p className="badge-pill mb-4">Email verification</p>
        <h2 className="text-2xl font-semibold text-white">{status}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          You will be redirected once verification completes.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
