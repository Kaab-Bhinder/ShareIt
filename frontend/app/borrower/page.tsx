"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";
import ProductCard from "../components/ProductCard";

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
      <div className="min-h-screen bg-gradient-to-br from-primary-surface via-primary-surface-light to-primary-surface-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-surface-light/30 border-t-[#4ade80] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-surface via-primary-surface-light to-primary-surface-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-primary-surface/90 border-b border-[#4ade80]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary-400 to-primary-surface-light rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-muted to-primary-400 bg-clip-text text-transparent">
                ShareIt
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary-400/30 text-muted text-sm rounded-full border border-[#4ade80]/50">
                🛒 Borrower Mode
              </span>

              <Link
                href="/lender"
                className="px-5 py-2.5 bg-linear-to-r from-primary-surface-light to-primary-400 hover:from-accent-light hover:to-[#5ce196] text-white font-semibold rounded-xl transition shadow-lg hidden sm:block"
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
            <h1 className="text-3xl font-bold text-white mb-2">Browse Items to Rent</h1>
            <p className="text-muted">Find what you need from local lenders</p>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-surface-light/30 border-t-[#4ade80] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-primary-surface-dark/30 backdrop-blur border border-primary-surface-light/30 rounded-3xl">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-white mb-2">No items available</h3>
              <p className="text-muted">Check back later or become a lender!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const itemId = getItemId(item);
                const itemStatus = item.status ?? (item.is_active ? "available" : "inactive");
                const isRented = activeMap[itemId] > 0;
                const isOwnItem = item.lender_id === user?.id;
                const isDisabled = (itemStatus !== "available") || !item.is_active || isOwnItem || isRented;

                let buttonText = "Rent Now";
                if (itemStatus === "rented" || isRented) buttonText = "Rented";
                else if (itemStatus === "dispute") buttonText = "Under Dispute";
                else if (itemStatus !== "available" || !item.is_active) buttonText = "Not Available";
                else if (isOwnItem) buttonText = "Your Item";

                return (
                  <ProductCard
                    key={itemId}
                    id={itemId}
                    title={item.title}
                    description={item.description}
                    dailyRate={Number(item.daily_deposit)}
                    estimatedPrice={Number(item.estimated_price)}
                    image={item.images?.[0]}
                    status={isRented ? "rented" : itemStatus as any}
                    condition={item.condition}
                    buttonText={buttonText}
                    buttonDisabled={isDisabled}
                    onRentClick={() => setSelectedItem(item)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f2530] border border-primary-surface-light/50 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-2">Rent Item</h2>
            <p className="text-muted mb-6">{selectedItem.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Number of Days</label>
                <input
                  type="number"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              <div className="bg-primary-surface-dark/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Daily Deposit</span>
                  <span className="text-white">PKR {Number(selectedItem.daily_deposit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Days</span>
                  <span className="text-white">× {bookingDays}</span>
                </div>
                <div className="border-t border-primary-surface-light/30 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted">Total</span>
                    <span className="text-[#9FB798]">PKR {Number(selectedItem.daily_deposit) * bookingDays}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-4 py-3 bg-primary-surface-dark/50 text-muted font-medium rounded-xl hover:bg-primary-surface-dark transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRent}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-primary-400 to-primary-surface-light text-white font-semibold rounded-xl transition disabled:opacity-50"
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
