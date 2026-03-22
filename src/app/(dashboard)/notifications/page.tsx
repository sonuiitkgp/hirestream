"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2, MessageSquare, MessageSquareDiff, Mail, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const TYPE_LABELS: Record<string, string> = {
  NEW_MESSAGE: "Message",
  NEW_COMMENT: "Comment",
  COMMENT_ACCEPTED: "Accepted",
  COMMENT_DECLINED: "Declined",
  COMMENT_REPLY: "Reply",
  NEW_SUGGESTION: "Suggestion",
  SUGGESTION_ACCEPTED: "Accepted",
  SUGGESTION_DECLINED: "Declined",
  PROFILE_VIEW: "View",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ limit: "30" });
    if (tab === "unread") params.set("unread", "true");
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/notifications?${params}`);
    if (!res.ok) return;
    const data = await res.json();

    if (cursor) {
      setNotifications((prev) => [...prev, ...data.notifications]);
    } else {
      setNotifications(data.notifications);
    }
    setNextCursor(data.nextCursor);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  async function handleMarkAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }

  async function handleClick(n: NotificationData) {
    if (!n.readAt) {
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    }
    if (n.linkUrl) router.push(n.linkUrl);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    await fetchNotifications(nextCursor);
    setLoadingMore(false);
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Bell className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            {tab === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICON_MAP[n.type] ?? Bell;
            return (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors hover:bg-muted/30 ${!n.readAt ? "border-primary/20 bg-primary/[0.02]" : ""}`}
                onClick={() => handleClick(n)}
              >
                <CardContent className="flex items-start gap-3 py-3 pt-3">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    !n.readAt ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.readAt ? "font-medium" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {TYPE_LABELS[n.type] ?? n.type}
                      </span>
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(n.createdAt)}
                      {n.actor?.name && ` · ${n.actor.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.readAt && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {nextCursor && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
