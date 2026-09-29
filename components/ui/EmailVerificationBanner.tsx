"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as authService from "@/services/authService";

export function EmailVerificationBanner() {
  const t = useTranslations("auth.banner");
  const { status, profile } = useAuth();
  const errorMessage = useErrorMessage();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "hidden">("idle");
  const [error, setError] = useState<string | null>(null);

  if (status !== "authenticated" || !profile || profile.email_verified || state === "hidden") return null;

  const resend = async () => {
    setState("sending");
    setError(null);
    try {
      await authService.resendVerification();
      setState("sent");
    } catch (err) {
      setError(errorMessage(err));
      setState("error");
    }
  };

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-[12px] text-center"
      style={{ background: "rgba(232,217,181,0.14)", borderBottom: "1px solid rgba(232,217,181,0.35)", color: "#F3E9C8" }}
    >
      <span>{state === "sent" ? t("sent") : error ?? t("text")}</span>
      {state !== "sent" && (
        <button type="button" onClick={resend} disabled={state === "sending"} className="underline underline-offset-2 disabled:opacity-60">
          {state === "sending" ? t("sending") : t("resend")}
        </button>
      )}
      <button type="button" onClick={() => setState("hidden")} aria-label={t("dismiss")} className="px-1 opacity-70">
        ×
      </button>
    </div>
  );
}
