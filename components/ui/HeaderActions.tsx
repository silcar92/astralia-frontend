"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BellButton } from "@/components/ui/BellButton";
import { useAuth } from "@/hooks/useAuth";
import * as chatService from "@/services/chatService";

export function HeaderActions() {
  const { status } = useAuth();
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    chatService
      .fetchConversations()
      .then((res) => setUnread(res.results.some((c) => c.unread_count > 0)))
      .catch(() => {});
  }, [status]);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/chats"
        aria-label="Chats"
        className="w-[34px] h-[34px] rounded-full flex items-center justify-center relative"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(232,217,181,0.35)", color: "#E8D9B5" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 5h16v11H8l-4 4V5z" />
        </svg>
        {unread && (
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--astralia-alert)", border: "1.5px solid #221A3B" }}
          />
        )}
      </Link>
      <BellButton />
    </div>
  );
}
