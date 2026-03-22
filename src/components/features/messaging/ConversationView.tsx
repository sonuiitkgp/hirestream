"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Sender = { id: string; name: string | null; email: string; image: string | null };
type Message = { id: string; content: string; senderId: string; createdAt: Date | string; sender: Sender };

export function ConversationView({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: input.trim() }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    } else {
      toast.error("Failed to send message.");
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && (
                <span className="text-xs text-muted-foreground mb-1 ml-1">
                  {msg.sender.name ?? msg.sender.email}
                </span>
              )}
              <div
                className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                    : "bg-card border border-border rounded-2xl rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground mt-1 mx-1 opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      <div className="shrink-0 border-t border-border bg-card p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !input.trim()}
            className="rounded-xl h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
