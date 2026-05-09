"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }
      toast.success("User created successfully!");
      setModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${uid}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      toast.success("User deleted");
      setUsers(users.filter((u) => u.uid !== uid));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Customers</h1>
            <p className="text-sm text-zinc-500">Manage registered users</p>
          </div>
        </div>

        <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-900 dark:bg-white text-white dark:text-brand-900 font-ui font-semibold text-sm hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 focus:outline-none">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-lg font-bold">Register New Customer</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-brand-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-brand-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-brand-900 dark:focus:border-white transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-10 rounded-xl bg-brand-900 dark:bg-white text-white dark:text-brand-900 font-ui font-bold text-sm disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400">Name</th>
                <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400">Email</th>
                <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400">Registered</th>
                <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{u.displayName || "—"}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{u.email}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(u.creationTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.uid)}
                      className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
