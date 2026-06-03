import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Zap, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import api, { getApiErrorMessage } from "@/lib/api";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error("Please enter your last name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/user/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);

        // Update Redux state with user data
        dispatch(setUser(response.data.user));

        toast.success("Account created successfully! Welcome to Flux! 🎉");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Registration failed");
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const PERKS = [
    "Personalized recommendations",
    "Order history & tracking",
    "Exclusive member deals",
    "Faster checkout every time",
  ];

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="glow-orb w-96 h-96 bg-pink-600 -top-24 -right-24 opacity-20" />
      <div className="glow-orb w-80 h-80 bg-cyan-600 -bottom-24 -left-24 opacity-15" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center animate-scale-in">
        {/* Left: Form */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-black text-white">
              Flux.
            </span>
          </Link>

          <div className="glass-strong rounded-4xl p-8 space-y-6">
            <div>
              <h2 className="font-display text-3xl text-white">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Join Flux and start shopping smarter
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="text-xs font-semibold uppercase tracking-wider text-white/40"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="input-dark w-full"
                    autoComplete="given-name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="text-xs font-semibold uppercase tracking-wider text-white/40"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="input-dark w-full"
                    autoComplete="family-name"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-white/40"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-dark w-full"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-white/40"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-dark w-full pr-10"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-white/35">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="pt-4 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-semibold transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Benefits */}
        <div className="hidden lg:block space-y-6">
          <div className="glass rounded-3xl p-8 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white mb-3">
                Join Flux Today
              </h3>
              <ul className="space-y-3">
                {PERKS.map((perk, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/70">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-400 to-pink-400" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
