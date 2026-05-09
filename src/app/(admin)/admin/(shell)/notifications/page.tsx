"use client";

import { useState } from "react";
import { Bell, Send, Loader2, CheckCircle, Megaphone } from "lucide-react";

const TEMPLATE_NOTIFICATIONS = [
  { title: "🔥 Flash Sale!", body: "Huge discounts on selected items – today only! Don't miss out.", icon: "🔥" },
  { title: "📦 New Arrivals!", body: "Fresh products just landed in the store. Check them out now!", icon: "📦" },
  { title: "⚡ Deal of the Day", body: "Today's exclusive deal is live. Limited stock available!", icon: "⚡" },
  { title: "🎁 Special Offer", body: "We have a special offer just for you. Visit the shop now!", icon: "🎁" },
];

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/shop");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const applyTemplate = (t: typeof TEMPLATE_NOTIFICATIONS[0]) => {
    setTitle(t.title);
    setBody(t.body);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSent(false);

    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to send notification";
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      setSent(true);
      setTitle("");
      setBody("");
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Bell className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Broadcast Notification</h1>
          <p className="text-sm text-zinc-500">Send push notifications to all subscribed users</p>
        </div>
      </div>

      {/* Quick templates */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Templates</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_NOTIFICATIONS.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => applyTemplate(t)}
              className="text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all group"
            >
              <div className="text-base mb-1">{t.icon}</div>
              <p className="font-ui text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 transition-colors">{t.title}</p>
              <p className="font-ui text-[11px] text-zinc-400 line-clamp-1">{t.body}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Notification Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flash Sale Live Now!"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Message Body *
          </label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter your notification message here..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Link URL (optional)
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/shop"
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {sent && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            Notification broadcast successfully!
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-400 flex items-center gap-1">
            <Megaphone className="h-3.5 w-3.5" />
            Sends to all subscribed users
          </p>
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-900 font-ui font-bold text-sm transition-colors disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </div>
  );
}
