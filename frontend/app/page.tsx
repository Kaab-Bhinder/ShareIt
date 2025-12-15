"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import ProfileDropdown from "./components/ProfileDropdown";

interface Item {
  id: number;
  title: string;
  description: string;
  daily_deposit: number;
  total_deposit: number;
  owner_name?: string;
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<"borrower" | "lender">("borrower");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:8000/items/");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#28587B] to-[#163548]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#1a3a4a]/90 border-b border-[#7F7CAF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F7CAF] to-[#28587B] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#9FB4C7] to-[#7F7CAF] bg-clip-text text-transparent">
                ShareIt
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#items" className="text-[#9FB4C7] hover:text-[#EEEEFF] transition font-medium">Browse</a>
              <a href="#how" className="text-[#9FB4C7] hover:text-[#EEEEFF] transition font-medium">How it Works</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Role Switch Button */}
                  {currentRole === "borrower" ? (
                    <Link
                      href="/lender"
                      onClick={() => setCurrentRole("lender")}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#28587B] to-[#7F7CAF] hover:from-[#3a6d91] hover:to-[#9995c4] text-white font-semibold rounded-xl transition shadow-lg hidden sm:block"
                    >
                      Become Lender
                    </Link>
                  ) : (
                    <Link
                      href="/borrower"
                      onClick={() => setCurrentRole("borrower")}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] hover:from-[#9995c4] hover:to-[#3a6d91] text-white font-semibold rounded-xl transition shadow-lg hidden sm:block"
                    >
                      Become Borrower
                    </Link>
                  )}
                  
                  {/* Profile Dropdown */}
                  <ProfileDropdown />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-[#9FB4C7] hover:text-[#EEEEFF] font-medium transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] hover:from-[#9995c4] hover:to-[#3a6d91] text-white font-semibold rounded-xl transition shadow-lg shadow-[#7F7CAF]/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7F7CAF]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#28587B]/30 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#163548]/50 rounded-full border border-[#28587B]/50 mb-8">
              <span className="w-2 h-2 bg-[#9FB798] rounded-full animate-pulse" />
              <span className="text-[#9FB4C7] text-sm">Trusted by 10,000+ users</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-[#EEEEFF] mb-6 leading-tight">
              Rent Anything<br/>
              <span className="bg-gradient-to-r from-[#7F7CAF] via-[#9FB4C7] to-[#28587B] bg-clip-text text-transparent">
                From Anyone
              </span>
            </h1>
            
            <p className="text-xl text-[#9FB4C7] mb-10 max-w-2xl mx-auto leading-relaxed">
              The modern peer-to-peer rental marketplace. Borrow what you need, 
              lend what you have, and save money while building community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] hover:from-[#9995c4] hover:to-[#3a6d91] text-white font-semibold rounded-2xl transition shadow-2xl shadow-[#7F7CAF]/20 text-lg"
              >
                Start Renting Today
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 bg-[#163548]/50 hover:bg-[#163548] text-[#EEEEFF] font-semibold rounded-2xl transition border border-[#28587B]/50 text-lg"
              >
                List Your Items
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "5K+", label: "Items Listed" },
              { value: "₹2.5M", label: "Saved by Users" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-[#163548]/30 rounded-2xl border border-[#28587B]/30 backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7F7CAF] to-[#9FB4C7] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-[#9FB4C7]/70 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section id="items" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#7F7CAF] font-semibold text-sm uppercase tracking-wider">Marketplace</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#EEEEFF] mt-3">Available Items</h2>
            <p className="text-[#9FB4C7] mt-4 max-w-xl mx-auto">Browse items available for rent in your community</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#28587B]/30 border-t-[#7F7CAF] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-[#9FB4C7] text-lg">No items available yet. Be the first to list!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => (
                <div
                  key={item.id ?? `item-${index}`}
                  className="group bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-3xl overflow-hidden hover:border-[#7F7CAF]/50 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="h-52 bg-gradient-to-br from-[#28587B]/20 to-[#7F7CAF]/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7F7CAF]/10 to-[#28587B]/10 group-hover:opacity-100 opacity-0 transition" />
                    <span className="text-7xl">📦</span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-[#9FB798]/20 text-[#9FB798] text-xs font-semibold rounded-full">
                        Available
                      </span>
                      <span className="text-[#9FB4C7]/50 text-sm">ID: {item.id}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#EEEEFF] mb-2 group-hover:text-[#9FB4C7] transition">
                      {item.title}
                    </h3>
                    <p className="text-[#9FB4C7]/70 text-sm mb-4 line-clamp-2">{item.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-[#28587B]/30">
                        <span className="text-[#9FB4C7]/70">Daily Rate</span>
                        <span className="text-2xl font-bold text-[#9FB798]">
                          PKR {item.daily_deposit || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#9FB4C7]/70">Security Deposit</span>
                        <span className="text-[#EEEEFF] font-semibold">PKR {item.total_deposit || "0"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!user) {
                          alert("Please login to rent this item!");
                        }
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] hover:from-[#9995c4] hover:to-[#3a6d91] text-white font-semibold rounded-xl transition shadow-lg shadow-[#7F7CAF]/20"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 bg-[#0f2530]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#7F7CAF] font-semibold text-sm uppercase tracking-wider">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#EEEEFF] mt-3">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: "🔍", title: "Browse", desc: "Find items you need from local lenders" },
              { step: "02", icon: "📝", title: "Request", desc: "Send a rental request with your dates" },
              { step: "03", icon: "✅", title: "Confirm", desc: "Pay securely and get approved" },
              { step: "04", icon: "🎉", title: "Enjoy", desc: "Pick up and enjoy your rental" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-center p-8 bg-[#163548]/30 backdrop-blur rounded-3xl border border-[#28587B]/30 hover:border-[#7F7CAF]/50 transition group">
                  <div className="text-[#28587B]/30 text-5xl font-bold absolute top-4 right-6">{item.step}</div>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-[#EEEEFF] mb-2 group-hover:text-[#9FB4C7] transition">{item.title}</h3>
                  <p className="text-[#9FB4C7]/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
            
            <div className="relative text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users saving money by renting instead of buying
              </p>
              <Link
                href="/signup"
                className="inline-flex px-8 py-4 bg-white text-[#28587B] font-bold rounded-2xl hover:bg-[#EEEEFF] transition shadow-2xl text-lg"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#28587B]/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F7CAF] to-[#28587B] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-[#EEEEFF]">ShareIt</span>
            </div>
            
            <p className="text-[#9FB4C7]/50">© 2025 ShareIt. All rights reserved.</p>
            
            <div className="flex gap-6">
              <a href="#" className="text-[#9FB4C7]/50 hover:text-[#EEEEFF] transition">Privacy</a>
              <a href="#" className="text-[#9FB4C7]/50 hover:text-[#EEEEFF] transition">Terms</a>
              <a href="#" className="text-[#9FB4C7]/50 hover:text-[#EEEEFF] transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
