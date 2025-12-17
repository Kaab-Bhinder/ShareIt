"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "../../components/ProfileDropdown";

interface Transaction {
  transaction_id: number;
  type: string; // topup | deposit | refund | penalty
  amount: number;
  description?: string;
  created_at: string;
}

interface WalletBalance {
  balance: number;
  currency: string;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { token, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Topup state
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("easypaisa");
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (token) {
      fetchBalance();
    }
  }, [token]);

  const fetchBalance = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "Failed to load wallet");
      }
      const data: WalletBalance = await res.json();
      setWallet(data);
    } catch (e: any) {
      setError(e.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const submitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupLoading(true);
    setError("");
    try {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) {
        throw new Error("Enter a valid amount greater than 0");
      }
      const res = await fetch("http://localhost:8000/wallet/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amt, payment_method: method }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "Topup failed");
      }
      const data: WalletBalance = await res.json();
      setWallet(data);
      setAmount("");
    } catch (e: any) {
      setError(e.message || "Topup failed");
    } finally {
      setTopupLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-surface via-primary-surface-light to-primary-surface-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-primary-surface/90 border-b border-[#4ade80]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-surface-light rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-muted to-primary-400 bg-clip-text text-transparent">
                ShareIt
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/" className="px-4 py-2 text-muted hover:text-white font-medium transition">Home</Link>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Wallet</h1>
            <p className="text-muted">View balance, recent transactions, and top up</p>
          </div>

          {/* Balance + Topup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-2 p-6 bg-primary-surface-dark/30 backdrop-blur border border-primary-surface-light/30 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted">Current Balance</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#9FB798] to-primary-400 bg-clip-text text-transparent">
                    {wallet ? `PKR ${wallet.balance.toFixed(2)}` : "PKR 0.00"}
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary-surface-light/30 text-muted text-sm rounded-full border border-primary-surface-light/50">{wallet?.currency || "INR"}</div>
              </div>
            </div>

            <div className="p-6 bg-primary-surface-dark/30 backdrop-blur border border-primary-surface-light/30 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Top up Wallet</h3>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
              )}
              <form onSubmit={submitTopup} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Amount (PKR)</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white focus:outline-none"
                  >
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={topupLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-surface-light text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {topupLoading ? "Processing..." : "Add Money"}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="p-6 bg-primary-surface-dark/30 backdrop-blur border border-primary-surface-light/30 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-primary-surface-light/30 border-t-[#4ade80] rounded-full animate-spin" />
              </div>
            ) : wallet && wallet.transactions.length > 0 ? (
              <div className="space-y-3">
                {wallet.transactions.map((tx) => (
                  <div key={tx.transaction_id} className="flex items-center justify-between p-4 bg-[#0f2530] rounded-xl border border-primary-surface-light/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {tx.type === "topup" ? "💰" : tx.type === "deposit" ? "📥" : tx.type === "refund" ? "🔁" : "⚠️"}
                      </span>
                      <div>
                        <p className="text-white font-medium capitalize">{tx.type}</p>
                        <p className="text-muted text-sm">{tx.description || "—"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#9FB798] font-semibold">PKR {tx.amount.toFixed(2)}</p>
                      <p className="text-muted/70 text-xs">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-5xl mb-2">📭</div>
                <p className="text-muted">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
