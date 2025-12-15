"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = typeof data.detail === 'string' ? data.detail : 'Login failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      login(data.access_token, {
        id: data.user.user_id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#28587B] to-[#163548] flex items-center justify-center px-6 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7F7CAF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#28587B]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#7F7CAF] to-[#28587B] rounded-xl flex items-center justify-center shadow-lg shadow-[#7F7CAF]/25">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-[#9FB4C7] to-[#7F7CAF] bg-clip-text text-transparent">
            ShareIt
          </span>
        </Link>

        {/* Form Card */}
        <div className="bg-[#0f2530]/80 backdrop-blur-xl border border-[#28587B]/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#EEEEFF] mb-2">Welcome Back</h1>
            <p className="text-[#9FB4C7]">Sign in to continue to ShareIt</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {typeof error === 'string' ? error : 'An error occurred'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#9FB4C7] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF] focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9FB4C7] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF] focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] hover:from-[#9995c4] hover:to-[#3a6d91] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#7F7CAF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#9FB4C7]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#7F7CAF] hover:text-[#9995c4] font-semibold transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#9FB4C7]/70 hover:text-[#EEEEFF] transition inline-flex items-center gap-2">
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

export default LoginForm;
