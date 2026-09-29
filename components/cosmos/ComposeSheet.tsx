"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const MAX_LENGTH = 500;

export function ComposeSheet({
  title,
  placeholder,
  onClose,
  onSubmit,
}: {
  title: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const t = useTranslations("cosmos");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch {
      setError(t("publishFailed"));
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(10,8,24,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-5 flex flex-col gap-3"
        style={{ background: "#221A3B", border: "1px solid rgba(232,217,181,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[18px] font-semibold italic" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
          {title}
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={4}
          placeholder={placeholder}
          className="rounded-2xl px-4 py-3 text-sm outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
        />
        <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--astralia-lilac)" }}>
          <span>{error ?? ""}</span>
          <span>
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "var(--astralia-text)" }}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={sending || !text.trim()}
            className="flex-1 py-3 rounded-full text-[13px] font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
          >
            {sending ? t("publishing") : t("publish")}
          </button>
        </div>
      </div>
    </div>
  );
}
