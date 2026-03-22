"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2, MessageSquare, MessageSquareDiff, Mail, Eye } from "lucide-react";
import { formatDistanceToNow } from "@/lib/time";

type NotificationData = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; image: string | null } | null;
};

const ICON_MAP: Record<string, typeof Bell> = {
  NEW_MESSAGE: Mail,
  NEW_COMMENT: MessageSquare,
  COMMENT_ACCEPTED: Check,
  COMMENT_DECLINED: Check,
  COMMENT_REPLY: MessageSquare,
  NEW_SUGGESTION: MessageSquareDiff,
  SUGGESTION_ACCEPTED: Check,
  SUGGESTION_DECLINED: Check,
  PROFILE_VIEW: Eye,
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
  }, []);

  // Poll every 30s for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleMarkAllRead() {
    setLoading(true);
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    setLoading(false);
  }

  async function handleClick(n: NotificationData) {
    // Mark as read
    if (!n.readAt) {
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.linkUrl) router.push(n.linkUrl);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors w-full"
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Notifications</span>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 max-h-[420px] overflow-hidden rounded-lg border border-border bg-card shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Bell className="h-5 w-5 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = ICON_MAP[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${
                      !n.readAt ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      !n.readAt ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${!n.readAt ? "font-medium" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {formatDistanceToNow(n.createdAt)}
                      </p>
                    </div>
                    {!n.readAt && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-3 py-2">
              <button
                onClick={() => { setOpen(false); router.push("/notifications"); }}
                className="text-xs text-primary hover:underline w-full text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
