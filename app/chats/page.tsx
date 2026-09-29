"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";
import { BellButton } from "@/components/ui/BellButton";
import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as chatService from "@/services/chatService";
import type { Conversation } from "@/services/chatService";

function timeLabel(iso: string, locale: string): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(locale, sameDay ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" }).format(date);
}

export default function ChatsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("chat");
  const tc = useTranslations("common");
  const errorMessage = useErrorMessage();
  const { status } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") {
      router.replace("/login");
      return;
    }
    if (status === "needs_onboarding") {
      router.replace("/onboarding");
      return;
    }

    chatService
      .fetchConversations()
      .then((res) => setConversations(res.results))
      .catch((err) => setError(errorMessage(err, "loadFailed")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <div
          className="text-[26px] font-semibold italic"
          style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
        >
          {t("title")}
        </div>
        <BellButton />
      </div>

      {error && (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs rounded-full px-4 py-2"
            style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
          >
            {tc("retry")}
          </button>
        </div>
      )}

      {!error && conversations === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          {t("loading")}
        </p>
      )}

      {!error && conversations !== null && conversations.length === 0 && (
        <div className="flex-grow flex items-center justify-center text-center px-6">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            {t("locked")}
          </p>
        </div>
      )}

      {!error && conversations !== null && conversations.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-6">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chats/${c.id}`}
              className="flex items-center gap-3 rounded-2xl p-3.5 backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.25)" }}
            >
              <div
                className="w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center"
                style={{ background: "#2C2249", border: "1.5px solid #E8D9B5", color: "#E8D9B5" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[15px] font-semibold italic truncate"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
                  >
                    {c.other_user_name}
                  </span>
                  {c.last_message && (
                    <span className="text-[10px] shrink-0" style={{ color: "var(--astralia-lilac)" }}>
                      {timeLabel(c.last_message.sent_at, locale)}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: c.unread_count > 0 ? "#F3E9C8" : "var(--astralia-lilac)" }}>
                  {c.last_message ? c.last_message.text : t("noMessages")}
                </p>
              </div>

              {c.unread_count > 0 && (
                <span
                  className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center"
                  style={{ background: "var(--astralia-gold)", color: "#221A3B" }}
                >
                  {c.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <BottomNav active="/chats" />
    </main>
  );
}
