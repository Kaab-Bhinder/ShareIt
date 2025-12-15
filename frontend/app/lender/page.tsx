"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";

interface MyItem {
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
  created_at: string;
}

export default function LenderPage() {
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    condition: "Good",
    estimated_price: "",
    min_days: "1",
    max_days: "7",
    daily_deposit: "",
    location: "",
    imageInputs: [""],
  });
  const [submitting, setSubmitting] = useState(false);
  const { user, token, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (token && user?.id) {
      fetchMyItems();
    }
  }, [token, user?.id]);

  const fetchMyItems = async () => {
    try {
      const response = await fetch(`http://localhost:8000/items/lender/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!token) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch("http://localhost:8000/api/uploads/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      if (!res.ok) {
        console.error("Upload failed", await res.text());
        return;
      }
      const data = await res.json();
      const newUrls: string[] = data.urls || [];
      setNewItem((prev) => ({ ...prev, imageInputs: [...prev.imageInputs, ...newUrls] }));
    } catch (e) {
      console.error("Error uploading images", e);
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Basic client-side validation
      const estimated = parseFloat(newItem.estimated_price);
      const daily = parseFloat(newItem.daily_deposit);
      const minDays = parseInt(newItem.min_days, 10);
      const maxDays = parseInt(newItem.max_days, 10);
      if (Number.isNaN(estimated) || Number.isNaN(daily) || Number.isNaN(minDays) || Number.isNaN(maxDays)) {
        console.error("Add item failed: Invalid numeric fields");
        alert("Please fill numeric fields correctly (PKR amounts and days).");
        return;
      }
      if (minDays > maxDays) {
        console.error("Add item failed: min_days > max_days");
        alert("Minimum days cannot be greater than maximum days.");
        return;
      }
      const response = await fetch("http://localhost:8000/items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newItem.title,
          description: newItem.description || undefined,
          condition: newItem.condition,
          estimated_price: estimated,
          min_days: minDays,
          max_days: maxDays,
          daily_deposit: daily,
          images: newItem.imageInputs
            .map((u) => u.trim())
            .filter((u) => u.length > 0),
          location: newItem.location,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewItem({
          title: "",
          description: "",
          condition: "Good",
          estimated_price: "",
          min_days: "1",
          max_days: "7",
          daily_deposit: "",
          location: "",
          imageInputs: [""],
        });
        fetchMyItems();
      } else {
        const status = response.status;
        const text = await response.text().catch(() => "");
        console.error("Add item failed:", status, text);
        alert(`Add item failed (${status}): ${text || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Network error while adding item.");
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
              <span className="px-3 py-1 bg-[#28587B]/30 text-[#9FB4C7] text-sm rounded-full border border-[#28587B]/50">
                🏷️ Lender Mode
              </span>
              
              <Link
                href="/borrower"
                className="px-5 py-2.5 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] hover:from-[#9995c4] hover:to-[#3a6d91] text-white font-semibold rounded-xl transition shadow-lg hidden sm:block"
              >
                Become Borrower
              </Link>

              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#EEEEFF] mb-2">My Listed Items</h1>
              <p className="text-[#9FB4C7]">Manage the items you're renting out</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#9FB798] to-[#7F7CAF] hover:from-[#b5cca8] hover:to-[#9995c4] text-white font-semibold rounded-xl transition shadow-lg"
            >
              + Add New Item
            </button>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#28587B]/30 border-t-[#7F7CAF] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-3xl">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-[#EEEEFF] mb-2">No items listed yet</h3>
              <p className="text-[#9FB4C7] mb-6">Start earning by listing your first item!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] text-white font-semibold rounded-xl transition"
              >
                List Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.item_id}
                  className="bg-[#163548]/30 backdrop-blur border border-[#28587B]/30 rounded-2xl overflow-hidden"
                >
                  <div className="h-40 bg-gradient-to-br from-[#28587B]/20 to-[#7F7CAF]/10 flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl">📦</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#EEEEFF]">{item.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.is_active ? "bg-[#9FB798]/20 text-[#9FB798]" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-[#9FB4C7]/70 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-[#9FB4C7]">Daily: PKR {Number(item.daily_deposit)}</span>
                      <span className="text-[#9FB4C7]">Est.: PKR {Number(item.estimated_price)}</span>
                      <span className="text-[#9FB4C7]">Days: {item.min_days}-{item.max_days}</span>
                      <span className="text-[#9FB4C7]">{item.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f2530] border border-[#28587B]/50 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#EEEEFF] mb-6">Add New Item</h2>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                  placeholder="e.g., Power Drill"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF] resize-none"
                  placeholder="Describe your item..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Condition</label>
                  <select
                    value={newItem.condition}
                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Min Days</label>
                  <input
                    type="number"
                    min={1}
                    value={newItem.min_days}
                    onChange={(e) => setNewItem({ ...newItem, min_days: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Max Days</label>
                  <input
                    type="number"
                    min={1}
                    value={newItem.max_days}
                    onChange={(e) => setNewItem({ ...newItem, max_days: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Daily Deposit (PKR)</label>
                  <input
                    type="number"
                    value={newItem.daily_deposit}
                    onChange={(e) => setNewItem({ ...newItem, daily_deposit: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Estimated Price (PKR)</label>
                  <input
                    type="number"
                    value={newItem.estimated_price}
                    onChange={(e) => setNewItem({ ...newItem, estimated_price: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9FB4C7] mb-2">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                  placeholder="e.g., DHA, Karachi"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#9FB4C7]">Image URLs (optional)</label>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, imageInputs: [...newItem.imageInputs, ""] })}
                    className="text-[#7F7CAF] hover:text-[#9FB4C7] text-sm"
                  >
                    + Add URL
                  </button>
                </div>
                <div className="space-y-2">
                  {newItem.imageInputs.map((url, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const arr = [...newItem.imageInputs];
                          arr[idx] = e.target.value;
                          setNewItem({ ...newItem, imageInputs: arr });
                        }}
                        className="flex-1 px-4 py-3 bg-[#163548]/50 border border-[#28587B]/50 rounded-xl text-[#EEEEFF] placeholder-[#9FB4C7]/50 focus:outline-none focus:ring-2 focus:ring-[#7F7CAF]"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => setNewItem({ ...newItem, imageInputs: newItem.imageInputs.filter((_, i) => i !== idx) })}
                        className="px-3 py-2 bg-[#163548]/50 text-[#9FB4C7] rounded-lg border border-[#28587B]/50 hover:bg-[#163548]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <label className="text-sm text-[#9FB4C7]">Or upload from device</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFilesSelected(e.target.files)}
                        className="block text-sm text-[#9FB4C7] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#28587B] file:text-white hover:file:bg-[#3a6d91] cursor-pointer"
                      />
                      {uploading && (
                        <span className="text-xs text-[#9FB4C7]">Uploading...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-[#163548]/50 text-[#9FB4C7] font-medium rounded-xl hover:bg-[#163548] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#7F7CAF] to-[#28587B] text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
