"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";

interface Item {
  item_id: number;
  title: string;
  description?: string;
  images?: string[];
  daily_deposit: number;
  is_active: boolean;
}

interface Booking {
  booking_id: number;
  item_id: number;
  borrower_id: number;
  lender_id: number;
  start_date: string;
  end_date: string;
  total_deposit: number;
  status: string;
  item_title?: string;
  borrower_name?: string;
}

export default function Dashboard() {
  const { user, token, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]); // as lender
  const [myRentals, setMyRentals] = useState<Booking[]>([]); // as borrower (accepted)
  const [myLended, setMyLended] = useState<Booking[]>([]); // as lender (accepted)
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'borrower'|'lender'>('borrower');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const load = async () => {
      if (!token || !user?.id) return;
      try {
        const [itemsRes, pendRes, allBookingsRes, walletRes] = await Promise.all([
          fetch(`http://localhost:8000/items/lender/${user.id}`),
          fetch("http://localhost:8000/bookings/pending", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:8000/bookings", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:8000/wallet/balance", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (itemsRes.ok) setMyItems(await itemsRes.json());
        if (pendRes.ok) setPendingBookings(await pendRes.json());
        if (allBookingsRes.ok) {
          const all = await allBookingsRes.json();
          setMyRentals(all.filter((b: Booking) => b.borrower_id === user.id && b.status === "accepted"));
          setMyLended(all.filter((b: Booking) => b.lender_id === user.id && b.status === "accepted"));
        }
        if (walletRes.ok) {
          const w = await walletRes.json();
          setWalletBalance(Number(w.balance));
        }
      } catch (e) {
        console.error("Error loading dashboard data", e);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [token, user?.id]);

  const daysLeft = (b: Booking) => {
    const end = new Date(b.end_date);
    const today = new Date();
    const ms = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#28587B] to-[#163548] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#28587B]/30 border-t-[#7F7CAF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#28587B] to-[#163548] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#28587B]/30 border-t-[#7F7CAF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#28587B] to-[#163548]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#1a3a4a]/90 border-b border-[#7F7CAF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F7CAF] to-[#28587B] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#9FB4C7] to-[#7F7CAF] bg-clip-text text-transparent">
                ShareIt
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-[#9FB4C7] hover:text-[#EEEEFF] font-medium transition"
              >
                Home
              </Link>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#EEEEFF] mb-2">
              Welcome back, {user?.full_name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-[#9FB4C7] text-lg">Manage your rentals and items from here</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link
              href="/#items"
              className="group p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl hover:border-[#7F7CAF]/50 transition-all"
            >
              <div className="w-12 h-12 bg-[#7F7CAF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEFF] mb-1 group-hover:text-[#9FB4C7] transition-colors">Browse Items</h3>
              <p className="text-[#9FB4C7]/70 text-sm">Find items to rent</p>
            </Link>

            <Link
              href="/dashboard/list-item"
              className="group p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl hover:border-[#28587B] transition-all"
            >
              <div className="w-12 h-12 bg-[#28587B]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEFF] mb-1 group-hover:text-[#9FB4C7] transition-colors">List Item</h3>
              <p className="text-[#9FB4C7]/70 text-sm">Rent out your stuff</p>
            </Link>

            <Link
              href="/dashboard/wallet"
              className="group p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl hover:border-[#9FB798]/50 transition-all"
            >
              <div className="w-12 h-12 bg-[#9FB798]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEFF] mb-1 group-hover:text-[#9FB798] transition-colors">Wallet</h3>
              <p className="text-[#9FB4C7]/70 text-sm">Manage your balance</p>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="group p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl hover:border-[#7F7CAF]/50 transition-all"
            >
              <div className="w-12 h-12 bg-[#7F7CAF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEFF] mb-1 group-hover:text-[#7F7CAF] transition-colors">My Bookings</h3>
              <p className="text-[#9FB4C7]/70 text-sm">View your rentals</p>
            </Link>
          </div>

          {/* Role Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('borrower')}
              className={`px-4 py-2 rounded-xl border ${activeTab==='borrower' ? 'bg-[#28587B] text-white border-[#28587B]' : 'bg-transparent text-[#9FB4C7] border-[#28587B]/40'}`}
            >
              Borrower
            </button>
            <button
              onClick={() => setActiveTab('lender')}
              className={`px-4 py-2 rounded-xl border ${activeTab==='lender' ? 'bg-[#28587B] text-white border-[#28587B]' : 'bg-transparent text-[#9FB4C7] border-[#28587B]/40'}`}
            >
              Lender
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#9FB4C7]">Active Rentals</span>
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-3xl font-bold text-[#EEEEFF]">{loadingData ? "–" : (activeTab==='borrower' ? myRentals.length : myLended.length)}</div>
            </div>

            <div className="p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#9FB4C7]">Items Listed</span>
                <span className="text-2xl">📦</span>
              </div>
              <div className="text-3xl font-bold text-[#EEEEFF]">{loadingData ? "–" : myItems.length}</div>
            </div>

            <div className="p-6 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#9FB4C7]">Wallet Balance</span>
                <span className="text-2xl">💵</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#9FB798] to-[#7F7CAF] bg-clip-text text-transparent">PKR {loadingData ? "–" : walletBalance}</div>
            </div>
          </div>

          {activeTab === 'lender' ? (
            <div className="bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-[#EEEEFF] mb-4">My Listed Items</h2>
              {loadingData ? (
                <div className="text-[#9FB4C7]">Loading…</div>
              ) : myItems.length === 0 ? (
                <div className="text-[#9FB4C7]">You haven’t listed any items yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myItems.map((it) => (
                    <div key={it.item_id} className="border border-[#28587B]/30 rounded-xl overflow-hidden">
                      <div className="h-32 bg-[#28587B]/10 flex items-center justify-center">
                        {it.images && it.images.length ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.images[0]} alt={it.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#EEEEFF] font-semibold">{it.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${it.is_active ? "bg-[#9FB798]/20 text-[#9FB798]" : "bg-red-500/20 text-red-400"}`}>{it.is_active ? "Active" : "Inactive"}</span>
                        </div>
                        <div className="text-sm text-[#9FB4C7]">Daily: PKR {Number(it.daily_deposit)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-[#EEEEFF] mb-4">My Active Rentals</h2>
              {loadingData ? (
                <div className="text-[#9FB4C7]">Loading…</div>
              ) : myRentals.length === 0 ? (
                <div className="text-[#9FB4C7]">You have no active rentals.</div>
              ) : (
                <div className="space-y-3">
                  {myRentals.map((b) => (
                    <div key={b.booking_id} className="border border-[#28587B]/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[#EEEEFF] font-semibold">{b.item_title || b.item_id}</div>
                          <div className="text-[#9FB4C7] text-sm">Days left: {daysLeft(b)}</div>
                          <div className="text-[#9FB4C7] text-sm">Total Deposit: PKR {Number(b.total_deposit)}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-[#7F7CAF]/20 text-[#7F7CAF] whitespace-nowrap">
                          {b.status === "return_pending" ? "Return Pending" : "Active"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {b.status === "accepted" && (
                          <button
                            onClick={async () => {
                              const res = await fetch(`http://localhost:8000/bookings/${b.booking_id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ status: "return_pending" }),
                              });
                              if (res.ok) {
                                alert("Return request sent to lender!");
                                const all = await fetch("http://localhost:8000/bookings", { headers: { Authorization: `Bearer ${token}` } });
                                if (all.ok) {
                                  const data = await all.json();
                                  setMyRentals(data.filter((bb: Booking) => bb.borrower_id === user!.id && (bb.status === "accepted" || bb.status === "return_pending")));
                                }
                              } else {
                                const data = await res.json();
                                alert(`Failed: ${data.detail || "Unknown error"}`);
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-[#9FB798] text-[#0f2530] rounded-lg font-semibold"
                          >
                            Request Return
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const reason = prompt("Describe the dispute:");
                            if (reason) {
                              fetch("http://localhost:8000/disputes/", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ booking_id: b.booking_id, description: reason }),
                              }).then(res => {
                                if (res.ok) {
                                  alert("Dispute raised successfully!");
                                } else {
                                  res.json().then(data => alert(`Failed: ${data.detail}`));
                                }
                              });
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-yellow-500/80 text-white rounded-lg font-semibold"
                        >
                          Raise Dispute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lender' && (
            <div className="bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-[#EEEEFF] mb-4">Pending Booking Requests</h2>
              {loadingData ? (
                <div className="text-[#9FB4C7]">Loading…</div>
              ) : pendingBookings.length === 0 ? (
                <div className="text-[#9FB4C7]">No pending requests.</div>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((b) => (
                    <div key={b.booking_id} className="border border-[#28587B]/30 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-[#EEEEFF] font-semibold">{b.item_title}</div>
                        <div className="text-[#9FB4C7] text-sm">Borrower: {b.borrower_name || b.borrower_id}</div>
                        <div className="text-[#9FB4C7] text-sm">Requested deposit: PKR {Number(b.total_deposit)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const res = await fetch(`http://localhost:8000/bookings/${b.booking_id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: "accepted" }),
                            });
                            if (res.ok) {
                              alert("Booking accepted.");
                              const pend = await fetch("http://localhost:8000/bookings/pending", { headers: { Authorization: `Bearer ${token}` } });
                              if (pend.ok) setPendingBookings(await pend.json());
                              const all = await fetch("http://localhost:8000/bookings", { headers: { Authorization: `Bearer ${token}` } });
                              if (all.ok) {
                                const data = await all.json();
                                setMyLended(data.filter((bb: Booking) => bb.lender_id === user!.id && bb.status === "accepted"));
                              }
                            } else {
                              const txt = await res.text();
                              alert(`Failed to accept: ${txt}`);
                            }
                          }}
                          className="px-4 py-2 bg-[#9FB798] text-[#0f2530] rounded-lg"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            const res = await fetch(`http://localhost:8000/bookings/${b.booking_id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: "rejected" }),
                            });
                            if (res.ok) {
                              alert("Booking rejected.");
                              const pend = await fetch("http://localhost:8000/bookings/pending", { headers: { Authorization: `Bearer ${token}` } });
                              if (pend.ok) setPendingBookings(await pend.json());
                            } else {
                              const txt = await res.text();
                              alert(`Failed to reject: ${txt}`);
                            }
                          }}
                          className="px-4 py-2 bg-red-500/80 text-white rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lender' && (
            <div className="bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-[#EEEEFF] mb-4">Lended Items (Accepted)</h2>
              {loadingData ? (
                <div className="text-[#9FB4C7]">Loading…</div>
              ) : myLended.length === 0 ? (
                <div className="text-[#9FB4C7]">You have no accepted rentals.</div>
              ) : (
                <div className="space-y-3">
                  {myLended.map((b) => (
                    <div key={b.booking_id} className="border border-[#28587B]/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[#EEEEFF] font-semibold">{b.item_title || b.item_id}</div>
                          <div className="text-[#9FB4C7] text-sm">Borrower: {b.borrower_name || b.borrower_id}</div>
                          <div className="text-[#9FB4C7] text-sm">Days left: {daysLeft(b)}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-[#7F7CAF]/20 text-[#7F7CAF] whitespace-nowrap">
                          {b.status === "return_pending" ? "Return Pending" : "Active"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {b.status === "return_pending" && (
                          <button
                            onClick={async () => {
                              const res = await fetch(`http://localhost:8000/bookings/${b.booking_id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ status: "returned" }),
                              });
                              if (res.ok) {
                                alert("Return accepted! Deposit refunded to borrower.");
                                const all = await fetch("http://localhost:8000/bookings", { headers: { Authorization: `Bearer ${token}` } });
                                if (all.ok) {
                                  const data = await all.json();
                                  setMyLended(data.filter((bb: Booking) => bb.lender_id === user!.id && (bb.status === "accepted" || bb.status === "return_pending")));
                                }
                              } else {
                                const data = await res.json();
                                alert(`Failed: ${data.detail || "Unknown error"}`);
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
                          >
                            Accept Return
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const reason = prompt("Describe the dispute:");
                            if (reason) {
                              fetch("http://localhost:8000/disputes/", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ booking_id: b.booking_id, description: reason }),
                              }).then(res => {
                                if (res.ok) {
                                  alert("Dispute raised successfully!");
                                } else {
                                  res.json().then(data => alert(`Failed: ${data.detail}`));
                                }
                              });
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-yellow-500/80 text-white rounded-lg font-semibold"
                        >
                          Raise Dispute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
