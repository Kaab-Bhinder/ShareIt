"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  created_at: string;
}

interface Item {
  item_id: number;
  title: string;
  description?: string;
  condition: string;
  estimated_price: number;
  daily_deposit: number;
  lender_id: number;
  status: string;
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
  lender_name?: string;
}

interface Dispute {
  dispute_id: number;
  booking_id: number;
  raised_by: number;
  description: string;
  estimated_cost?: number;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, token, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'items' | 'bookings' | 'disputes'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingDispute, setEditingDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!token || !user?.id) return;
    loadData();
  }, [token, user?.id, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await fetch("http://localhost:8000/auth/users", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
      } else if (activeTab === 'items') {
        const res = await fetch("http://localhost:8000/items", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setItems(await res.json());
      } else if (activeTab === 'bookings') {
        const res = await fetch("http://localhost:8000/bookings", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setBookings(await res.json());
      } else if (activeTab === 'disputes') {
        const res = await fetch("http://localhost:8000/disputes", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDisputes(await res.json());
      }
    } catch (e) {
      console.error("Error loading data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:8000/auth/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.user_id !== userId));
        alert("User deleted successfully");
      }
    } catch (e) {
      console.error("Error deleting user", e);
      alert("Failed to delete user");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:8000/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(items.filter(i => i.item_id !== itemId));
        alert("Item deleted successfully");
      }
    } catch (e) {
      console.error("Error deleting item", e);
      alert("Failed to delete item");
    }
  };

  const handleUpdateDispute = async (disputeId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8000/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadData();
        alert("Dispute updated successfully");
        setEditingDispute(null);
      }
    } catch (e) {
      console.error("Error updating dispute", e);
      alert("Failed to update dispute");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-900/80 backdrop-blur border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <ProfileDropdown />
        </div>
      </header>

      {/* Tabs */}
      <div className="mt-20 max-w-7xl mx-auto px-4">
        <div className="flex gap-4 mb-8 border-b border-surface-border">
          {(['users', 'items', 'bookings', 'disputes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setEditingUser(null);
                setEditingItem(null);
                setEditingDispute(null);
              }}
              className={`px-4 py-3 font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">All Users ({users.length})</h2>
            {loading ? (
              <div className="text-text-muted">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-text-muted">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left p-3 text-text-primary">ID</th>
                      <th className="text-left p-3 text-text-primary">Name</th>
                      <th className="text-left p-3 text-text-primary">Email</th>
                      <th className="text-left p-3 text-text-primary">Phone</th>
                      <th className="text-left p-3 text-text-primary">Role</th>
                      <th className="text-left p-3 text-text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.user_id} className="border-b border-surface-border hover:bg-surface-800/50">
                        <td className="p-3 text-text-secondary">{u.user_id}</td>
                        <td className="p-3 text-text-secondary">{u.full_name}</td>
                        <td className="p-3 text-text-secondary">{u.email}</td>
                        <td className="p-3 text-text-secondary">{u.phone || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.role === 'ADMIN' ? 'bg-primary-500/30 text-primary-400' :
                            u.role === 'LENDER' ? 'bg-blue-500/30 text-blue-400' :
                            'bg-green-500/30 text-green-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.user_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">All Items ({items.length})</h2>
            {loading ? (
              <div className="text-text-muted">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-text-muted">No items found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left p-3 text-text-primary">ID</th>
                      <th className="text-left p-3 text-text-primary">Title</th>
                      <th className="text-left p-3 text-text-primary">Condition</th>
                      <th className="text-left p-3 text-text-primary">Est. Price</th>
                      <th className="text-left p-3 text-text-primary">Daily Rate</th>
                      <th className="text-left p-3 text-text-primary">Status</th>
                      <th className="text-left p-3 text-text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.item_id} className="border-b border-surface-border hover:bg-surface-800/50">
                        <td className="p-3 text-text-secondary">{item.item_id}</td>
                        <td className="p-3 text-text-secondary">{item.title}</td>
                        <td className="p-3 text-text-secondary">{item.condition}</td>
                        <td className="p-3 text-text-secondary">PKR {Number(item.estimated_price)}</td>
                        <td className="p-3 text-text-secondary">PKR {Number(item.daily_deposit)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === 'AVAILABLE' ? 'bg-green-500/30 text-green-400' :
                            item.status === 'RENTED' ? 'bg-yellow-500/30 text-yellow-400' :
                            'bg-red-500/30 text-red-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.item_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">All Rentals/Bookings ({bookings.length})</h2>
            {loading ? (
              <div className="text-text-muted">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-text-muted">No bookings found</div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.booking_id} className="border border-surface-border rounded-lg p-4 hover:bg-surface-800/50">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-text-muted">Item</div>
                        <div className="text-white font-semibold">{b.item_title || `Item #${b.item_id}`}</div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Booking ID</div>
                        <div className="text-white font-semibold">#{b.booking_id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Borrower</div>
                        <div className="text-white font-semibold">{b.borrower_name || `User #${b.borrower_id}`}</div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Lender</div>
                        <div className="text-white font-semibold">{b.lender_name || `User #${b.lender_id}`}</div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Status</div>
                        <div className={`font-semibold ${
                          b.status?.toUpperCase() === 'ACCEPTED' ? 'text-green-400' :
                          b.status?.toUpperCase() === 'PENDING' ? 'text-yellow-400' :
                          b.status?.toUpperCase() === 'RETURN_PENDING' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {b.status || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Deposit</div>
                        <div className="text-white font-semibold">PKR {Number(b.total_deposit)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted">
                      {b.start_date} to {b.end_date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">All Disputes ({disputes.length})</h2>
            {loading ? (
              <div className="text-text-muted">Loading...</div>
            ) : disputes.length === 0 ? (
              <div className="text-text-muted">No disputes found</div>
            ) : (
              <div className="space-y-3">
                {disputes.map(d => (
                  <div key={d.dispute_id} className="border border-surface-border rounded-lg p-4 hover:bg-surface-800/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm text-text-muted">Dispute #{d.dispute_id} - Booking #{d.booking_id}</div>
                        <div className="text-white font-semibold mt-1">{d.description}</div>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-4 ${
                        d.status?.toUpperCase() === 'OPEN' ? 'bg-red-500/30 text-red-400' :
                        d.status?.toUpperCase() === 'RESOLVED' ? 'bg-green-500/30 text-green-400' :
                        'bg-gray-500/30 text-gray-400'
                      }`}>
                        {d.status || 'OPEN'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <div className="text-text-muted">Raised By</div>
                        <div className="text-white">User #{d.raised_by}</div>
                      </div>
                      <div>
                        <div className="text-text-muted">Est. Cost</div>
                        <div className="text-white">{d.estimated_cost ? `PKR ${d.estimated_cost}` : '-'}</div>
                      </div>
                      <div>
                        <div className="text-text-muted">Date</div>
                        <div className="text-white">{d.created_at.split('T')[0]}</div>
                      </div>
                    </div>
                    {d.status?.toUpperCase() === 'OPEN' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateDispute(d.dispute_id, 'RESOLVED')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Mark as Resolved
                        </button>
                        <button
                          onClick={() => handleUpdateDispute(d.dispute_id, 'REJECTED')}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Mark as Rejected
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer padding */}
      <div className="pb-20"></div>
    </div>
  );
}
