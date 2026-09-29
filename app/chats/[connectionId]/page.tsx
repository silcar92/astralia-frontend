"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as chatService from "@/services/chatService";
import type { ChatMessage, Conversation } from "@/services/chatService";

const POLL_MS = 4000;

function timeLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function ChatConversationPage() {
  const params = useParams<{ connectionId: string }>();
  const connectionId = Number(params.connectionId);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("chat.conversation");
  const errorMessage = useErrorMessage();
  const { status } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    if (!Number.isFinite(connectionId)) return;

    let cancelled = false;

    const load = () => {
      chatService
        .fetchMessages(connectionId)
        .then((res) => {
          if (!cancelled) setMessages(res.results);
        })
        .catch((err) => {
          if (!cancelled) setError(errorMessage(err, "loadFailed"));
        });
    };

    chatService.fetchConversation(connectionId).then((c) => !cancelled && setConversation(c)).catch(() => {});
    load();
    chatService.markAllRead(connectionId).catch(() => {});

    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, connectionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      const sent = await chatService.sendMessage(connectionId, text);
      setMessages((prev) => (prev ? [...prev, sent] : [sent]));
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <main
      className="flex flex-col"
      style={{ height: "100vh", fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}
    >
      <div
        className="flex items-center gap-3 px-[18px] pt-8 pb-4"
        style={{ borderBottom: "1px solid rgba(232,217,181,0.2)" }}
      >
        <Link
          href="/chats"
          aria-label={t("back")}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(232,217,181,0.35)", color: "#E8D9B5" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        {conversation ? (
          <Link
            href={`/people/${conversation.other_user_id}`}
            aria-label={conversation.other_user_name}
            className="text-[18px] font-semibold italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {conversation.other_user_name}
          </Link>
        ) : (
          <span className="text-[18px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
            {t("title")}
          </span>
        )}
      </div>

      <div className="flex-grow overflow-y-auto px-[18px] py-4 flex flex-col gap-2.5">
        {error && (
          <p className="text-center text-sm mt-6" style={{ color: "var(--astralia-lilac)" }}>
            {error}
          </p>
        )}

        {!error && messages === null && (
          <p className="text-center text-sm mt-6" style={{ color: "var(--astralia-lilac)" }}>
            {t("loading")}
          </p>
        )}

        {!error && messages !== null && messages.length === 0 && (
          <p className="text-center text-sm mt-6 px-6" style={{ color: "var(--astralia-lilac)" }}>
            {t("empty")}
          </p>
        )}

        {!error &&
          messages?.map((m) => (
            <div key={m.id} className="flex" style={{ justifyContent: m.is_mine ? "flex-end" : "flex-start" }}>
              <div
                className="max-w-[75%] rounded-2xl px-3.5 py-2.5"
                style={{
                  background: m.is_mine ? "rgba(232,217,181,0.18)" : "rgba(255,255,255,0.07)",
                  border: `1px solid ${m.is_mine ? "rgba(232,217,181,0.4)" : "rgba(255,255,255,0.18)"}`,
                }}
              >
                <p className="text-sm">{m.text}</p>
                <span className="block text-[10px] mt-1 text-right" style={{ color: "var(--astralia-lilac)" }}>
                  {timeLabel(m.sent_at, locale)}
                </span>
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      <div
        className="flex items-center gap-2 px-[18px] py-3"
        style={{ borderTop: "1px solid rgba(232,217,181,0.2)" }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={t("placeholder")}
          className="flex-grow rounded-full px-4 py-2.5 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          aria-label={t("send")}
          className="w-[40px] h-[40px] shrink-0 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{ background: "var(--astralia-gold)", color: "#221A3B" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </main>
  );
}
