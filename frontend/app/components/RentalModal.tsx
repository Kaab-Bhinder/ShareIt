"use client";

import { useState } from "react";

interface Item {
  item_id: number;
  lender_id: number;
  title: string;
  description?: string;
  daily_deposit: number;
  estimated_price: number;
  images?: string[];
  min_days?: number;
  max_days?: number;
}

interface RentalModalProps {
  item: Item | null;
  onClose: () => void;
  token: string | null;
  userId: number | null;
  walletBalance: number | null;
  onBookingSuccess: () => void;
}

export default function RentalModal({ item, onClose, token, userId, walletBalance, onBookingSuccess }: RentalModalProps) {
  const [bookingDays, setBookingDays] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const totalDeposit = Number(item.daily_deposit) * bookingDays;

  const handleRent = async () => {
    if (!token || !userId) return;

    // Prevent booking own item
    if (item.lender_id === userId) {
      alert("You cannot book your own item.");
      return;
    }

    // Check wallet sufficiency
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
          item_id: item.item_id,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        alert("Booking request sent successfully!");
        onClose();
        onBookingSuccess();
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f2530] border border-primary-surface-light/50 rounded-3xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Rent Item</h2>
        <p className="text-muted mb-6">{item.title}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Number of Days</label>
            <input
              type="number"
              value={bookingDays}
              onChange={(e) => setBookingDays(Math.max(1, parseInt(e.target.value) || 1))}
              min={item.min_days || 1}
              max={item.max_days || 365}
              className="w-full px-4 py-3 bg-primary-surface-dark/50 border border-primary-surface-light/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="bg-primary-surface-dark/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Daily Deposit</span>
              <span className="text-white">PKR {Number(item.daily_deposit).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Days</span>
              <span className="text-white">× {bookingDays}</span>
            </div>
            <div className="border-t border-primary-surface-light/30 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-muted">Total Deposit</span>
                <span className="text-[#9FB798]">PKR {totalDeposit.toFixed(0)}</span>
              </div>
            </div>
            {walletBalance !== null && (
              <div className="flex justify-between text-sm pt-2 border-t border-primary-surface-light/30">
                <span className="text-muted">Your Balance</span>
                <span className={walletBalance >= totalDeposit ? "text-[#9FB798]" : "text-red-400"}>
                  PKR {walletBalance.toFixed(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-primary-surface-dark/50 text-muted font-medium rounded-xl hover:bg-primary-surface-dark transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRent}
              disabled={submitting || (walletBalance !== null && walletBalance < totalDeposit)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-400 to-primary-surface-light hover:from-primary-500 hover:to-primary-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
