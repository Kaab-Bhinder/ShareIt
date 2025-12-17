"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import ProfileDropdown from "./components/ProfileDropdown";
import RentalModal from "./components/RentalModal";
import ProductCard from "./components/ProductCard";

interface Item {
  item_id: number;
  title: string;
  description: string;
  daily_deposit: number;
  estimated_price: number;
  images?: string[];
  status?: string;
  lender_id: number;
  user_id?: number;
  is_active?: boolean;
  min_days?: number;
  max_days?: number;
  condition?: string;
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<"borrower" | "lender">("borrower");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activeMap, setActiveMap] = useState<Record<number, number>>({});
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (token) fetchWalletBalance();
  }, [token]);

  useEffect(() => {
    // Fetch active rented items map (item_id -> days_left)
    const fetchActiveItems = async () => {
      try {
        const res = await fetch("http://localhost:8000/bookings/active-items");
        if (res.ok) {
          const data = await res.json();
          const map = data.active ?? data;
          setActiveMap(map || {});
        }
      } catch (e) {
        console.error("Error fetching active items map", e);
      }
    };
    fetchActiveItems();
  }, []);

  // Poll active items every 10s
  useEffect(() => {
    const fetchActiveMap = async () => {
      try {
        const res = await fetch("http://localhost:8000/bookings/active-items");
        if (res.ok) {
          const data = await res.json();
          const rawMap = data.active ?? data;
          const normalized: Record<number, number> = {};
          if (rawMap && typeof rawMap === "object") {
            Object.entries(rawMap).forEach(([k, v]) => {
              const id = typeof k === "string" ? parseInt(k, 10) : (k as unknown as number);
              const days = typeof v === "string" ? parseInt(v as unknown as string, 10) : (v as number);
              if (!Number.isNaN(id) && Number.isFinite(days)) {
                normalized[id] = Math.max(0, days);
              }
            });
          }
          setActiveMap(normalized);
        }
      } catch (e) {
        console.error("Error fetching active items map", e);
      }
    };
    fetchActiveMap();
    const interval = setInterval(fetchActiveMap, 10000);
    return () => clearInterval(interval);
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

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch("http://localhost:8000/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(Number(data.balance));
      }
    } catch (e) {
      console.error("Error fetching wallet balance", e);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary-400 to-[#15803d] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-muted to-primary-400 bg-clip-text text-transparent">
                ShareIt
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#items" className="text-muted hover:text-white transition font-medium">Browse</a>
              <a href="#how" className="text-muted hover:text-white transition font-medium">How it Works</a>
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
                      className="btn-primary hidden sm:block"
                    >
                      Become Lender
                    </Link>
                  ) : (
                    <Link
                      href="/borrower"
                      onClick={() => setCurrentRole("borrower")}
                      className="btn-primary hidden sm:block"
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
                    className="btn-ghost"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary"
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
      <section 
        className="pt-32 pb-20 px-6 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/main_hero.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-surface-dark/50 rounded-full border border-primary-surface-light/50 mb-8">
              <span className="w-2 h-2 bg-[#9FB798] rounded-full animate-pulse" />
              <span className="text-muted text-sm">Trusted by 10,000+ users</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Rent Anything<br/>
              <span className="bg-linear-to-r from-primary-400 via-[#a8d5ba] to-primary-surface-light bg-clip-text text-transparent">
                From Anyone
              </span>
            </h1>
            
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              The modern peer-to-peer rental marketplace. Borrow what you need, 
              lend what you have, and save money while building community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-primary inline-block px-8 py-4 text-lg"
              >
                Start Renting Today
              </Link>
              <Link
                href="/signup"
                className="btn-secondary inline-block px-8 py-4 text-lg"
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
              <div key={stat.label} className="stat-box">
                <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary-400 to-muted bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted/70 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section id="items" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Marketplace</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">Available Items</h2>
            <p className="text-muted mt-4 max-w-xl mx-auto">Browse items available for rent in your community</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-surface-light/30 border-t-[#4ade80] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-muted text-lg">No items available yet. Be the first to list!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => {
                const itemStatus = item.status === "available" ? "available" : item.status === "dispute" ? "dispute" : "inactive";
                const isRented = activeMap[item.item_id] > 0;
                const isOwnItem = user && user.id === item.user_id;

                let buttonText = "Rent Now";
                let isDisabled = false;

                if (isOwnItem) {
                  buttonText = "Your Item";
                  isDisabled = true;
                } else if (item.status === "dispute") {
                  buttonText = "Under Dispute";
                  isDisabled = true;
                } else if (isRented || item.status === "rented" || !item.status || item.status === "inactive") {
                  buttonText = isRented ? "Rented" : "Not Available";
                  isDisabled = true;
                }

                return (
                  <ProductCard
                    key={item.item_id}
                    id={item.item_id}
                    title={item.title}
                    description={item.description}
                    dailyRate={Number(item.daily_deposit)}
                    estimatedPrice={Number(item.estimated_price)}
                    image={item.images?.[0]}
                    status={itemStatus as any}
                    condition={item.condition || "Unknown"}
                    buttonText={buttonText}
                    buttonDisabled={isDisabled}
                    onRentClick={() => {
                      if (!user) {
                        alert("Please login to rent this item!");
                      } else {
                        setSelectedItem(item);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 bg-[#0f2530]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: "🔍", title: "Browse", desc: "Find items you need from local lenders" },
              { step: "02", icon: "📝", title: "Request", desc: "Send a rental request with your dates" },
              { step: "03", icon: "✅", title: "Confirm", desc: "Pay securely and get approved" },
              { step: "04", icon: "🎉", title: "Enjoy", desc: "Pick up and enjoy your rental" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-center p-8 bg-primary-surface-dark/30 backdrop-blur rounded-3xl border border-primary-surface-light/30 hover:border-[#4ade80]/50 transition group">
                  <div className="text-[#1d6b47]/30 text-5xl font-bold absolute top-4 right-6">{item.step}</div>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-muted transition">{item.title}</h3>
                  <p className="text-muted/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 bg-linear-to-r from-primary-400 to-[#15803d] rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
            
            <div className="relative text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users saving money by renting instead of buying
              </p>
              <Link
                href="/signup"
                className="inline-flex px-8 py-4 bg-white text-[#1d6b47] font-bold rounded-2xl hover:bg-[#EEEEFF] transition shadow-2xl text-lg"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-primary-surface-light/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary-400 to-[#15803d] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShareIt</span>
            </div>
            
            <p className="text-muted/50">© 2025 ShareIt. All rights reserved.</p>
            
            <div className="flex gap-6">
              <a href="#" className="text-muted/50 hover:text-white transition">Privacy</a>
              <a href="#" className="text-muted/50 hover:text-white transition">Terms</a>
              <a href="#" className="text-muted/50 hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Rental Modal */}
      <RentalModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        token={token || null}
        userId={user?.id || null}
        walletBalance={walletBalance}
        onBookingSuccess={() => {
          fetchItems();
          fetchWalletBalance();
        }}
      />
    </div>
  );
}
