"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              ShareIt
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#items" className="text-slate-400 hover:text-white transition font-medium">
              Browse
            </Link>
            <Link href="/#how" className="text-slate-400 hover:text-white transition font-medium">
              How it Works
            </Link>
            <Link href="/#trust" className="text-slate-400 hover:text-white transition font-medium">
              Trust & Safety
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Logged In State */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/dashboard?role=borrower"
                    className="px-4 py-2.5 text-brand-300 hover:text-white font-medium transition border border-brand-500/30 hover:border-brand-500 rounded-xl hover:bg-brand-500/10"
                  >
                    Become Borrower
                  </Link>
                  <Link
                    href="/dashboard?role=lender"
                    className="px-4 py-2.5 text-accent-400 hover:text-white font-medium transition border border-accent-500/30 hover:border-accent-500 rounded-xl hover:bg-accent-500/10"
                  >
                    Become Lender
                  </Link>
                </div>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-surface-800/50 hover:bg-surface-800 rounded-xl transition border border-surface-700"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.full_name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-white font-medium hidden sm:block">{user?.full_name?.split(" ")[0]}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-surface-700">
                        <p className="text-white font-semibold">{user?.full_name}</p>
                        <p className="text-slate-400 text-sm">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-surface-700 rounded-lg transition"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/wallet"
                          className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-surface-700 rounded-lg transition"
                        >
                          Wallet
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Logged Out State */}
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
