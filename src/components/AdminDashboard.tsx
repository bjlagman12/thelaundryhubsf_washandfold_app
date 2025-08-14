import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import LH from "../../public/LH.svg";

import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "received", label: "Received" },
  { value: "dropped_off", label: "Dropped Off" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

interface Order {
  id: string;
  orderId: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt?: { seconds: number; nanoseconds: number };
  dropOffDate?: string;
  laundryType: string;
  specialRequests?: string;
  status: string;
  notes?: string;
}

function formatDate(ts?: { seconds: number; nanoseconds: number } | string) {
  if (!ts) return "";
  if (typeof ts === "string") {
    const d = new Date(ts);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
  const d = new Date(ts.seconds * 1000);
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "orders"));
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Order[];
    setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { status });
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (error) {
      alert("Failed to update status: " + (error as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    setUpdatingId(id);
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { notes });
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, notes } : order))
      );
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (error) {
      alert("Failed to update notes: " + (error as Error).message);
    } finally {
      setUpdatingId(null);
      setEditingNoteId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut(getAuth(app));
    window.location.href = "/admin";
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Logo and Title */}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img src={LH} alt="The Laundry Hub SF" className="w-12 h-12 mr-3" />
            <h1 className="text-2xl font-bold text-blue-700">
              The Laundry Hub SF Admin
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-6 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-700 hover:text-white transition"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-4 mb-4 border-b">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`pb-2 px-2 border-b-2 text-sm font-medium transition ${
                filter === opt.value
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></span>
            <span className="text-blue-600 font-medium">Loading orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 text-left">Order #</th>
                  <th className="py-2 px-3 text-left">Customer</th>
                  <th className="py-2 px-3 text-left">Phone</th>
                  <th className="py-2 px-3 text-left">Created</th>
                  <th className="py-2 px-3 text-left">Drop Off Day</th>
                  <th className="py-2 px-3 text-left">Service</th>
                  <th className="py-2 px-3 text-left">Order Info</th>
                  <th className="py-2 px-3 text-left">Additional Notes</th>
                  <th className="py-2 px-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-b-0">
                      <td className="py-2 px-3 font-mono">
                        {order.orderId || order.id}
                      </td>
                      <td className="py-2 px-3">
                        {order.firstName} {order.lastName}
                      </td>
                      <td className="py-2 px-3">{order.phone}</td>
                      <td className="py-2 px-3">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-2 px-3">
                        {formatDate(order.dropOffDate)}
                      </td>
                      <td className="py-2 px-3 capitalize">
                        {order.laundryType}
                      </td>
                      <td className="py-2 px-3">
                        {order.specialRequests || "-"}
                      </td>
                      <td className="py-2 px-3">
                        {editingNoteId === order.id ? (
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-32"
                            value={noteDraft}
                            autoFocus
                            disabled={updatingId === order.id}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onBlur={() => {
                              if (noteDraft !== order.notes) {
                                updateNotes(order.id, noteDraft);
                              } else {
                                setEditingNoteId(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (noteDraft !== order.notes) {
                                  updateNotes(order.id, noteDraft);
                                } else {
                                  setEditingNoteId(null);
                                }
                              }
                              if (e.key === "Escape") {
                                setEditingNoteId(null);
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="block cursor-pointer min-h-[1.5rem] hover:underline transition"
                            onClick={() => {
                              setEditingNoteId(order.id);
                              setNoteDraft(order.notes || "");
                            }}
                            title="Click to edit notes"
                          >
                            {order.notes && order.notes.trim() !== ""
                              ? order.notes
                              : "Add notes"}
                            {successId === order.id && (
                              <span className="ml-2 text-green-600 font-bold">
                                ✓
                              </span>
                            )}
                            {updatingId === order.id && (
                              <span className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className="border rounded px-2 py-1 bg-white"
                            disabled={!!updatingId}
                          >
                            <option value="received">Received</option>
                            <option value="dropped_off">Dropped Off</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          {updatingId === order.id && (
                            <span className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                          )}
                          {successId === order.id && (
                            <span className="ml-2 text-green-600 font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Spinner CSS */}
        <style>{`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDashboard;
