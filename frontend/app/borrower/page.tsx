"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";

interface Item {
  item_id: number;
  lender_id: number;
  title: string;
  description?: string;
  condition: string;
  estimated_price: number;
  min_days: number;
  max_days: number;
  daily_deposit: number;
  images?: string[];
  location: string;
  is_active: boolean;
  status?: "available" | "rented" | "dispute" | "inactive";
}

export default function BorrowerPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [bookingDays, setBookingDays] = useState(1);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeMap, setActiveMap] = useState<Record<number, number>>({});
  const { user, token, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const getItemId = (item: Item) => {
    const anyItem = item as unknown as Record<string, any>;
    return (anyItem.item_id ?? anyItem.id) as number;
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

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
          // Support either { active: { [id]: days_left } } or raw map
          const map = data.active ?? data;
          setActiveMap(map || {});
        }
      } catch (e) {
        console.error("Error fetching active items map", e);
      }
    };
    fetchActiveItems();
  }, []);

  // Poll active items every 30s
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

  const handleRent = async () => {
    if (!selectedItem || !token) return;

    // Prevent booking own item
    if (selectedItem.lender_id === user?.id) {
      alert("You cannot book your own item.");
      return;
    }

    // Calculate total deposit (daily * days)
    const totalDeposit = Number(selectedItem.daily_deposit) * bookingDays;

    // Check wallet sufficiency before sending request
    if (walletBalance !== null && walletBalance < totalDeposit) {
      alert(`Not enough money. Required: PKR ${totalDeposit}, Available: PKR ${walletBalance}`);
      return;
    }
    setSubmitting(true);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + bookingDays);

      const response = await fetch("http://localhost:8000/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: selectedItem.item_id,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        alert("Booking request sent successfully!");
        setSelectedItem(null);
        // Refresh items and active map immediately
        fetchItems();
        // Fire-and-forget update of activeMap
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
          console.error("Error refreshing active items map", e);
        }
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to book item");
      }
    } catch (err) {
      console.error("Error booking item:", err);
      alert("Failed to book item");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#28587B] to-[#163548] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#28587B]/30 border-t-[#7F7CAF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a3a4a] via-[#28587B] to-[#163548]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#1a3a4a]/90 border-b border-[#7F7CAF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#7F7CAF] to-[#28587B] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-[#9FB4C7] to-[#7F7CAF] bg-clip-text text-transparent">
                ShareIt
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-[#7F7CAF]/30 text-[#9FB4C7] text-sm rounded-full border border-[#7F7CAF]/50">
                🛒 Borrower Mode
              </span>

              <Link
                href="/lender"
                className="px-5 py-2.5 bg-linear-to-r from-[#28587B] to-[#7F7CAF] hover:from-accent-light hover:to-[#9995c4] text-white font-semibold rounded-xl transition shadow-lg hidden sm:block"
              >
                Become Lender
              </Link>

              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#EEEEFF] mb-2">Browse Items to Rent</h1>
            <p className="text-[#9FB4C7]">Find what you need from local lenders</p>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#28587B]/30 border-t-[#7F7CAF] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-3xl">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-[#EEEEFF] mb-2">No items available</h3>
              <p className="text-[#9FB4C7]">Check back later or become a lender!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={getItemId(item)}
                  className="group bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl overflow-hidden hover:border-[#7F7CAF]/50 transition-all"
                >
                  <div className="h-44 bg-linear-to-br from-[#28587B]/20 to-[#7F7CAF]/10 flex items-center justify-center">
                    {item.images && item.images.length ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                    {activeMap[getItemId(item)] > 0 && (
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs rounded-full bg-[#9FB798]/20 text-[#9FB798] border border-[#9FB798]/30">
                        Rented
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#EEEEFF] group-hover:text-[#9FB4C7] transition">{item.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (item.status ?? (item.is_active ? "available" : "inactive")) === "available"
                          ? "bg-[#9FB798]/20 text-[#9FB798]"
                          : (item.status === "rented"
                              ? "bg-[#7F7CAF]/20 text-[#7F7CAF]"
                              : item.status === "dispute"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-400")
                      }`}>
                        {(item.status ?? (item.is_active ? "available" : "inactive"))
                          .toString()
                          .replace(/^./, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-[#9FB4C7]/70 text-sm mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-[#9FB4C7]/70 text-sm">Daily Rate</span>
                        <span className="text-[#9FB798] font-semibold">PKR {Number(item.daily_deposit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9FB4C7]/70 text-sm">Estimated Price</span>
                        <span className="text-[#EEEEFF]">PKR {Number(item.estimated_price)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedItem(item)}
                      disabled={
                        (item.status && item.status !== "available") ||
                        item.is_active === false ||
                        item.lender_id === user?.id ||
                        activeMap[getItemId(item)] > 0
                      }
                      className="w-full py-3 bg-linear-to-r from-[#7F7CAF] to-[#28587B] hover:from-accent-light hover:to-[#3a6d91] text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(item.status ?? (item.is_active ? "available" : "inactive")) !== "available"
                        ? (item.status === "rented"
                            ? "Rented"
                            : item.status === "dispute"
                                ? "Under Dispute"
                                : "Not Available")
                        : item.lender_id === user?.id
                            ? "Your Item"
                            : activeMap[getItemId(item)] > 0
                                ? "Rented"
                                : "Rent Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f2530] border border-[#28587B]/50 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#EEEEFF] mb-2">Rent Item</h2>
            <p className="text-[#9FB4C7] mb-6">{selectedItem.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Number of Days</label>
                <input
                  type="number"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                />
              </div>

              <div className="bg-[#163548]/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9FB4C7]">Daily Deposit</span>
                  <span className="text-[#EEEEFF]">PKR {Number(selectedItem.daily_deposit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9FB4C7]">Days</span>
                  <span className="text-[#EEEEFF]">× {bookingDays}</span>
                </div>
                <div className="border-t border-[#28587B]/30 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#9FB4C7]">Total</span>
                    <span className="text-[#9FB798]">PKR {Number(selectedItem.daily_deposit) * bookingDays}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-4 py-3 bg-[#163548]/50 text-[#9FB4C7] font-medium rounded-xl hover:bg-[#163548] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRent}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-[#7F7CAF] to-[#28587B] text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
