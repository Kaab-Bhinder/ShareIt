"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Get initials for avatar
  const initials = user.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-primary-surface-light/30 transition"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-surface-light rounded-full flex items-center justify-center shadow-lg border-2 border-[#4ade80]/30">
          <span className="text-white font-semibold text-sm">{initials}</span>
        </div>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#0f2530] border border-primary-surface-light/50 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 border-b border-primary-surface-light/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-surface-light rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{initials}</span>
              </div>
              <div>
                <p className="text-white font-semibold">{user.full_name}</p>
                <p className="text-muted text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-muted hover:text-white hover:bg-primary-surface-light/20 rounded-xl transition"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/wallet"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-muted hover:text-white hover:bg-primary-surface-light/20 rounded-xl transition"
            >
              <span className="text-xl">💰</span>
              <span>Wallet</span>
            </Link>

            <Link
              href="/dashboard/bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-muted hover:text-white hover:bg-primary-surface-light/20 rounded-xl transition"
            >
              <span className="text-xl">📋</span>
              <span>My Bookings</span>
            </Link>

            <div className="border-t border-primary-surface-light/30 my-2" />

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
