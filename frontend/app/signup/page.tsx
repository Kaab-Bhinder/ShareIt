"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function SignupForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          address: formData.address || null,
          role: "borrower",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = typeof data.detail === 'string' ? data.detail : 'Registration failed';
        throw new Error(errorMessage);
      }

      // Auto-login after signup
      const loginResponse = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        login(loginData.access_token, {
          id: loginData.user.user_id,
          email: loginData.user.email,
          full_name: loginData.user.full_name,
          role: loginData.user.role,
        });
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-surface via-primary-surface-light to-primary-surface-dark flex items-center justify-center px-6 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary-surface-light/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-surface-light rounded-xl flex items-center justify-center shadow-lg shadow-primary-400/25">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-muted to-primary-400 bg-clip-text text-transparent">
            ShareIt
          </span>
        </Link>

        {/* Form Card */}
        <div className="bg-[#0f2530]/80 backdrop-blur-xl border border-primary-surface-light/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-muted">Join ShareIt today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
Summarizing
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                placeholder="Muhammad Kaab"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  placeholder="Enter Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Confirm</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                placeholder="+92 3XX XXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Address (Optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                placeholder="Your address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-400 to-primary-surface-light hover:from-primary-500 hover:to-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-400/20 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-400 hover:text-[#5ce196] font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-muted/70 hover:text-white transition inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
