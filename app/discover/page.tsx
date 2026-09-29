"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { SuggestionCard } from "@/components/discover/SuggestionCard";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as discoveryService from "@/services/discoveryService";
import type { SuggestionCard as SuggestionCardType } from "@/services/discoveryService";

export default function DiscoverPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("discover");
  const tc = useTranslations("common");
  const errorMessage = useErrorMessage();
  const today = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date());
  const { status } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestionCardType[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [deciding, setDeciding] = useState(false);

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

    discoveryService
      .fetchDiscoverSuggestions()
      .then((res) => {
        setSuggestions(res.results.filter((s) => s.action === "pending"));
      })
      .catch((err) => setError(errorMessage(err, "loadFailed")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const current = suggestions?.[index];

  const decide = async (action: "connected" | "passed") => {
    if (!current) return;
    setDeciding(true);
    try {
      await discoveryService.decideSuggestion(current.id, action);
      setIndex((i) => i + 1);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-[2px] uppercase" style={{ color: "var(--astralia-lilac)" }}>
          {today}
        </span>
        <HeaderActions />
      </div>

      <h1
        className="mt-2.5 mb-5 text-[27px] font-semibold italic text-center"
        style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
      >
        {t("title")}
      </h1>

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

      {!error && suggestions === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          {t("loading")}
        </p>
      )}

      {!error && suggestions !== null && !current && (
        <div className="flex-grow flex items-center justify-center text-center px-4">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            {t("done")}
          </p>
        </div>
      )}

      {current && <SuggestionCard suggestion={current} onConnect={() => decide("connected")} onPass={() => decide("passed")} loading={deciding} />}

      <BottomNav active="/discover" />
    </main>
  );
}
